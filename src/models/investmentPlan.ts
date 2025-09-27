import mongoose, { Schema } from "mongoose";
import { IInvestmentPlan } from "@/types";

const investmentPlanSchema = new Schema<IInvestmentPlan>(
  {
    name: { type: String, required: true },
    invest: { type: Number, required: true },
    daily: { type: Number, required: true },
    total: { type: Number, required: true },
    days: { type: Number, required: true },
    roi: { type: Number, required: true },
    benefits: { type: [String], required: true },
    badge: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const InvestmentPlanModel =
  mongoose.models.InvestmentPlan ||
  mongoose.model<IInvestmentPlan>("InvestmentPlan", investmentPlanSchema);

export default InvestmentPlanModel;
