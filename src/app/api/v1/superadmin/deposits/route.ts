import { NextRequest, NextResponse } from "next/server";
import TransactionModel from "@/models/transaction";
import UserModel from "@/models/user";
import { requireSuperadmin } from "@/utils/superadminAuth";
import { connectDB, isDbConnected } from "@/config/database";

export async function GET(req: NextRequest) {
  const auth = await requireSuperadmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    if (!isDbConnected) await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    // ✅ Manual filter: only pending deposits
    const filter: Record<string, any> = {
      type: "deposit",
      status: "pending",
    };

    // Optional: search by user name/email/mobile
    if (search) {
      const users = await UserModel.find({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { mobile: { $regex: search, $options: "i" } },
        ],
      }).select("_id");

      if (users.length > 0) {
        filter.userId = { $in: users.map((u) => u._id) };
      } else {
        return NextResponse.json({
          success: true,
          transactions: [],
          pagination: {
            currentPage: page,
            totalPages: 0,
            total: 0,
            hasNextPage: false,
            hasPrevPage: false,
          },
        });
      }
    }

    const [transactions, total] = await Promise.all([
      TransactionModel.find(filter)
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({ path: "userId", select: "name email mobile", model: UserModel }),
      TransactionModel.countDocuments(filter),
    ]);

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
    console.error(err);
    return NextResponse.json({ success: false, error: "Failed to fetch deposits" }, { status: 500 });
  }
}