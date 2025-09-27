"use server";

import { NextRequest, NextResponse } from "next/server";
import UserModel from "@/models/user";
import OTPVerificationModel from "@/models/otpVerification";

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();
    if (!email || !otp) {
      return NextResponse.json(
        { success: false, error: "Missing email or OTP" },
        { status: 400 }
      );
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }
    if (user.isEmailVerified) {
      return NextResponse.json(
        { success: false, error: "Email already verified" },
        { status: 400 }
      );
    }

    const otpEntry = await OTPVerificationModel.findOne({
      userId: user._id,
      otp,
    });
    if (!otpEntry) {
      return NextResponse.json(
        { success: false, error: "Invalid OTP" },
        { status: 400 }
      );
    }
    if (otpEntry.expiresAt < new Date()) {
      return NextResponse.json(
        { success: false, error: "OTP expired" },
        { status: 400 }
      );
    }

    // Mark user as verified
    user.isEmailVerified = true;
    await user.save();
    // Delete OTP entry
    await OTPVerificationModel.deleteOne({ _id: otpEntry._id });

    return NextResponse.json({
      success: true,
      message: "Email verified successfully.",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "OTP verification failed" },
      { status: 500 }
    );
  }
}
