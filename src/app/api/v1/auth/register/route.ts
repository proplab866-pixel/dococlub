// "use server";

// import { NextRequest, NextResponse } from "next/server";
// import UserModel from "@/models/user";
// import OTPVerificationModel from "@/models/otpVerification";
// import bcrypt from "bcryptjs";
// import mongoose from "mongoose";
// import { sendOTPEmail } from "@/utils/email";
// import { processReferral, assignReferralCode } from "@/utils/referral";
// import { connectDB, isDbConnected } from "@/config/database";

// // Utility to generate a 6-digit OTP
// function generateOTP() {
//   return Math.floor(100000 + Math.random() * 900000).toString();
// }

// export async function POST(req: NextRequest) {
//   try {
//     // Remove rate limiting logic
//     const { name, email, password, referalCode } = await req.json();
//     if (!name || !email || !password) {
//       return NextResponse.json(
//         { success: false, error: "Missing required fields" },
//         { status: 400 }
//       );
//     }

//     if (!isDbConnected) await connectDB();

//     // Check if user already exists
//     const existing = await UserModel.findOne({ email });
//     if (existing) {
//       // Generic error to prevent email enumeration
//       return NextResponse.json(
//         { success: false, error: "Registration failed. Please try again." },
//         { status: 409 }
//       );
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create user (isEmailVerified: false)
//     const user = await UserModel.create({
//       name,
//       email,
//       password: hashedPassword,
//       isEmailVerified: false,
//     });

//     // Assign unique referral code to new user
//     await assignReferralCode(user._id as mongoose.Types.ObjectId);

//     // Process referral if referral code provided
//     if (referalCode) {
//       try {
//         await processReferral(user._id as mongoose.Types.ObjectId, referalCode);
//       } catch (error) {
//         console.error("Referral processing failed:", error);
//         // Continue with registration even if referral fails
//       }
//     }

//     // Generate OTP
//     const otp = generateOTP();
//     const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry
//     await OTPVerificationModel.create({ userId: user._id, otp, expiresAt });

//     // Send OTP to email (real email)
//     await sendOTPEmail(email, otp);

//     return NextResponse.json(
//       {
//         success: true,
//         message: "User registered. OTP sent to email.",
//       },
//       { status: 200 }
//     );
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json(
//       { success: false, error: "Registration failed" },
//       { status: 500 }
//     );
//   }
// }

"use server";

import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import UserModel from "@/models/user";
import OTPVerificationModel from "@/models/otpVerification";
import { sendOTPEmail } from "@/utils/email";
import { processReferral, assignReferralCode } from "@/utils/referral";
import { connectDB, isDbConnected } from "@/config/database";

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, referalCode } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    if (!isDbConnected) await connectDB();

    const existing = await UserModel.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "User already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await UserModel.create({
      name,
      email,
      password: hashedPassword,
      isEmailVerified: false,
    });

    try {
      await assignReferralCode(user._id as mongoose.Types.ObjectId);
    } catch (err) {
      console.error("Referral code assignment failed:", err);
    }

    if (referalCode) {
      try {
        await processReferral(user._id as mongoose.Types.ObjectId, referalCode);
      } catch (err) {
        console.error("Referral processing failed:", err);
      }
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await OTPVerificationModel.create({
      userId: user._id,
      otp,
      expiresAt,
    });

    try {
      await sendOTPEmail(email, otp);
    } catch (err) {
      console.error("OTP email sending failed:", err);
    }

    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully. OTP sent to email.",
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Register API error:", err.message, err.stack);
    return NextResponse.json(
      {
        success: false,
        error: "Registration failed",
        details: err.message,
      },
      { status: 500 }
    );
  }
}