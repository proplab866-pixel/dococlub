import mongoose, { Schema } from "mongoose";
import { ITransaction } from "@/types";

const transactionSchema = new Schema<ITransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: [
        "deposit",
        "withdraw",
        "investment",
        "daily_return",
        "referral_commission",
      ],
      required: true,
    },
    transactionId: { type: String, required: true, unique: true },
    date: { type: Date, required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    planId: { type: Schema.Types.ObjectId, ref: "InvestmentPlan" },
    sourceUserId: { type: Schema.Types.ObjectId, ref: "User" },
    utrNumber: { type: String, required: false },
  },
  { timestamps: true }
);

const TransactionModel =
  mongoose.models.Transaction ||
  mongoose.model<ITransaction>("Transaction", transactionSchema);

export default TransactionModel;
