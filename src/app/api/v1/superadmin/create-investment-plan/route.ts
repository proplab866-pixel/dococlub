import { NextRequest, NextResponse } from "next/server";
import InvestmentPlanModel from "@/models/investmentPlan";
import { requireSuperadmin } from "@/utils/superadminAuth";
import { connectDB, isDbConnected } from "@/config/database";

export async function POST(req: NextRequest) {
  // Superadmin check
  const auth = await requireSuperadmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    if (!isDbConnected) await connectDB();
    const body = await req.json();
    const { name, invest, daily, total, days, roi, benefits, badge, isActive } =
      body;
    if (!name || !invest || !daily || !total || !days || !roi || !benefits) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }
    const plan = await InvestmentPlanModel.create({
      name,
      invest,
      daily,
      total,
      days,
      roi,
      benefits,
      badge,
      isActive: isActive !== undefined ? isActive : true,
    });
    return NextResponse.json({ success: true, plan }, { status: 201 });
  } catch (err) {
    console.error("[POST /superadmin/create-investment-plan]", err);
    return NextResponse.json(
      { success: false, error: "Failed to create investment plan" },
      { status: 500 }
    );
  }
}
