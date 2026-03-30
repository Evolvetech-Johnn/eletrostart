/**
 * Utilitários de normalização de parâmetros HTTP
 *
 * Query params no Express são tipados como:
 *   string | ParsedQs | string[] | ParsedQs[] | undefined
 *
 * Este módulo centraliza a normalização segura dessas entradas,
 * eliminando a necessidade de `as string` ou `@ts-ignore` nos controllers.
 */

// ─── Query Params ─────────────────────────────────────────────────────────────

/**
 * Normaliza um query param do Express para `string`.
 *
 * Usa `unknown` como entrada para aceitar qualquer tipo retornado pelo Express
 * (string | ParsedQs | string[] | ParsedQs[] | undefined) sem conflitos de tipos.
 *
 * Comportamento:
 *   - string         → retorna o valor
 *   - string[]       → retorna o primeiro elemento
 *   - array misto    → retorna primeiro string encontrada, ou ""
 *   - objeto/null/undefined → retorna ""
 *
 * @example
 *   const limit = normalizeQueryParam(req.query.limit); // sempre string
 */
export const normalizeQueryParam = (param: unknown): string => {
  if (param == null) return "";
  if (typeof param === "string") return param;
  if (Array.isArray(param)) {
    const first = param[0];
    return typeof first === "string" ? first : "";
  }
  // ParsedQs (objeto aninhado) — não é um valor escalar primitivo
  return "";
};

/**
 * Normaliza um query param para `string | undefined`.
 * Útil quando ausência do parâmetro tem semântica diferente de vazio.
 *
 * @example
 *   const status = normalizeQueryParamOptional(req.query.status);
 *   if (status) where.status = status;
 */
export const normalizeQueryParamOptional = (param: unknown): string | undefined => {
  const value = normalizeQueryParam(param);
  return value === "" ? undefined : value;
};

// ─── Route Params ─────────────────────────────────────────────────────────────

/**
 * Normaliza um route param (req.params.*) para `string`.
 * req.params é sempre `Record<string, string>` no runtime do Express.
 *
 * @example
 *   const id = normalizeRouteParam(req.params.id);
 */
export const normalizeRouteParam = (
  param: string | string[] | undefined | null
): string => {
  if (Array.isArray(param)) return param[0] ?? "";
  if (param == null) return "";
  return param;
};

// ─── Safe Index Access ────────────────────────────────────────────────────────

/**
 * Acessa um Record com uma chave que pode ser null/undefined de forma segura.
 * Retorna `undefined` em vez de lançar TS2538 em tempo de compilação.
 *
 * @param map - O Record a ser acessado
 * @param key - A chave possivelmente nula (ex: campo nullable do Prisma)
 *
 * @example
 *   const customer = safeIndexAccess(customerMap, order.customerEmail);
 */
export const safeIndexAccess = <T>(
  map: Record<string, T>,
  key: string | null | undefined
): T | undefined => {
  if (key == null || key === "") return undefined;
  return map[key];
};
