import { NextRequest, NextResponse } from "next/server";
import UserModel from "@/models/user";
import InvestmentPlanModel from "@/models/investmentPlan";
import TransactionModel from "@/models/transaction";
import { authenticateRequest } from "@/utils/auth";
import { connectDB, isDbConnected } from "@/config/database";
import mongoose from "mongoose";

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

    if (!isDbConnected) await connectDB();

    const { planId } = await req.json();
    if (!planId || !mongoose.Types.ObjectId.isValid(planId)) {
      return NextResponse.json(
        { success: false, error: "Invalid planId" },
        { status: 400 }
      );
    }

    // Fetch plan
    const plan = await InvestmentPlanModel.findById(planId);
    if (!plan || !plan.isActive) {
      return NextResponse.json(
        { success: false, error: "Plan not found or inactive" },
        { status: 404 }
      );
    }

    // Fetch user
    const user = await UserModel.findById(userInfo.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Check balance
    if ((user.availableBalance || 0) < plan.invest) {
      return NextResponse.json(
        { success: false, error: "Insufficient balance" },
        { status: 400 }
      );
    }

    // Deduct balance
    user.availableBalance -= plan.invest;
    user.totalInvested = (user.totalInvested || 0) + plan.invest;

    // Add to activeInvestments
    user.activeInvestments.push({
      planId: plan._id,
      amount: plan.invest,
      startDate: new Date(),
      daysCompleted: 0,
      isActive: true,
    });

    // Add plan ROI to user's commissionRate
    user.commissionRate = (user.commissionRate || 0) + (plan.roi || 0);

    // Create investment transaction
    await TransactionModel.create({
      userId: user._id,
      type: "investment",
      transactionId: `INVEST_${user._id}_${Date.now()}`,
      date: new Date(),
      amount: plan.invest,
      status: "completed",
      planId: plan._id,
    });

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Investment successful",
      availableBalance: user.availableBalance,
      totalInvested: user.totalInvested,
    });
  } catch (err) {
    console.error("[POST /user/invest-in-plan]", err);
    return NextResponse.json(
      { success: false, error: "Investment failed" },
      { status: 500 }
    );
  }
}
