import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

if (!JWT_SECRET) {
  throw new Error("Missing JWT_SECRET environment variable");
}

export function signJWT(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
}

export function verifyJWT(token: string): { email: string } {
  try {
    return jwt.verify(token, JWT_SECRET) as { email: string };
  } catch (err) {
    console.error("JWT verification failed:", err);
    throw new Error("Invalid token");
  }
}
