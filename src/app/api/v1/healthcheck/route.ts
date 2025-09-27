"use server";

import { connectDB, isDbConnected } from "@/config/database";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    if (!isDbConnected) await connectDB();
    return NextResponse.json(
      { success: true, message: "Healthcheck successful" },
      {
        status: 200,
      }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Healthcheck failed", error },
      { status: 500 }
    );
  }
};
