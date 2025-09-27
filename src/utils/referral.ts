import UserModel from "@/models/user";
import mongoose from "mongoose";
import TransactionModel from "@/models/transaction";
import { referralLevel1, referralLevel2, referralLevel3 } from "@/constants";

export async function processReferral(newUserId: mongoose.Types.ObjectId, referralCode: string) {
  try {
    // Find the referrer by referral code
    const referrer = await UserModel.findOne({ referalCode: referralCode });
    if (!referrer) {
      throw new Error("Invalid referral code");
    }

    // Add new user to referrer's level 1
    await UserModel.findByIdAndUpdate(
      referrer._id,
      { $push: { level1Referrals: newUserId } }
    );

    // Set new user's referedBy to referrer's referral code
    await UserModel.findByIdAndUpdate(
      newUserId,
      { referedBy: referralCode }
    );

    // Process level 2 (referrer's referrer)
    if (referrer.referedBy) {
      const level2Referrer = await UserModel.findOne({ referalCode: referrer.referedBy });
      if (level2Referrer) {
        await UserModel.findByIdAndUpdate(
          level2Referrer._id,
          { $push: { level2Referrals: newUserId } }
        );

        // Process level 3 (level2's referrer)
        if (level2Referrer.referedBy) {
          const level3Referrer = await UserModel.findOne({ referalCode: level2Referrer.referedBy });
          if (level3Referrer) {
            await UserModel.findByIdAndUpdate(
              level3Referrer._id,
              { $push: { level3Referrals: newUserId } }
            );
          }
        }
      }
    }

    return true;
  } catch (error) {
    console.error("Referral processing error:", error);
    throw error;
  }
}

/**
 * Credit referral commissions up to 3 levels for a user's daily return.
 * @param userId The user who received the daily return
 * @param dailyReturn The daily return amount
 * @param planId The planId for reference in the transaction
 */
export async function creditReferralCommission(userId: mongoose.Types.ObjectId, dailyReturn: number, planId: mongoose.Types.ObjectId) {
  // Level 1
  const user = await UserModel.findById(userId);
  if (!user || !user.referedBy) return;
  let refCode = user.referedBy;
  const commissionRates = [referralLevel1, referralLevel2, referralLevel3];
  for (let level = 1; level <= 3; level++) {
    const referrer = await UserModel.findOne({ referalCode: refCode });
    if (!referrer) break;
    const rate = commissionRates[level - 1];
    const commission = Math.round((dailyReturn * rate) / 100);
    if (commission > 0) {
      referrer.availableBalance = (referrer.availableBalance || 0) + commission;
      await referrer.save();
      await TransactionModel.create({
        userId: referrer._id,
        type: "referral_commission",
        transactionId: `REFCOMM_${referrer._id}_${userId}_${Date.now()}`,
        date: new Date(),
        amount: commission,
        status: "completed",
        planId,
        sourceUserId: userId,
      });
    }
    // Next level
    refCode = referrer.referedBy;
    if (!refCode) break;
  }
}

// Generate unique referral code
export function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Assign referral code to new user
export async function assignReferralCode(userId: mongoose.Types.ObjectId): Promise<string> {
  let referralCode = '';
  let isUnique = false;
  
  while (!isUnique) {
    referralCode = generateReferralCode();
    const existing = await UserModel.findOne({ referalCode: referralCode });
    if (!existing) {
      isUnique = true;
    }
  }
  
  await UserModel.findByIdAndUpdate(userId, { referalCode: referralCode });
  return referralCode;
} 