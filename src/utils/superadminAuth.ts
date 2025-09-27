import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import UserModel from "@/models/user";
import { connectDB, isDbConnected } from "@/config/database";

interface JWTPayload {
  userId: string;
  email: string;
}

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function requireSuperadmin(req: NextRequest) {
  try {
    // Get token from Authorization header or cookie
    let token = null;
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.replace("Bearer ", "");
    } else if (req.cookies.has("token")) {
      token = req.cookies.get("token")?.value;
    }
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify JWT
    let payload: JWTPayload;
    try {
      payload = jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (err) {
      console.error("Invalid token:", err);
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    if (!isDbConnected) await connectDB();
    const user = await UserModel.findById(payload.userId).select("role");
    if (!user || user.role !== "superadmin") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Superadmin only" },
        { status: 403 }
      );
    }

    // Return user for use in handler if needed
    return { user };
  } catch (err) {
    console.error("Superadmin check failed:", err);
    return NextResponse.json(
      { success: false, error: "Superadmin check failed" },
      { status: 500 }
    );
  }
}
