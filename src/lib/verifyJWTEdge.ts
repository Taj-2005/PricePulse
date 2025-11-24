import { jwtVerify } from "jose";

export async function verifyJWTEdge(token: string): Promise<boolean> {
  try {
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not set");
      return false;
    }
    
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    await jwtVerify(token, secret);
    return true;
  } catch (err) {
    return false;
  }
}

