"use server";

import UserModel from "@/models/user";
import OTPVerificationModel from "@/models/otpVerification";
import { NextRequest, NextResponse } from "next/server";
import { sendOTPEmail } from "@/utils/email";
import { connectDB, isDbConnected } from "@/config/database";

// Utility to generate a 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const { email, purpose } = await req.json();
    if (!email || !purpose) {
      return NextResponse.json(
        { success: false, error: "Email and purpose are required" },
        { status: 400 }
      );
    }
    if (!["verify-email", "reset-password"].includes(purpose)) {
      return NextResponse.json(
        { success: false, error: "Invalid purpose" },
        { status: 400 }
      );
    }

    if (!isDbConnected) await connectDB();

    const user = await UserModel.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Delete any existing OTPs for this user
    await OTPVerificationModel.deleteMany({ userId: user._id });

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry
    await OTPVerificationModel.create({ userId: user._id, otp, expiresAt });

    // Send OTP to email with the correct template based on purpose
    await sendOTPEmail(email, otp, purpose);

    return NextResponse.json(
      { success: true, message: "OTP sent to email." },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Failed to send OTP" },
      { status: 500 }
    );
  }
}
