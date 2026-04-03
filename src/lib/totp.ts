import { TOTP, Secret } from 'otpauth';

const ISSUER = 'WME Admin';

export function generateTOTPSecret(username: string) {
  const secret = new Secret();

  const totp = new TOTP({
    issuer: ISSUER,
    label: username,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret,
  });

  return {
    secret: secret.base32,
    uri: totp.toString(),
  };
}

export function verifyTOTP(secret: string, code: string): boolean {
  const totp = new TOTP({
    issuer: ISSUER,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: Secret.fromBase32(secret),
  });

  // Allow 1 period of drift (30 seconds before/after)
  const delta = totp.validate({ token: code, window: 1 });
  return delta !== null;
}
