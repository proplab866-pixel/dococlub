import mongoose, { Schema } from "mongoose";
import { IOTPVerification } from "@/types";

const otpVerificationSchema = new Schema<IOTPVerification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

const OTPVerificationModel =
  mongoose.models.OTPVerification ||
  mongoose.model<IOTPVerification>("OTPVerification", otpVerificationSchema);

export default OTPVerificationModel;
