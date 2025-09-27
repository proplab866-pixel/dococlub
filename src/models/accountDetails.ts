import mongoose, { Schema } from "mongoose";
import { IAccountDetails } from "@/types";

const accountDetailsSchema = new Schema<IAccountDetails>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    accountNumber: { type: String, required: true },
    ifscCode: { type: String, required: true },
    bankName: { type: String, required: true },
    branch: { type: String, required: true },
    fullNameInBank: { type: String, required: true },
  },
  { timestamps: true }
);

const AccountDetailsModel =
  mongoose.models.AccountDetails ||
  mongoose.model<IAccountDetails>("AccountDetails", accountDetailsSchema);

export default AccountDetailsModel;
