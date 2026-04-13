const fs = require("fs");
const path = require("path");

const DEFAULT_BASE_URL = "https://eletrostart-p20r.onrender.com";
const BASE_URL = (process.env.BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, "");

const DEFAULT_CSV_PATH = path.resolve(process.cwd(), "..", "lista_produtos_antigravity.csv");
const CSV_PATH = process.env.CSV_PATH
  ? path.resolve(process.cwd(), process.env.CSV_PATH)
  : DEFAULT_CSV_PATH;

const PUBLIC_ROOT = path.resolve(process.cwd(), "..", "public");

const EXT_TO_MIME = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const getSetCookieArray = (headers) => {
  if (typeof headers.getSetCookie === "function") return headers.getSetCookie();
  const raw = headers.get("set-cookie");
  return raw ? [raw] : [];
};

const getCookieValue = (setCookieHeaders, name) => {
  for (const v of setCookieHeaders) {
    const m = v.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
    if (m) return m[1];
  }
  return null;
};

const parseEnvValue = (envText, key) => {
  const m = envText.match(new RegExp(`^${key}\\s*=\\s*\"?([^\"\\n\\r]*)\"?\\s*$`, "m"));
  return m ? (m[1] || "").trim() : "";
};

const getCookieHeader = ({ authToken, csrfToken }) =>
  [`auth_token=${authToken}`, csrfToken ? `csrf_token=${csrfToken}` : null]
    .filter(Boolean)
    .join("; ");

const login = async ({ email, password }) => {
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const loginJson = await loginRes.json().catch(() => null);
  const setCookies = getSetCookieArray(loginRes.headers);
  const authToken = getCookieValue(setCookies, "auth_token");
  const csrfToken = getCookieValue(setCookies, "csrf_token");

  return {
    ok: loginRes.status === 200 && !!(loginJson && loginJson.success) && !!authToken,
    status: loginRes.status,
    authToken,
    csrfToken,
  };
};

const fetchJson = async (url, options) => {
  const res = await fetch(url, options);
  const json = await res.json().catch(() => null);
  return { res, json };
};

const fetchJsonWithRetry = async (url, options, retryOptions) => {
  const retries =
    typeof retryOptions?.retries === "number" ? retryOptions.retries : 5;
  const baseDelayMs =
    typeof retryOptions?.baseDelayMs === "number" ? retryOptions.baseDelayMs : 1500;
  const retryOnStatuses = Array.isArray(retryOptions?.retryOnStatuses)
    ? retryOptions.retryOnStatuses
    : [429, 502, 503, 504];

  let last;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      last = await fetchJson(url, options);
    } catch (e) {
      last = { res: null, json: null, error: e };
    }

    const status = last?.res?.status;
    const shouldRetry =
      attempt < retries &&
      (status ? retryOnStatuses.includes(status) : true);

    if (!shouldRetry) return last;

    const delayMs = baseDelayMs * Math.pow(2, attempt);
    await sleep(delayMs);
  }

  return last;
};

const readCsvRows = (csvText) => {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];

  const header = lines[0].split(";").map((x) => x.trim());
  const colIndex = (name) => header.findIndex((h) => h.toLowerCase() === name.toLowerCase());

  const idxId = colIndex("ID");
  const idxImagem = colIndex("Imagem");
  if (idxId < 0 || idxImagem < 0) {
    throw new Error(`CSV inválido: precisa ter colunas "ID" e "Imagem". Header: ${header.join(", ")}`);
  }

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const raw = lines[i];
    const parts = raw.split(";");
    const sku = (parts[idxId] || "").trim();
    const imagePath = (parts[idxImagem] || "").trim();
    if (!sku) continue;
    rows.push({ sku, imagePath });
  }
  return rows;
};

const resolveLocalImagePath = (csvImagePath) => {
  if (!csvImagePath) return null;
  const normalized = csvImagePath.trim().replace(/\\/g, "/");
  if (!normalized.startsWith("/")) return path.resolve(PUBLIC_ROOT, normalized);
  return path.resolve(PUBLIC_ROOT, normalized.replace(/^\/+/, ""));
};

const buildMimeAndFilename = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  const mime = EXT_TO_MIME[ext] || "application/octet-stream";
  const filename = path.basename(filePath);
  return { mime, filename };
};

const uploadImageForProduct = async ({ cookieHeader, csrfToken, productId, filePath }) => {
  const buffer = fs.readFileSync(filePath);
  const { mime, filename } = buildMimeAndFilename(filePath);

  const form = new FormData();
  form.append("files", new Blob([buffer], { type: mime }), filename);

  const { res, json } = await fetchJsonWithRetry(
    `${BASE_URL}/api/ecommerce/products/${encodeURIComponent(productId)}/images/upload`,
    {
      method: "POST",
      headers: {
        accept: "application/json",
        cookie: cookieHeader,
        ...(csrfToken ? { "x-csrf-token": csrfToken } : {}),
      },
      body: form,
    },
    { retries: 6, baseDelayMs: 1500, retryOnStatuses: [429, 502, 503, 504] },
  );

  const status = res?.status;
  if (status !== 201 || !json?.success) {
    const message = json?.message || `Upload falhou (HTTP ${status || "?"})`;
    throw new Error(message);
  }

  const url = json?.data?.[0]?.url;
  if (!url) throw new Error("Upload retornou sucesso, mas sem URL.");
  return url;
};

