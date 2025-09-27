import { NextRequest, NextResponse } from "next/server";
import UserModel from "@/models/user";
import InvestmentPlanModel from "@/models/investmentPlan";
import TransactionModel from "@/models/transaction";
import { requireSuperadmin } from "@/utils/superadminAuth";
import { connectDB, isDbConnected } from "@/config/database";
import { creditReferralCommission } from "@/utils/referral";

export async function POST(req: NextRequest) {
  // Superadmin check
  const auth = await requireSuperadmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    if (!isDbConnected) await connectDB();
    const users = await UserModel.find({
      "activeInvestments.0": { $exists: true },
    });
    let totalCredits = 0;
    let totalUsers = 0;
    const creditedInvestments = [];

    for (const user of users) {
      let updated = false;
      for (const inv of user.activeInvestments) {
        if (!inv.isActive) continue;
        const plan = await InvestmentPlanModel.findById(inv.planId);
        if (!plan) continue;
        if (inv.daysCompleted >= plan.days) {
          inv.isActive = false;
          continue;
        }
        // Credit daily return
        user.availableBalance += plan.daily;
        inv.daysCompleted += 1;
        updated = true;
        totalCredits++;
        creditedInvestments.push({
          userEmail: user.email,
          planName: plan.name,
          amount: plan.daily,
        });
        // Mark as inactive if completed
        if (inv.daysCompleted >= plan.days) {
          inv.isActive = false;
        }
        // Create daily_return transaction
        await TransactionModel.create({
          userId: user._id,
          type: "daily_return",
          transactionId: `DAILY_${user._id}_${plan._id}_${Date.now()}`,
          date: new Date(),
          amount: plan.daily,
          status: "completed",
          planId: plan._id,
        });
        // Credit referral commissions for this daily return
        await creditReferralCommission(user._id, plan.daily, plan._id);
      }
      if (updated) {
        await user.save();
        totalUsers++;
      }
    }
    return NextResponse.json({
      success: true,
      totalUsers,
      totalCredits,
      creditedInvestments,
    });
  } catch (err) {
    console.error("[POST /superadmin/credit-daily-returns]", err);
    return NextResponse.json(
      { success: false, error: "Failed to credit daily returns" },
      { status: 500 }
    );
  }
}
