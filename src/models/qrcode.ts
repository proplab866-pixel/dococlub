import mongoose, { Schema } from "mongoose";

const qrCodeSchema = new Schema({
  image: { type: Buffer, required: true },       // store image as buffer
  contentType: { type: String, required: true }, // image MIME type
  updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

const PaymentQRCodeModel =
  mongoose.models.PaymentQRCode ||
  mongoose.model("PaymentQRCode", qrCodeSchema);

export default PaymentQRCodeModel;
