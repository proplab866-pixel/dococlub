"use server";

import { NextRequest, NextResponse } from "next/server";
import UserModel from "@/models/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB, isDbConnected } from "@/config/database";
import { serialize } from "cookie";

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = "24h";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (!isDbConnected) await connectDB();

    const user = await UserModel.findOne({ email });
    if (!user || !user.isEmailVerified) {
      // Generic error to prevent email enumeration
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Generic error to prevent password enumeration
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Exclude password from user info
    const userInfo = user.toObject();
    delete userInfo.password;

    // Set cookie
    const cookie = serialize("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return NextResponse.json(
      {
        success: true,
        message: "Login successful",
        user: userInfo,
      },
      { status: 200, headers: { "Set-Cookie": cookie } }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Login failed" },
      { status: 500 }
    );
  }
}
