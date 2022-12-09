/**
 * Convert an integer to a byte array
 */
export function intToBytes(num: number) {
  const bytes: number[] = [];

  for (let i = 7; i >= 0; --i) {
    bytes[i] = num & 255;
    num = num >> 8;
  }

  return bytes;
}
