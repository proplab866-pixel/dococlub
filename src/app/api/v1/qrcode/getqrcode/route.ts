import { NextResponse } from "next/server";
import PaymentQRCodeModel from "@/models/qrcode";
import { connectDB, isDbConnected } from "@/config/database";

export async function GET() {
  if (!isDbConnected) await connectDB();

  try {
    const qr = await PaymentQRCodeModel.findOne().sort({ updatedAt: -1 });
    if (!qr) return NextResponse.json({ success: false, error: "No QR code found" }, { status: 404 });

    // Send image as blob
    return new NextResponse(qr.image, {
      status: 200,
      headers: {
        "Content-Type": qr.contentType,
      },
    });
  } catch (err) {
    console.error("QR Fetch error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch QR code" }, { status: 500 });
  }
}
