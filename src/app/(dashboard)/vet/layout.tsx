"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, UserCircle, CalendarDays, Settings, LogOut } from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard/vet" },
  { icon: CalendarDays, label: "Appointments", href: "/dashboard/vet/appointments" },
  { icon: UserCircle, label: "My Profile", href: "/dashboard/vet/profile" },
  { icon: Settings, label: "Settings", href: "/dashboard/vet/settings" },
];

export default function VetDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!session || session.user.role !== "VET") {
    router.push("/");
    return null;
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r bg-background md:flex">
        <div className="flex h-16 items-center border-b px-6">
          <span className="text-lg font-bold tracking-tight text-primary">Vetalist Vet</span>
        </div>
        
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t p-4">
          <div className="flex items-center gap-3 px-2 py-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
              {session.user.firstName?.[0]}{session.user.lastName?.[0]}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-sm font-medium">{session.user.firstName} {session.user.lastName}</span>
              <span className="truncate text-xs text-muted-foreground">Veterinarian</span>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 px-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => signOut()}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        {/* Mobile Header (Simple) */}
        <header className="flex h-16 items-center border-b bg-background px-6 md:hidden">
          <span className="text-lg font-bold text-primary">Vetalist</span>
        </header>

        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
