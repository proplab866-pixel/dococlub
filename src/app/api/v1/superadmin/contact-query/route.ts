import { NextRequest, NextResponse } from "next/server";
import ContactQueryModel from "@/models/contactQuery";
import { connectDB, isDbConnected } from "@/config/database";
import { requireSuperadmin } from "@/utils/superadminAuth";

export async function GET(req: NextRequest) {
  // Superadmin auth check
  const auth = await requireSuperadmin(req);
  if (auth instanceof NextResponse) return auth;
  if (!isDbConnected) await connectDB();
  try {
    const queries = await ContactQueryModel.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, queries });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch queries." },
      { status: 500 }
    );
  }
}
