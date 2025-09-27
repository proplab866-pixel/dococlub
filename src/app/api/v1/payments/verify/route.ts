import { NextRequest, NextResponse } from "next/server";
import { verifyPaymentSignature, getRazorpayInstance } from "@/utils/razorpay";
import { authenticateRequest } from "@/utils/auth";
import TransactionModel from "@/models/transaction";
import UserModel from "@/models/user";

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    let userInfo;
    try {
      userInfo = authenticateRequest(req);
    } catch {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { amount } = await req.json();

    if (!amount) {
      return NextResponse.json(
        { success: false, error: "Amount is required" },
        { status: 400 }
      );
    }

    if (amount < 100) {
      return NextResponse.json(
        { success: false, error: "Amount must be greater than ₹100" },
        { status: 400 }
      );
    }

    const user = await UserModel.findById(userInfo.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Generate unique transactionId
    const transactionId = `txn_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    // 1️⃣ Create deposit transaction
    await TransactionModel.create({
      userId: user._id,
      type: "deposit",
      transactionId,
      date: new Date(),
      amount,
      status: "completed",
    });

    // 2️⃣ Update user balance
    user.availableBalance = (user.availableBalance || 0) + amount;
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Amount credited successfully",
      balance: user.availableBalance,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Verification failed" },
      { status: 500 }
    );
  }
}
