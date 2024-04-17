import { NextResponse } from "next/server";
import prisma from "../../../lib/db";

export async function GET() {
  try {
    await prisma.$connect();
    return NextResponse.json({}, { status: 200 });
  } catch (e) {
    console.log(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}