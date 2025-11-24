import jwt from "jsonwebtoken";

/**
 * Verify JWT token and return decoded payload
 * Returns null if token is invalid (for API routes)
 * Throws error for middleware (which uses try/catch)
 */
export function verifyJWT(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    if (!decoded) {
      throw new Error("Invalid token");
    }
    return decoded;
  } catch (err) {
    console.error("JWT verification failed:", err);
    throw err; // Throw for middleware try/catch pattern
  }
}