import { test, expect } from 'vitest';
import { intToBytes } from './internal';

test('intToBytes', () => {
  expect(intToBytes(0)).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
  expect(intToBytes(1)).toEqual([0, 0, 0, 0, 0, 0, 0, 1]);
  expect(intToBytes(123456)).toEqual([0, 0, 0, 0, 0, 1, 226, 64]);
});
