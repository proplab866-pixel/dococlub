import mongoose from "mongoose";

export type TransactionType = "deposit" | "withdraw" | "investment" | "daily_return" | "referral_commission";
export type TransactionStatus = "pending" | "completed" | "failed";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  mobile: string;
  country?: string;
  gender?: string;
  availableBalance: number;
  totalInvested: number;
  referalCode: string;
  referedBy: string;
  isEmailVerified: boolean;
  level1Referrals: mongoose.Types.ObjectId[];
  level2Referrals: mongoose.Types.ObjectId[];
  level3Referrals: mongoose.Types.ObjectId[];
  plan: string;
  commissionRate: number;
  day: number;
  dayMax: number;
  role: "user" | "superadmin";
  activeInvestments: Array<{
    planId: mongoose.Types.ObjectId;
    amount: number;
    startDate: Date;
    daysCompleted: number;
    isActive: boolean;
  }>;
}

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  type: TransactionType;
  transactionId: string;
  date: Date;
  amount: number;
  status?: TransactionStatus;
  createdAt: Date;
  updatedAt: Date;
  planId?: mongoose.Types.ObjectId;
  sourceUserId?: mongoose.Types.ObjectId;
}

export interface IOTPVerification extends Document {
  userId: mongoose.Types.ObjectId;
  otp: string;
  expiresAt: Date;
}

export interface IInvestmentPlan extends Document {
  name: string;
  invest: number;
  daily: number;
  total: number;
  days: number;
  roi: number;
  benefits: string[];
  badge?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAccountDetails extends Document {
  userId: mongoose.Types.ObjectId;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branch: string;
  fullNameInBank: string;
}
