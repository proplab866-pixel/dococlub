import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../../../config/database";
import WithdrawalRequest from "../../../../../models/withdrawalRequest";
import { authenticateRequest } from "../../../../../utils/auth";

export async function POST(req: NextRequest) {
  await connectDB();
  let user;
  try {
    user = authenticateRequest(req);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { amount, remarks } = await req.json();
  if (!amount || typeof amount !== "number" || amount <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  try {
    const withdrawal = await WithdrawalRequest.create({
      user: user.userId,
      amount,
      remarks,
      status: "pending",
    });
    return NextResponse.json({ success: true, withdrawal });
  } catch {
    return NextResponse.json({ error: "Failed to create withdrawal request" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  await connectDB();
  let user;
  try {
    user = authenticateRequest(req);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const filter = { user: user.userId };
    const requests = await WithdrawalRequest.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("amount status remarks createdAt");

    const totalRequests = await WithdrawalRequest.countDocuments(filter);
    const totalPages = Math.ceil(totalRequests / limit);

    return NextResponse.json({
      success: true,
      requests,
      pagination: {
        currentPage: page,
        totalPages,
        totalRequests,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch withdrawal requests" }, { status: 500 });
  }
}
