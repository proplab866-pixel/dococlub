import { NextResponse } from "next/server";
import InvestmentPlanModel from "@/models/investmentPlan";
import { connectDB, isDbConnected } from "@/config/database";

export async function GET() {
  try {
    if (!isDbConnected) await connectDB();
    const plans = await InvestmentPlanModel.find({ isActive: true }).sort({
      invest: 1,
    });
    return NextResponse.json({ success: true, plans }, { status: 200 });
  } catch (err) {
    console.error("[GET /investment-plans]", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch investment plans" },
      { status: 500 }
    );
  }
}
