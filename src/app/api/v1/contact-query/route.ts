import { NextRequest, NextResponse } from "next/server";
import ContactQueryModel from "@/models/contactQuery";
import { connectDB, isDbConnected } from "@/config/database";

export async function POST(req: NextRequest) {
  if (!isDbConnected) await connectDB();
  const { name, email, message } = await req.json();
  if (!name || !email || !message) {
    return NextResponse.json(
      { success: false, error: "All fields are required." },
      { status: 400 }
    );
  }
  try {
    const query = await ContactQueryModel.create({ name, email, message });
    return NextResponse.json({ success: true, query });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to save query." },
      { status: 500 }
    );
  }
}
