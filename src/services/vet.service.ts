import prisma from "@/lib/db";

export const VetService = {
  /**
   * Updates an existing VetProfile with onboarding data.
   */
  async updateOnboardingProfile(userId: string, data: any) {
    return await prisma.vetProfile.update({
      where: { userId },
      data: {
        ...data,
        // Ensure status moves to PENDING_APPROVAL once onboarding is complete
        status: "PENDING_APPROVAL",
      },
    });
  },

  /**
   * Fetches all active vets for the public search page
   */
  async getAllActiveVets() {
    return await prisma.vetProfile.findMany({
      where: { 
        status: "ACTIVE",
        isActive: true 
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  },

  /**
   * Fetches a single vet profile by ID for the public profile page
   */
  async getProfileById(profileId: string) {
    return await prisma.vetProfile.findUnique({
      where: { id: profileId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            image: true,
          },
        },
        workingHours: true,
      },
    });
  }
};
