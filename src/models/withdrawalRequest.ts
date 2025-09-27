import mongoose, { Schema, Document, models } from "mongoose";

export interface IWithdrawalRequest extends Document {
  user: Schema.Types.ObjectId;
  amount: number;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  remarks?: string;
}

const WithdrawalRequestSchema = new Schema<IWithdrawalRequest>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    createdAt: { type: Date, default: Date.now },
    remarks: { type: String },
  },
  { timestamps: true }
);

export default models.WithdrawalRequest ||
  mongoose.model<IWithdrawalRequest>(
    "WithdrawalRequest",
    WithdrawalRequestSchema
  );
