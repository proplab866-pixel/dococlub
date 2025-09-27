import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/utils/razorpay";
import { authenticateRequest } from "@/utils/auth";

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    let user;
    try {
      user = authenticateRequest(req);
    } catch {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { amount } = await req.json(); // amount in paise (e.g., 50000 = ₹500)
    if (!amount || amount < 100) {
      return NextResponse.json({ success: false, error: "Invalid amount" }, { status: 400 });
    }

    // Use only the first 16 chars of userId and Date.now()
    const shortUserId = String(user.userId).slice(0, 16);
    const shortReceipt = `u_${shortUserId}_${Date.now()}`.slice(0, 40);

    const order = await createOrder(amount, "INR", shortReceipt);

    return NextResponse.json({ success: true, order });
  } catch (err) {
    console.error("Order creation error:", err);
    return NextResponse.json({ success: false, error: "Order creation failed" }, { status: 500 });
  }
} 