import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  CalendarDays,
  UserCircle,
  Settings,
  LogOut,
  Stethoscope,
  Menu,
} from "lucide-react";
import { NavLink } from "@/components/dashboard/NavLink";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const navItems: { href: string; label: string; icon: React.ReactNode }[] = [
  {
    href: "/dashboard/vet",
    label: "Tableau de bord",
    icon: <LayoutDashboard size={16} />,
  },
  {
    href: "/dashboard/vet/appointments",
    label: "Rendez-vous",
    icon: <CalendarDays size={16} />,
  },
  {
    href: "/dashboard/vet/profile",
    label: "Profil",
    icon: <UserCircle size={16} />,
  },
  {
    href: "/dashboard/vet/settings",
    label: "Paramètres",
    icon: <Settings size={16} />,
  },
];

function SidebarContent({
  initials,
  firstName,
  lastName,
}: {
  initials: string;
  firstName: string;
  lastName: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#0b1929",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "28px 24px 24px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Link
          href="/dashboard/vet"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              flexShrink: 0,
              background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(59,130,246,0.4)",
            }}
          >
            <Stethoscope size={18} color="white" />
          </div>
          <span
            style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: "1.1rem",
              fontWeight: 700,
              color: "#fff",
              letterSpacing: "-0.02em",
            }}
          >
            Vet<span style={{ color: "#60a5fa" }}>alist</span>
          </span>
        </Link>
        <div
          style={{
            display: "inline-block",
            marginTop: 8,
            fontSize: "0.65rem",
            fontWeight: 600,
            color: "#60a5fa",
            background: "rgba(59,130,246,0.12)",
            border: "1px solid rgba(59,130,246,0.2)",
            borderRadius: 4,
            padding: "2px 8px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          Portail vétérinaire
        </div>
      </div>

      {/* Nav */}
      <nav
        style={{
          flex: 1,
          padding: "20px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=DM+Sans:wght@300;400;500&display=swap');
          .nav-label { font-size:0.6rem;font-weight:700;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:0.15em;padding:0 12px;margin:8px 0 6px; }
          .nav-link { display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:8px;text-decoration:none;color:rgba(255,255,255,0.55);font-size:0.875rem;font-weight:500;transition:all 0.2s ease;position:relative; }
          .nav-link:hover { background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.9); }
          .nav-link.active { background:rgba(59,130,246,0.15);color:#60a5fa; }
          .nav-link.active::before { content:'';position:absolute;left:0;top:20%;bottom:20%;width:3px;background:#3b82f6;border-radius:0 3px 3px 0; }
          .nav-chevron { margin-left:auto;opacity:0;transition:opacity 0.2s; }
          .nav-link:hover .nav-chevron, .nav-link.active .nav-chevron { opacity:1; }
          .signout-btn { display:flex;align-items:center;gap:8px;width:100%;padding:9px 12px;border-radius:8px;background:transparent;border:none;cursor:pointer;color:rgba(255,255,255,0.4);font-size:0.8rem;font-family:'DM Sans',sans-serif;font-weight:500;transition:all 0.2s;text-align:left; }
          .signout-btn:hover { background:rgba(239,68,68,0.1);color:#f87171; }
        `}</style>
        <span className="nav-label">Navigation</span>
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
          />
        ))}
      </nav>

      {/* Footer */}
      <div
        style={{
          padding: "16px 12px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: 10,
            borderRadius: 10,
            background: "rgba(255,255,255,0.04)",
            marginBottom: 8,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              flexShrink: 0,
              background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.75rem",
              fontWeight: 700,
              color: "white",
            }}
          >
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "#fff",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              Dr. {firstName} {lastName}
            </div>
            <div
              style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.4)" }}
            >
              Vétérinaire
            </div>
          </div>
        </div>
        <form
          action={async () => {
            "use server";
            const { signOut } = await import("@/lib/auth");
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button type="submit" className="signout-btn">
            <LogOut size={14} />
            Se déconnecter
          </button>
        </form>
      </div>
    </div>
  );
}

export default async function VetDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "VET") redirect("/login");

  const firstName = session.user.firstName || "Docteur";
  const lastName = session.user.lastName || "";
  const initials = `${firstName[0]}${lastName[0] || ""}`.toUpperCase();

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f0f4f8",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Desktop sidebar — hidden on mobile */}
      <aside
        className="hidden md:flex"
        style={{
          width: 260,
          minHeight: "100vh",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 50,
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <SidebarContent
          initials={initials}
          firstName={firstName}
          lastName={lastName}
        />
      </aside>

      {/* Main */}
      <main
        className="md:ml-[260px]"
        style={{
          flex: 1,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Topbar */}
        <div
          style={{
            background: "white",
            borderBottom: "1px solid #e2e8f0",
            padding: "0 24px",
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 40,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Mobile hamburger */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden text-slate-600"
                >
                  <Menu size={20} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[260px] p-0 border-0">
                <SidebarContent
                  initials={initials}
                  firstName={firstName}
                  lastName={lastName}
                />
              </SheetContent>
            </Sheet>

            <span
              style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: "1.05rem",
                fontWeight: 600,
                color: "#0f172a",
              }}
            >
              Tableau de bord
            </span>
          </div>

          <span
            className="hidden sm:block"
            style={{ fontSize: "0.8rem", color: "#94a3b8" }}
          >
            {new Date().toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>

        <div style={{ flex: 1, padding: 32 }}>{children}</div>
      </main>
    </div>
  );
}
