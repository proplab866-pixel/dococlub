import { NextRequest, NextResponse } from "next/server";
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
    const status = searchParams.get("status") || "";
    const skip = (page - 1) * limit;

    // Build filter
    const filter: Record<string, unknown> = { role: { $ne: "superadmin" } };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { mobile: { $regex: search, $options: "i" } },
      ];
    }
    if (status && status !== "all") {
      filter.status = status;
    }

    // Query users
    const users = await UserModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("_id name email mobile status role");
    const total = await UserModel.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      users,
      pagination: {
        currentPage: page,
        totalPages,
        total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    console.error("[GET /superadmin/users]", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch users" },
      { status: 500 }
    );
  }
} 