import { NextRequest, NextResponse } from "next/server";
import InvestmentPlanModel from "@/models/investmentPlan";
import { requireSuperadmin } from "@/utils/superadminAuth";
import { connectDB, isDbConnected } from "@/config/database";

export async function DELETE(req: NextRequest) {
  // Superadmin check
  const auth = await requireSuperadmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    if (!isDbConnected) await connectDB();
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing plan ID" },
        { status: 400 }
      );
    }
    const deleted = await InvestmentPlanModel.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Plan not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: true, message: "Plan deleted" },
      { status: 200 }
    );
  } catch (err) {
    console.error("[DELETE /superadmin/delete-investment-plan]", err);
    return NextResponse.json(
      { success: false, error: "Failed to delete investment plan" },
      { status: 500 }
    );
  }
}
