import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not configured");
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function checkPassword(
  password: string,
  hash: string
): boolean {
  return bcrypt.compareSync(password, hash);
}

export function createToken(user: {
  id: number | string;
  email: string;
  isAdmin?: boolean;
}): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      isAdmin: !!user.isAdmin,
    },
    JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET);
}