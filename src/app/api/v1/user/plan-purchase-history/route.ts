import { NextRequest, NextResponse } from "next/server";
import UserModel from "@/models/user";
import InvestmentPlanModel from "@/models/investmentPlan";
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
    // Define minimal types
    type Investment = {
      planId: string;
      amount: number;
      startDate: string | Date;
      daysCompleted: number;
      isActive: boolean;
    };
    type Plan = {
      name: string;
      invest: number;
      daily: number;
      days: number;
      roi: number;
      badge?: string;
    };
    type UserWithInvestments = {
      activeInvestments: Investment[];
    };
    const user = (await UserModel.findById(
      userInfo.userId
    ).lean()) as UserWithInvestments | null;
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }
    // Batch fetch all plan details
    const planIds = (user.activeInvestments || []).map((inv) => inv.planId);
    const plans = await InvestmentPlanModel.find({ _id: { $in: planIds } })
      .lean()
      .select("_id name invest daily days roi badge");
    const planMap = new Map<string, Plan>();
    plans.forEach((plan) =>
      planMap.set(String(plan._id), plan as unknown as Plan)
    );
    // Attach plan details to each investment
    const investments = (user.activeInvestments || []).map(
      (inv: Investment) => {
        const plan = planMap.get(inv.planId.toString());
        return {
          ...inv,
          plan: plan
            ? {
                name: plan.name,
                invest: plan.invest,
                daily: plan.daily,
                days: plan.days,
                roi: plan.roi,
                badge: plan.badge,
              }
            : null,
        };
      }
    );
    // Sort by startDate descending
    investments.sort(
      (a, b) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
    return NextResponse.json({ success: true, investments });
  } catch (err) {
    console.error("[GET /user/plan-purchase-history]", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch plan purchase history" },
      { status: 500 }
    );
  }
}
