import { otpUrl } from './otp_url';
import { test, expect } from 'vitest';

test('otpUrl', () => {
  expect(
    otpUrl({
      issuer: 'Test',
      name: 'Demo',
      secret: 'AAA',
    })
  ).toEqual('otpauth://totp/Demo?secret=AAA&issuer=Test');
});
