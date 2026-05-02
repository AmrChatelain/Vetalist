import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  const role = searchParams.get("role") as "CLIENT" | "VET" | "ADMIN" | null;

  if (!email || !role) {
    return NextResponse.json({ error: "Missing email or role parameter" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: `User with email ${email} not found` }, { status: 404 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { role },
    });

    return NextResponse.json({ message: `Successfully updated ${email} to ${role}` });
  } catch (error: any) {
    console.error("DEBUG ERROR:", error);
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error.message 
    }, { status: 500 });
  }
}
