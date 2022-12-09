import {
  generateTotp,
  Milliseconds,
  toUnixTime,
  toCounter,
  verifyTotp,
} from './totp';
import { test, expect } from 'vitest';

const keyBase32 = 'AQVHBSZPROHVJFLV';
const timeMs = 1666120723459 as Milliseconds;
// 120 seconds
const drift = (1 * 1000 * 120) as Milliseconds;

test('toUnixtime', () => {
  expect(toUnixTime(timeMs)).toEqual(1666120723.459);
  expect(toCounter(toUnixTime((timeMs + 10) as Milliseconds))).toEqual(
    55537357
  );
  expect(toCounter(toUnixTime((timeMs + drift) as Milliseconds))).toEqual(
    55537361
  );
});

test('genTotp', () => {
  expect(
    generateTotp({
      keyBase32: '0000',
      timeMs: 1666111090825 as Milliseconds,
    })
  ).toEqual('846377');
});

test('verifyTotp', () => {
  const token = generateTotp({
    keyBase32,
    timeMs,
  });

  expect(token).toEqual('788553');

  expect(
    verifyTotp({
      token,
      keyBase32,
      timeMs,
    })
  ).toBeTruthy();

  expect(
    verifyTotp({
      token,
      keyBase32,
      timeMs: (timeMs - 10) as Milliseconds,
    })
  ).toBeTruthy();

  expect(
    verifyTotp({
      token,
      keyBase32,
      timeMs: (timeMs - drift) as Milliseconds,
    })
  ).toBeFalsy();
});
