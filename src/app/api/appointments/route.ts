import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Appointments endpoint placeholder" });
}

export async function POST() {
  return NextResponse.json({ message: "Booking an appointment logic goes here" });
}
