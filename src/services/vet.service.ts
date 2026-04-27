import db from "@/lib/db";

export const VetService = {
  /**
   * Creates a new User and their associated VetProfile in a single transaction.
   */
  async createVet(data: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    phone?: string;
    address: string;
    specialties: string[];
    languagesSpoken: string[];
    bio?: string;
  }) {
    return await db.$transaction(async (tx) => {
      // 1. Create the User
      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash: data.passwordHash,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          role: "VET", // Hardcoded because this service is specifically for vets
        },
      });

      // 2. Create the Vet Profile linked to that User
      const profile = await tx.vetProfile.create({
        data: {
          userId: user.id,
          address: data.address,
          specialties: data.specialties,
          languagesSpoken: data.languagesSpoken,
          bio: data.bio,
        },
      });

      return { user, profile };
    });
  },

  /**
   * Fetches all approved vets for the public search page
   */
  async getAllApprovedVets() {
    return await db.vetProfile.findMany({
      where: { isApproved: true, isActive: true },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            language: true,
          },
        },
      },
    });
  },
};
