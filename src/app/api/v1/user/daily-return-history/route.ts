import { NextRequest, NextResponse } from "next/server";
import TransactionModel from "@/models/transaction";
import { authenticateRequest } from "@/utils/auth";
import { connectDB, isDbConnected } from "@/config/database";

export async function GET(req: NextRequest) {
  try {
    let userInfo;
    try {
      userInfo = authenticateRequest(req);
    } catch {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    if (!isDbConnected) await connectDB();
    const transactions = await TransactionModel.find({
      userId: userInfo.userId,
      type: "daily_return",
    })
      .sort({ date: -1 })
      .lean();
    return NextResponse.json({ success: true, dailyReturns: transactions });
  } catch (err) {
    console.error("[GET /user/daily-return-history]", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch daily return history" },
      { status: 500 }
    );
  }
}
