"use server";

import { NextRequest, NextResponse } from "next/server";
import { verifySMTPConnection, sendOTPEmail } from "@/utils/email";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Test SMTP connection
    const connectionVerified = await verifySMTPConnection();
    if (!connectionVerified) {
      return NextResponse.json(
        {
          error: "SMTP connection failed. Check your credentials.",
          details:
            "Make sure SMTP_USER, SMTP_PASS are set correctly in your environment variables.",
        },
        { status: 500 }
      );
    }

    // Test sending email
    const testOTP = "123456";
    await sendOTPEmail(email, testOTP);

    return NextResponse.json({
      message: "Test email sent successfully!",
      email: email,
      otp: testOTP,
    });
  } catch (error) {
    console.error("Test email error:", error);
    return NextResponse.json(
      {
        error: "Email test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
