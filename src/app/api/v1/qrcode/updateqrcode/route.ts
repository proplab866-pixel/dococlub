import { NextRequest, NextResponse } from "next/server";
import PaymentQRCodeModel from "@/models/qrcode";
import { authenticateRequest } from "@/utils/auth";
import { connectDB, isDbConnected } from "@/config/database";

export async function PUT(req: NextRequest) {
  if (!isDbConnected) await connectDB();

  try {
    const user = authenticateRequest(req);

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ success: false, error: "File is required" }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const qr = await PaymentQRCodeModel.findOneAndUpdate(
      {},
      { image: buffer, contentType: file.type, updatedBy: user.userId },
      { new: true, sort: { updatedAt: -1 }, upsert: true }
    );

    return NextResponse.json({ success: true, qr });
  } catch (err) {
    console.error("QR Update error:", err);
    return NextResponse.json({ success: false, error: "Failed to update QR code" }, { status: 500 });
  }
}
