import { jwtVerify } from "jose";

/**
 * Verify JWT token in Edge runtime (for middleware)
 * Uses jose library which works with Edge runtime
 * Note: jose uses HS256 by default, which matches jsonwebtoken's default
 */
export async function verifyJWTEdge(token: string): Promise<boolean> {
  try {
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not set");
      return false;
    }
    
    // jose expects the secret as a Uint8Array or string
    // Since jsonwebtoken uses string secrets, we'll use the string directly
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    await jwtVerify(token, secret);
    return true;
  } catch (err) {
    // Token is invalid or expired
    return false;
  }
}

