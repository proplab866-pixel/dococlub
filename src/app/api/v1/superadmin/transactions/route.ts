import { NextRequest, NextResponse } from "next/server";
import TransactionModel from "@/models/transaction";
import UserModel from "@/models/user";
import { requireSuperadmin } from "@/utils/superadminAuth";
import { connectDB, isDbConnected } from "@/config/database";

export async function GET(req: NextRequest) {
  // Superadmin check
  const auth = await requireSuperadmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    if (!isDbConnected) await connectDB();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "";
    const status = searchParams.get("status") || "";
    const skip = (page - 1) * limit;

    // Build filter
    const filter: Record<string, unknown> = {};
    if (type && type !== "all") filter.type = type;
    if (status && status !== "all") filter.status = status;

    // If searching by user info, find matching user IDs
    let userIds: string[] | undefined = undefined;
    if (search) {
      const users = await UserModel.find({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { mobile: { $regex: search, $options: "i" } },
        ],
      }).select("_id");
      userIds = users.map((u) => u._id.toString());
      if (userIds.length > 0) {
        filter.userId = { $in: userIds };
      } else {
        // No users match, so no transactions will match
        filter.userId = "__none__";
      }
    }

    // Query transactions
    const transactions = await TransactionModel.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "userId",
        select: "name email mobile",
        model: UserModel,
      });
    const total = await TransactionModel.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      transactions,
      pagination: {
        currentPage: page,
        totalPages,
        total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    console.error("[GET /superadmin/transactions]", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
} 