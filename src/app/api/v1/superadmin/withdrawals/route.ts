import { NextRequest, NextResponse } from "next/server";
import WithdrawalRequest from "@/models/withdrawalRequest";
import UserModel from "@/models/user";
import TransactionModel from "@/models/transaction";
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
    const status = searchParams.get("status") || "";
    const skip = (page - 1) * limit;

    // Build filter
    const filter: Record<string, unknown> = {};
    if (status && status !== "all") {
      filter.status = status;
    }

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
        filter.user = { $in: userIds };
      } else {
        // No users match, so no withdrawals will match
        filter.user = "__none__";
      }
    }

    // Query withdrawals
    const withdrawals = await WithdrawalRequest.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "user",
        select: "name email mobile",
        model: UserModel,
      });
    const total = await WithdrawalRequest.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      withdrawals,
      pagination: {
        currentPage: page,
        totalPages,
        total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    console.error("[GET /superadmin/withdrawals]", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch withdrawal requests" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  // Superadmin check
  const auth = await requireSuperadmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    if (!isDbConnected) await connectDB();
    const { id, action, remarks } = await req.json();
    if (!id || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid parameters" },
        { status: 400 }
      );
    }
    const withdrawal = await WithdrawalRequest.findById(id);
    if (!withdrawal) {
      return NextResponse.json(
        { success: false, error: "Withdrawal request not found" },
        { status: 404 }
      );
    }
    if (withdrawal.status !== "pending") {
      return NextResponse.json(
        { success: false, error: "Request already processed" },
        { status: 400 }
      );
    }
    const user = await UserModel.findById(withdrawal.user);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }
    if (action === "approve") {
      if ((user.availableBalance || 0) < withdrawal.amount) {
        return NextResponse.json(
          { success: false, error: "Insufficient user balance" },
          { status: 400 }
        );
      }
      user.availableBalance -= withdrawal.amount;
      await user.save();
      await TransactionModel.create({
        userId: user._id,
        type: "withdraw",
        transactionId: `WITHDRAW_${user._id}_${Date.now()}`,
        date: new Date(),
        amount: withdrawal.amount,
        status: "completed",
      });
      withdrawal.status = "approved";
      if (remarks) withdrawal.remarks = remarks;
      await withdrawal.save();
      return NextResponse.json({ success: true, withdrawal });
    } else {
      // For rejected, also create a failed withdraw transaction
      await TransactionModel.create({
        userId: user._id,
        type: "withdraw",
        transactionId: `WITHDRAW_${user._id}_${Date.now()}`,
        date: new Date(),
        amount: withdrawal.amount,
        status: "failed",
      });
      withdrawal.status = "rejected";
      if (remarks) withdrawal.remarks = remarks;
      await withdrawal.save();
      return NextResponse.json({ success: true, withdrawal });
    }
  } catch (err) {
    console.error("[PATCH /superadmin/withdrawals]", err);
    return NextResponse.json(
      { success: false, error: "Failed to update withdrawal request" },
      { status: 500 }
    );
  }
}
