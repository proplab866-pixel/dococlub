import mongoose, { Schema } from "mongoose";
import { IUser } from "@/types";

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    mobile: { type: String, default: "" },
    country: { type: String, default: "" },
    gender: { type: String, default: "" },
    availableBalance: { type: Number, default: 0 },
    totalInvested: { type: Number, default: 0 },
    referalCode: { type: String, default: "", unique: true },
    referedBy: { type: String, default: "" },
    isEmailVerified: { type: Boolean, default: false },
    level1Referrals: [{ type: Schema.Types.ObjectId, ref: "User" }],
    level2Referrals: [{ type: Schema.Types.ObjectId, ref: "User" }],
    level3Referrals: [{ type: Schema.Types.ObjectId, ref: "User" }],
    plan: { type: String, default: "-" },
    commissionRate: { type: Number, default: 0 },
    day: { type: Number, default: 1 },
    dayMax: { type: Number, default: 30 },
    role: { type: String, enum: ["user", "superadmin"], default: "user" },
    activeInvestments: [
      {
        planId: {
          type: Schema.Types.ObjectId,
          ref: "InvestmentPlan",
          required: true,
        },
        amount: { type: Number, required: true },
        startDate: { type: Date, required: true },
        daysCompleted: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
      },
    ],
  },
  { timestamps: true }
);

const UserModel =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default UserModel;
