import { NextRequest, NextResponse } from "next/server";
import UserModel from "@/models/user";
import TransactionModel from "@/models/transaction";
import { requireSuperadmin } from "@/utils/superadminAuth";
import { connectDB, isDbConnected } from "@/config/database";

export async function GET(req: NextRequest) {
  // Superadmin check
  const auth = await requireSuperadmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    if (!isDbConnected) await connectDB();
    // Total invested (sum of all investment transactions)
    const investedAgg = await TransactionModel.aggregate([
      { $match: { type: "investment", status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalInvested = investedAgg[0]?.total || 0;
    // Total users' profit (sum of all daily_return transactions)
    const profitAgg = await TransactionModel.aggregate([
      { $match: { type: "daily_return", status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalProfit = profitAgg[0]?.total || 0;
    // Total users (excluding superadmin)
    const totalUsers = await UserModel.countDocuments({
      role: { $ne: "superadmin" },
    });
    // Total deposits
    const depositAgg = await TransactionModel.aggregate([
      { $match: { type: "deposit", status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalDeposits = depositAgg[0]?.total || 0;
    // Total withdrawals
    const withdrawAgg = await TransactionModel.aggregate([
      { $match: { type: "withdraw", status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalWithdrawals = withdrawAgg[0]?.total || 0;
    // New users today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newUsersToday = await UserModel.countDocuments({
      role: { $ne: "superadmin" },
      createdAt: { $gte: today },
    });
    return NextResponse.json({
      success: true,
      totalInvested,
      totalProfit,
      totalUsers,
      totalDeposits,
      totalWithdrawals,
      newUsersToday,
    });
  } catch (err) {
    console.error("[GET /superadmin/analytics]", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
