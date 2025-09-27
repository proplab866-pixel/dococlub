import { NextRequest, NextResponse } from "next/server";
import UserModel from "@/models/user";
import OTPVerificationModel from "@/models/otpVerification";
import bcrypt from "bcryptjs";
import { connectDB, isDbConnected } from "@/config/database";

export async function POST(req: NextRequest) {
  try {
    const { email, otp, newPassword } = await req.json();
    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { success: false, error: "Email, OTP, and new password are required" },
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

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    // Delete OTP entry
    await OTPVerificationModel.deleteOne({ _id: otpEntry._id });

    return NextResponse.json(
      { success: true, message: "Password reset successful" },
      { status: 200 }
    );
  } catch (err) {
    console.error("[POST /auth/reset-password]", err);
    return NextResponse.json(
      { success: false, error: "Password reset failed" },
      { status: 500 }
    );
  }
}
