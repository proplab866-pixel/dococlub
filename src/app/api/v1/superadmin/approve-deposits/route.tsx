// import { NextRequest, NextResponse } from "next/server";
// import mongoose from "mongoose";
// import TransactionModel from "@/models/transaction";
// import UserModel from "@/models/user";
// import { requireSuperadmin } from "@/utils/superadminAuth";
// import { connectDB, isDbConnected } from "@/config/database";


// export async function POST(req: NextRequest) {
//   const auth = await requireSuperadmin(req);
//   if (auth instanceof NextResponse) return auth;

//   if (!isDbConnected) await connectDB();
//   try {
    
//     const body = await req.json();
//     const { transactionId } = body?.data;
//     console.log(transactionId);

//     if (!transactionId) {
//       return NextResponse.json(
//         { success: false, error: "Transaction ID is required" },
//         { status: 400 }
//       );
//     }


//     // Start a session for transaction
//     const session = await mongoose.startSession();
//     session.startTransaction();

//     try {
//       // Find pending deposit
//       const deposit = await TransactionModel.findOne({
//         _id: transactionId,
//         type: "deposit",
//         status: "pending",
//       }).session(session);

//       if (!deposit) {
//         await session.abortTransaction();
//         session.endSession();
//         return NextResponse.json(
//           { success: false, error: "Deposit not found or already processed" },
//           { status: 404 }
//         );
//       }

//       // Update deposit status to completed
//       deposit.status = "completed";
//       await deposit.save({ session });

//       // Update user's available balance
//       let updatedUser = null;
//       if (deposit.userId) {
//         updatedUser = await UserModel.findByIdAndUpdate(
//           deposit.userId,
//           { $inc: { availableBalance: deposit.amount } },
//           { new: true, session }
//         );
//       }

//       // Commit transaction
//       await session.commitTransaction();
//       session.endSession();

//       // Populate userId in deposit for frontend
//       await deposit.populate("userId", "name email availableBalance");

//       return NextResponse.json({
//         success: true,
//         message: "Deposit approved successfully",
//         deposit,
//         user: updatedUser,
//       });
//     } catch (err) {
//       await session.abortTransaction();
//       session.endSession();
//       console.error(err);
//       return NextResponse.json(
//         { success: false, error: "Failed to approve deposit" },
//         { status: 500 }
//       );
//     }
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json(
//       { success: false, error: "Server error" },
//       { status: 500 }
//     );
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import TransactionModel from "@/models/transaction";
import UserModel from "@/models/user";
import { requireSuperadmin } from "@/utils/superadminAuth";
import { connectDB, isDbConnected } from "@/config/database";

export async function POST(req: NextRequest) {
  console.error("Approve deposit API hit");

  // Auth check
  let auth;
  try {
    auth = await requireSuperadmin(req);
    if (auth instanceof NextResponse) return auth;
  } catch (err) {
    console.error("Auth failed:", err);
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  // Connect to DB
  try {
    if (!isDbConnected) await connectDB();
  } catch (err) {
    console.error("DB connection failed:", err);
    return NextResponse.json({ success: false, error: "Database connection failed" }, { status: 500 });
  }

  try {
    const body = await req.json();
    console.error("Request body:", body);
    console.log(body)

    const transactionId = body.transactionId;

    if (!transactionId) {
      return NextResponse.json({ success: false, error: "Transaction ID is required" }, { status: 400 });
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(transactionId)) {
      return NextResponse.json({ success: false, error: "Invalid transaction ID" }, { status: 400 });
    }

    // Start MongoDB transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const deposit = await TransactionModel.findOne({
        _id: transactionId,
        type: "deposit",
        status: "pending",
      }).session(session);

      if (!deposit) {
        await session.abortTransaction();
        session.endSession();
        return NextResponse.json({ success: false, error: "Deposit not found or already processed" }, { status: 404 });
      }

      // Update deposit status
      deposit.status = "completed";
      await deposit.save({ session });

      let updatedUser = null;
      if (deposit.userId) {
        updatedUser = await UserModel.findByIdAndUpdate(
          deposit.userId,
          { $inc: { availableBalance: deposit.amount } },
          { new: true, session }
        );
      }

      // Commit transaction
      await session.commitTransaction();
      session.endSession();

      // Populate user info for frontend
      await deposit.populate("userId", "name email availableBalance");

      console.error("Deposit approved:", deposit._id);

      return NextResponse.json({
        success: true,
        message: "Deposit approved successfully",
        deposit,
        user: updatedUser,
      });
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      console.error("Transaction failed:", err);
      return NextResponse.json({ success: false, error: "Failed to approve deposit" }, { status: 500 });
    }
  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
