"use server";

import { NextRequest, NextResponse } from "next/server";
import TransactionModel from "@/models/transaction";
import { TransactionType, TransactionStatus } from "@/types";
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

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const type = searchParams.get("type") as "deposit" | "withdraw" | null;
    const status = searchParams.get("status") as
      | "pending"
      | "completed"
      | "failed"
      | null;

    // Build filter object with proper typing
    interface TransactionFilter {
      userId: string;
      type?: TransactionType;
      status?: TransactionStatus;
    }

    const filter: TransactionFilter = { userId: userInfo.userId };
    if (type) filter.type = type;
    if (status) filter.status = status;

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Fetch transactions
    const transactions = await TransactionModel.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("transactionId type amount date status planId sourceUserId");

    // Get total count for pagination
    const totalTransactions = await TransactionModel.countDocuments(filter);
    const totalPages = Math.ceil(totalTransactions / limit);

    return NextResponse.json(
      {
        success: true,
        transactions,
        pagination: {
          currentPage: page,
          totalPages,
          totalTransactions,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[GET /user/transac-history]", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch transaction history" },
      { status: 500 }
    );
  }
}
