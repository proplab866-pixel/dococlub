import { NextRequest, NextResponse } from "next/server";
import PaymentQRCodeModel from "@/models/qrcode";
import { authenticateRequest } from "@/utils/auth";
import { connectDB, isDbConnected } from "@/config/database";

export async function POST(req: NextRequest) {
  if (!isDbConnected) await connectDB();

  try {

    const user = authenticateRequest(req);

    const formData = await req.formData(); // works in Node.js runtime with fetch()
    const file = formData.get("file") as File | null;

    if (!file) return NextResponse.json({ success: false, error: "File is required" }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const qr = await PaymentQRCodeModel.create({
      image: buffer,
      contentType: file.type,
      updatedBy: user.userId,
    });

    return NextResponse.json({ success: true, qr });
  } catch (err) {
    console.error("QR Create error:", err);
    return NextResponse.json({ success: false, error: "Failed to save QR code" }, { status: 500 });
  }
}
