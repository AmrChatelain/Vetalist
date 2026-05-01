import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProfileEditor from "@/components/vet/ProfileEditor";

export default async function ProfilePage() {
  const session = await auth();

  if (!session || session.user.role !== "VET") {
    redirect("/");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">Manage your professional information and clinic details.</p>
      </div>
      
      <ProfileEditor />
    </div>
  );
}
