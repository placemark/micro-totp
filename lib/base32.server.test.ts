import { decodeBase32, encodeBase32 } from './base32';
import { test, expect } from 'vitest';

test('encode and decode', () => {
  const input = Buffer.from([1, 2, 3]);
  expect(encodeBase32(input)).toEqual('AEBAG');
  expect(decodeBase32('AEBAG')).toEqual(Buffer.from([1, 2, 3]));
  expect(decodeBase32('AEBAG===')).toEqual(Buffer.from([1, 2, 3]));
  expect(() => decodeBase32('•')).toThrowError();
  for (const example of [
    [1, 2, 3],
    [5, 100, 200],
    [5, 100, 200, 200],
    [5, 100, 200, 200, 1],
    [5, 100, 200, 200, 1, 5],
    [5, 100, 200, 200, 1, 5, 1000],
  ]) {
    const buf = Buffer.from(example);
    expect(decodeBase32(encodeBase32(buf))).toEqual(buf);
  }
});
