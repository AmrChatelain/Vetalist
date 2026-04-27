import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Availability endpoint placeholder" });
}

export async function POST() {
  return NextResponse.json({ message: "Managing availability logic goes here" });
}