const setProductMainImage = async ({ cookieHeader, csrfToken, productId, url }) => {
  const { res, json } = await fetchJsonWithRetry(
    `${BASE_URL}/api/ecommerce/products/${encodeURIComponent(productId)}`,
    {
      method: "PATCH",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        cookie: cookieHeader,
        ...(csrfToken ? { "x-csrf-token": csrfToken } : {}),
      },
      body: JSON.stringify({ image: url, images: [url] }),
    },
    { retries: 6, baseDelayMs: 1500, retryOnStatuses: [429, 502, 503, 504] },
  );

  const status = res?.status;
  if (status !== 200 || !json?.success) {
    const message = json?.message || `Atualização falhou (HTTP ${status || "?"})`;
    throw new Error(message);
  }
};

const main = async () => {
  const envPath = path.resolve(process.cwd(), ".env");
  const envText = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";

  const email = (process.env.ADMIN_EMAIL || parseEnvValue(envText, "ADMIN_EMAIL")).trim();
  const password = (process.env.ADMIN_PASSWORD || parseEnvValue(envText, "ADMIN_PASSWORD")).trim();

  if (!email || !password) {
    throw new Error(
      'ADMIN_EMAIL/ADMIN_PASSWORD não encontrados. Defina no .env do server ou como variáveis de ambiente.',
    );
  }

  if (!fs.existsSync(CSV_PATH)) {
    throw new Error(`CSV não encontrado em: ${CSV_PATH}`);
  }

  const csvText = fs.readFileSync(CSV_PATH, "utf8");
  const rows = readCsvRows(csvText);

  const dryRun = String(process.env.DRY_RUN || "").trim() === "1";
  const onlySku = String(process.env.ONLY_SKU || "").trim();
  const limitRaw = String(process.env.LIMIT || "").trim();
  const limit = limitRaw ? Math.max(0, parseInt(limitRaw, 10) || 0) : 0;
  const filteredRows = onlySku ? rows.filter((r) => r.sku === onlySku) : rows;
  const effectiveRows = limit > 0 ? filteredRows.slice(0, limit) : filteredRows;
  const delayMsRaw = String(process.env.DELAY_MS || "").trim();
  const delayMs = delayMsRaw ? Math.max(0, parseInt(delayMsRaw, 10) || 0) : 250;

  const loginResult = await login({ email, password });
  if (!loginResult.ok) {
    throw new Error(`Login falhou (HTTP ${loginResult.status}).`);
  }

  const cookieHeader = getCookieHeader(loginResult);
  const csrfToken = loginResult.csrfToken;

  const summary = {
    baseUrl: BASE_URL,
    csvPath: CSV_PATH,
    totalRows: effectiveRows.length,
    uploaded: 0,
    skippedAlreadyCloudinary: 0,
    skippedMissingImagePath: 0,
    skippedMissingFile: 0,
    errors: 0,
  };

  for (const row of effectiveRows) {
    const sku = row.sku;
    const imagePath = row.imagePath;

    if (!imagePath) {
      summary.skippedMissingImagePath++;
      continue;
    }

    const localPath = resolveLocalImagePath(imagePath);
    if (!localPath || !fs.existsSync(localPath)) {
      summary.skippedMissingFile++;
      process.stdout.write(`MISS_FILE ${sku} ${imagePath}\n`);
      continue;
    }

    const { res: getRes, json: getJson } = await fetchJsonWithRetry(
      `${BASE_URL}/api/ecommerce/products/${encodeURIComponent(sku)}`,
      { method: "GET", headers: { accept: "application/json", cookie: cookieHeader } },
      { retries: 6, baseDelayMs: 1500, retryOnStatuses: [429, 502, 503, 504] },
    );

    if (getRes?.status !== 200 || !getJson?.success || !getJson?.data?.id) {
      summary.errors++;
      process.stdout.write(`ERR_GET ${sku} HTTP ${getRes?.status || "?"}\n`);
      if (delayMs) await sleep(delayMs);
      continue;
    }

    const product = getJson.data;
    if (typeof product.image === "string" && product.image.includes("res.cloudinary.com")) {
      summary.skippedAlreadyCloudinary++;
      if (delayMs) await sleep(delayMs);
      continue;
    }

    if (dryRun) {
      process.stdout.write(`DRY_RUN ${sku} ${localPath}\n`);
      if (delayMs) await sleep(delayMs);
      continue;
    }

    try {
      const url = await uploadImageForProduct({
        cookieHeader,
        csrfToken,
        productId: product.id,
        filePath: localPath,
      });

      await setProductMainImage({
        cookieHeader,
        csrfToken,
        productId: product.id,
        url,
      });

      summary.uploaded++;
      process.stdout.write(`OK ${sku} ${url}\n`);
    } catch (e) {
      summary.errors++;
      process.stdout.write(`ERR_UPD ${sku} ${e?.message || String(e)}\n`);
    }

    if (delayMs) await sleep(delayMs);
  }

  process.stdout.write(JSON.stringify({ ok: summary.errors === 0, summary }, null, 2) + "\n");
  process.exitCode = summary.errors === 0 ? 0 : 2;
};

main().catch((e) => {
  process.stdout.write(JSON.stringify({ ok: false, error: e?.message || String(e) }, null, 2) + "\n");
  process.exitCode = 1;
});

