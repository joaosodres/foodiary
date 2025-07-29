import { sign } from "jsonwebtoken";

export function generateAccessToken(userId: string) {
  const accessToken = sign({
    sub: userId,
  }, process.env.JWT_SECRET!, {
    expiresIn: '3d',
  });

  return accessToken;
}
