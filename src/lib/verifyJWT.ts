import jwt from "jsonwebtoken";

export function verifyJWT(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    if (!decoded) {
      throw new Error("Invalid token");
    }
    return decoded;
  } catch (err) {
    console.error("JWT verification failed:", err);
    throw err; 
  }
}