const fs = require("fs");
const path = require("path");

const BASE_URL = "https://eletrostart-p20r.onrender.com";

const parseAdminPairsFromEnvFile = (envText) => {
  const emails = [...envText.matchAll(/^ADMIN_EMAIL\s*=\s*"([^"]*)"\s*$/gm)].map(
    (m) => m[1],
  );
  const passwords = [
    ...envText.matchAll(/^ADMIN_PASSWORD\s*=\s*"([^"]*)"\s*$/gm),
  ].map((m) => m[1]);

  const pairs = [];
  const count = Math.min(emails.length, passwords.length);
  for (let i = 0; i < count; i++) {
    const email = (emails[i] || "").trim();
    const password = (passwords[i] || "").trim();
    if (!email || !password) continue;
    pairs.push({ email, password });
  }
  return pairs;
};

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

const loginAndMe = async ({ email, password }) => {
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

  const result = {
    email,
    loginStatus: loginRes.status,
    loginSuccess: !!(loginJson && loginJson.success),
    meStatus: null,
    meSuccess: false,
    meEmail: null,
  };

  if (!authToken) return result;

  const cookieHeader = [
    `auth_token=${authToken}`,
    csrfToken ? `csrf_token=${csrfToken}` : null,
  ]
    .filter(Boolean)
    .join("; ");

  const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
    method: "GET",
    headers: { accept: "application/json", cookie: cookieHeader },
  });

  const meJson = await meRes.json().catch(() => null);
  result.meStatus = meRes.status;
  result.meSuccess = !!(meJson && meJson.success);
  result.meEmail = meJson?.data?.user?.email ?? null;
  return result;
};

const main = async () => {
  const envPath = path.join(process.cwd(), ".env");
  const envText = fs.readFileSync(envPath, "utf8");
  const pairs = parseAdminPairsFromEnvFile(envText);

  const healthDb = await fetch(`${BASE_URL}/api/health-db`, {
    headers: { accept: "application/json" },
  })
    .then((r) => r.json())
    .catch(() => null);

  const results = [];
  for (const pair of pairs) {
    results.push(await loginAndMe(pair));
  }

  const ok =
    results.length > 0 &&
    results.every(
      (r) =>
        r.loginStatus === 200 &&
        r.loginSuccess &&
        r.meStatus === 200 &&
        r.meSuccess &&
        r.meEmail === r.email,
    );

  process.stdout.write(
    JSON.stringify(
      {
        ok,
        baseUrl: BASE_URL,
        healthDb,
        results,
      },
      null,
      2,
    ) + "\n",
  );

  process.exitCode = ok ? 0 : 2;
};

main().catch((e) => {
  process.stdout.write(
    JSON.stringify({ ok: false, error: e?.message || String(e) }, null, 2) + "\n",
  );
  process.exitCode = 1;
});

