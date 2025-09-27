import { NextRequest, NextResponse } from "next/server";
import UserModel from "@/models/user";
import { authenticateRequest } from "@/utils/auth";
import { connectDB, isDbConnected } from "@/config/database";

export async function PATCH(req: NextRequest) {
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

    const body = await req.json();
    const allowedFields = ["name", "mobile", "country", "gender"];
    const update: Record<string, string> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) update[field] = body[field];
    }
    if (Object.keys(update).length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const user = await UserModel.findByIdAndUpdate(
      userInfo.userId,
      { $set: update },
      {
        new: true,
        select:
          "name email mobile country gender availableBalance totalInvested referalCode referedBy isEmailVerified level1Referrals level2Referrals level3Referrals commissionRate day dayMax role createdAt",
      }
    );
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: true, user: user.toObject() },
      { status: 200 }
    );
  } catch (err) {
    console.error("[PATCH /user/update-personal-info]", err);
    return NextResponse.json(
      { success: false, error: "Failed to update user info" },
      { status: 500 }
    );
  }
}
