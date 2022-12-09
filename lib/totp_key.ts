import { encodeBase32 } from './base32';

/**
 * Generate a Google Authenticator-friendly URL
 * for setting up TOTP authentication.
 *
 * https://github.com/google/google-authenticator/wiki/Key-Uri-Format
 */
export function otpUrl({
  name,
  secret,
}: {
  /**
   * Application name: will be shown in the TOTP app.
   */
  name: string;
  /**
   * Issuer: probably the company that produces
   * the application.
   */
  issuer: string;
  /**
   * Secret: the string that will seed this TOTP.
   */
  secret: string;
}) {
  const search = new URLSearchParams({
    secret,
    issuer,
  });
  const url = new URL(`otpauth://totp/${name}?${search.toString()}`);
  return url.toString();
}

/**
 * Client-side API: generate a key with
 * crypto.subtle, and return it as base32.
 */
export async function getKey() {
  const key = await window.crypto.subtle.generateKey(
    {
      name: 'HMAC',
      hash: { name: 'SHA-512' },
    },
    true,
    ['verify']
  );
  const arrayBuffer = await window.crypto.subtle.exportKey('raw', key);
  const bytes = new Uint8Array(arrayBuffer.slice(0, 10));
  return encodeBase32(bytes);
}
