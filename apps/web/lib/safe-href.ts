/**
 * A URL that is safe to use as an href, or undefined. Document and attestation
 * references come from third parties (a contract string, an issuer toml), so
 * only http(s) values become links; javascript:, data: and the like do not.
 * ipfs:// is not a web link and is shown as text.
 */
export function safeHref(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  try {
    const u = new URL(value.trim());
    return u.protocol === "https:" || u.protocol === "http:" ? u.href : undefined;
  } catch {
    return undefined;
  }
}
