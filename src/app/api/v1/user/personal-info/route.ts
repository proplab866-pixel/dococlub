import { NextRequest, NextResponse } from "next/server";
import UserModel from "@/models/user";
import { authenticateRequest } from "@/utils/auth";
import { connectDB, isDbConnected } from "@/config/database";

export async function GET(req: NextRequest) {
  try {
    // Authenticate user
    let userInfo;
    try {
      userInfo = authenticateRequest(req);
    } catch (err) {
      return err instanceof Response
        ? err
        : NextResponse.json(
            { success: false, error: "Unauthorized" },
            { status: 401 }
          );
    }

    if (!isDbConnected) await connectDB();

    // Support ?id=... for fetching other users (for referrals)
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const targetUserId = id || userInfo.userId;

    const user = await UserModel.findById(targetUserId).select(
      "name email mobile country gender availableBalance totalInvested referalCode referedBy isEmailVerified level1Referrals level2Referrals level3Referrals commissionRate day dayMax role createdAt"
    );
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Return all user fields needed for the dashboard/referral
    return NextResponse.json(
      { success: true, user: user.toObject() },
      { status: 200 }
    );
  } catch (err) {
    console.error("[GET /user/personal-info]", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch user info" },
      { status: 500 }
    );
  }
}
