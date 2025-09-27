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

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      await req.json();
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, error: "Missing payment details" },
        { status: 400 }
      );
    }

    const isValid = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid payment razorpay_signature" },
        { status: 400 }
      );
    }

    // Fetch the actual order amount from Razorpay
    const razorpay = getRazorpayInstance();
    let order;
    try {
      order = await razorpay.orders.fetch(razorpay_order_id);
    } catch {
      return NextResponse.json(
        { success: false, error: "Failed to fetch order from Razorpay" },
        { status: 500 }
      );
    }
    const amount = (order?.amount as number) / 100 || 0; // amount is in paise

    const user = await UserModel.findById(userInfo.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Save transaction
    await TransactionModel.create({
      userId: user._id,
      type: "deposit",
      transactionId: razorpay_payment_id,
      date: new Date(),
      amount: amount,
      status: "completed",
    });

    // Update user balance
    user.availableBalance = (user.availableBalance || 0) + amount;
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Payment verified",
      balance: user.availableBalance,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Verification failed" },
      { status: 500 }
    );
  }
}
