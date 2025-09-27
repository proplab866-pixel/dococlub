import Razorpay from "razorpay";
import crypto from "crypto";

const key_id = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID as string;
const key_secret = process.env.RAZORPAY_KEY_SECRET as string;
const webhook_secret = process.env.RAZORPAY_WEBHOOK_SECRET as
  | string
  | undefined;

if (!key_id || !key_secret) {
  throw new Error("Razorpay credentials are not set in environment variables");
}

export function getRazorpayInstance() {
  return new Razorpay({ key_id, key_secret });
}

/**
 * Create a Razorpay order
 * @param amount Amount in paise (e.g., 50000 = ₹500)
 * @param currency Currency code (default: 'INR')
 * @param receipt Optional receipt string
 */
export async function createOrder(
  amount: number,
  currency = "INR",
  receipt?: string
) {
  const razorpay = getRazorpayInstance();
  const order = await razorpay.orders.create({
    amount,
    currency,
    receipt,
  });
  return order;
}

/**
 * Verify payment signature from Razorpay checkout
 * @param orderId Razorpay order ID
 * @param paymentId Razorpay payment ID
 * @param signature Razorpay signature
 * @returns boolean
 */
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const hmac = crypto.createHmac("sha256", key_secret);
  hmac.update(orderId + "|" + paymentId);
  const generatedSignature = hmac.digest("hex");
  return generatedSignature === signature;
}

/**
 * Verify Razorpay webhook signature
 * @param body Raw request body (string)
 * @param receivedSignature Signature from 'x-razorpay-signature' header
 * @returns boolean
 */
export function verifyWebhookSignature(
  body: string,
  receivedSignature: string
): boolean {
  if (!webhook_secret) return false;
  const expectedSignature = crypto
    .createHmac("sha256", webhook_secret)
    .update(body)
    .digest("hex");
  return expectedSignature === receivedSignature;
}
