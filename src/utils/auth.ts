import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { parse } from "cookie";

const JWT_SECRET = process.env.JWT_SECRET as string;

export interface AuthUser {
  userId: string;
  email: string;
}

/**
 * Authenticate a Next.js API request using JWT from cookie or Authorization header.
 * Throws a 401 response if authentication fails.
 */
export function authenticateRequest(req: NextRequest): AuthUser {
  // Try to get token from cookie
  let token: string | null = null;
  const cookieHeader = req.headers.get("cookie");
  if (cookieHeader) {
    const cookies = parse(cookieHeader);
    if (cookies.token) {
      token = cookies.token as string;
    }
  }
  // If not in cookie, try Authorization header
  if (!token) {
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.replace("Bearer ", "");
    }
  }
  if (!token) {
    throw new Response(
      JSON.stringify({ success: false, error: "Authentication required" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    return decoded;
  } catch (err) {
    console.log(err);
    throw new Response(
      JSON.stringify({ success: false, error: "Invalid or expired token" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
