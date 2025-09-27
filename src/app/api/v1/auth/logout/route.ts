"use server";

import { NextResponse } from "next/server";
import { serialize } from "cookie";

export async function POST() {
  try {
    // Clear the authentication cookie
    const cookie = serialize("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 0, // Expire immediately
    });

    return NextResponse.json(
      {
        success: true,
        message: "Logged out successfully",
      },
      { status: 200, headers: { "Set-Cookie": cookie } }
    );
  } catch (err) {
    console.error("Logout error:", err);
    return NextResponse.json(
      { success: false, error: "Logout failed" },
      { status: 500 }
    );
  }
}
