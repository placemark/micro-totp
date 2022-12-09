import { decodeBase32 } from './base32';
import { Buffer } from 'node:buffer';
import type { Opaque } from 'type-fest';
import { intToBytes } from './internal';
import * as crypto from 'crypto';

/*
 * Contains parts of
 * https://github.com/guyht/notp
 */

/**
 * A number type for seconds.
 */
export type Seconds = Opaque<number>;

/**
 * Integer milliseconds
 */
export type Milliseconds = Opaque<number>;

/**
 * Counter. In practice, this is seconds divided
 * by and floored by TIME_STEP_SECONDS
 */
export type Counter = Opaque<number>;

/**
 * https://www.rfc-editor.org/rfc/rfc6238#section-5.2
 *
 * We RECOMMEND a default time-step size of 30 seconds.  This default
 * value of 30 seconds is selected as a balance between security and
 * usability.
 */
const TIME_STEP_SECONDS = 30 as Seconds;

export function toUnixTime(timeMs: Milliseconds): Seconds {
  return (timeMs / 1000) as Seconds;
}

export function toCounter(unixTime: Seconds): Counter {
  return Math.floor(unixTime / TIME_STEP_SECONDS) as Counter;
}

/*
 * The allowable margin for the counter.  The function will check
 * 'W' codes either side of the provided counter.  Note,
 * it is the calling applications responsibility to keep track of
 * 'W' and increment it for each password check, and also to adjust
 * it accordingly in the case where the client and server become
 * out of sync (second argument returns non zero).
 * E.g. if W = 5, and C = 1000, this function will check the passcode
 * against all One Time Passcodes between 995 and 1005.
 */
const TIME_WINDOW = 3;

/**
 * Generate a Time based One Time Password
 *
 * This pages out to the inner method, which is counter-based
 * and shared with HMAC.
 *
 * @returns a six-character numerical string
 */
export function generateTotp({
  keyBase32,
  timeMs,
}: {
  /*
   * Key for the one time password.  This should be unique and secret for
   * every user as it is the seed used to calculate the HMAC.
   * This should be base32-encoded.
   */
  keyBase32: string;
  /**
   * The current time, in millseconds. Most likely sourced from
   * Date.now()
   */
  timeMs: Milliseconds;
}): string {
  const counter = toCounter(toUnixTime(timeMs));

  return generateTotpInner({
    keyBase32,
    counter,
  });
}

/**
 * Inner function for generating a Totp with a counter
 * value instead of a time value.
 *
 * @returns a six-character numerical string
 */
function generateTotpInner({
  keyBase32,
  counter,
}: {
  /**
   * base32-encoded key
   */
  keyBase32: string;
  counter: Counter;
}): string {
  // The counter, as bytes.
  const counterBuffer = Buffer.from(intToBytes(counter));

  // The key, decoded from base32 into bytes.
  const keyBuffer = decodeBase32(keyBase32);

  // Use keyBuffer as the secret for a sha1-based
  // HMAC
  const hmac = crypto.createHmac('sha1', keyBuffer);

  // Update the HMAC with the byte array
  const h = hmac.update(counterBuffer).digest();

  // Truncate
  const offset = h[19] & 0xf;

  // Verbatim from the RFC spec.
  const binary =
    ((h[offset] & 0x7f) << 24) |
    ((h[offset + 1] & 0xff) << 16) |
    ((h[offset + 2] & 0xff) << 8) |
    (h[offset + 3] & 0xff);

  // Make this a 6-digit code. In the RFC spec,
  // this is `DIGITS_POWER[6]`
  const truncated = binary % 1000000;

  return String(truncated).padStart(6, '0');
}

/**
 * Check a One Time Password based on a timer.
 */
export function verifyTotp({
  token,
  keyBase32,
  timeMs,
}: {
  /**
   * Passcode to validate
   */
  token: string;

  /**
   * Key for the one time password.  This should be unique and secret for
   * every user as it is the seed used to calculate the HMAC
   *
   * Encoded as base32
   */
  keyBase32: string;

  /**
   * The current time, from Date.now();
   */
  timeMs: Milliseconds;
}): boolean {
  const counter = toCounter(toUnixTime(timeMs));
  const start = (counter - TIME_WINDOW) as Counter;
  const finish = (counter + TIME_WINDOW) as Counter;

  // Now loop through from C to C + W to determine if there is
  // a correct code
  for (let i = start; i <= finish; ++i) {
    const generatedToken = generateTotpInner({
      keyBase32,
      counter: i,
    });
    if (generatedToken === token) {
      // We have found a matching code, trigger callback
      // and pass offset
      return true;
    }
  }

  // If we get to here then no codes have matched, return null
  return false;
}
