import { NextResponse } from "next/server";
import { VetService } from "@/services/vet.service";

// GET /api/vets -> Returns all approved vets (for the public search)
export async function GET() {
  try {
    const vets = await VetService.getAllApprovedVets();
    return NextResponse.json(vets);
  } catch (error) {
    console.error("GET_VETS_ERROR:", error);
    return NextResponse.json({ error: "Failed to fetch vets" }, { status: 500 });
  }
}

// POST /api/vets -> Creates a new vet (In production, this would be protected by Auth)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Basic validation (we will use Zod for this properly in the next step)
    if (!body.email || !body.passwordHash || !body.address) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await VetService.createVet(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("CREATE_VET_ERROR:", error);
    return NextResponse.json({ error: "Failed to create vet" }, { status: 500 });
  }
}
