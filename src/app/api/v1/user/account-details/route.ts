import { NextRequest, NextResponse } from "next/server";
import AccountDetailsModel from "@/models/accountDetails";
import { authenticateRequest } from "@/utils/auth";
import { connectDB, isDbConnected } from "@/config/database";

export async function GET(req: NextRequest) {
  try {
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
    const details = await AccountDetailsModel.findOne({
      userId: userInfo.userId,
    });
    if (!details) {
      return NextResponse.json(
        { success: true, account: null },
        { status: 200 }
      );
    }
    return NextResponse.json(
      { success: true, account: details.toObject() },
      { status: 200 }
    );
  } catch (err) {
    console.error("[GET /user/account-details]", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch account details" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
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
    const allowedFields = [
      "accountNumber",
      "ifscCode",
      "bankName",
      "branch",
      "fullNameInBank",
    ];
    const update: Record<string, string> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) update[field] = body[field];
    }
    if (Object.keys(update).length !== allowedFields.length) {
      return NextResponse.json(
        { success: false, error: "All fields are required" },
        { status: 400 }
      );
    }
    const details = await AccountDetailsModel.findOneAndUpdate(
      { userId: userInfo.userId },
      { $set: { ...update, userId: userInfo.userId } },
      { new: true, upsert: true }
    );
    return NextResponse.json(
      { success: true, account: details.toObject() },
      { status: 200 }
    );
  } catch (err) {
    console.error("[PATCH /user/account-details]", err);
    return NextResponse.json(
      { success: false, error: "Failed to update account details" },
      { status: 500 }
    );
  }
}
