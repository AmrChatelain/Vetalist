import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { signOut } from "@/lib/auth"
import {
  LayoutDashboard,
  CalendarDays,
  UserCircle,
  Settings,
  LogOut,
  Stethoscope,
  ChevronRight,
} from "lucide-react"

const navItems = [
  { href: "/dashboard/vet",              label: "Overview",     icon: LayoutDashboard },
  { href: "/dashboard/vet/appointments", label: "Appointments", icon: CalendarDays },
  { href: "/dashboard/vet/profile",      label: "Profile",      icon: UserCircle },
  { href: "/dashboard/vet/settings",     label: "Settings",     icon: Settings },
]

export default async function VetDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user || session.user.role !== "VET") redirect("/login")

  const firstName = session.user.firstName || "Doctor"
  const lastName  = session.user.lastName  || ""
  const initials  = `${firstName[0]}${lastName[0] || ""}`.toUpperCase()

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .vet-shell {
          display: flex;
          min-height: 100vh;
          background: #f0f4f8;
          font-family: 'DM Sans', sans-serif;
        }

        /* ── Sidebar ── */
        .vet-sidebar {
          width: 260px;
          min-height: 100vh;
          background: #0b1929;
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0; left: 0; bottom: 0;
          z-index: 50;
          border-right: 1px solid rgba(255,255,255,0.06);
        }

        .sidebar-logo {
          padding: 28px 24px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .logo-mark {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }

        .logo-icon {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(59,130,246,0.4);
        }

        .logo-name {
          font-family: 'Sora', sans-serif;
          font-size: 1.1rem;
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.02em;
        }

        .logo-name span { color: #60a5fa; }

        .sidebar-badge {
          display: inline-block;
          margin-top: 8px;
          font-size: 0.65rem;
          font-weight: 600;
          color: #60a5fa;
          background: rgba(59,130,246,0.12);
          border: 1px solid rgba(59,130,246,0.2);
          border-radius: 4px;
          padding: 2px 8px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .sidebar-nav {
          flex: 1;
          padding: 20px 12px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .nav-label {
          font-size: 0.6rem;
          font-weight: 700;
          color: rgba(255,255,255,0.3);
          text-transform: uppercase;
          letter-spacing: 0.15em;
          padding: 0 12px;
          margin: 8px 0 6px;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 8px;
          text-decoration: none;
          color: rgba(255,255,255,0.55);
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s ease;
          position: relative;
        }

        .nav-link:hover {
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.9);
        }

        .nav-link.active {
          background: rgba(59,130,246,0.15);
          color: #60a5fa;
        }

        .nav-link.active::before {
          content: '';
          position: absolute;
          left: 0; top: 20%; bottom: 20%;
          width: 3px;
          background: #3b82f6;
          border-radius: 0 3px 3px 0;
        }

        .nav-chevron {
          margin-left: auto;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .nav-link:hover .nav-chevron,
        .nav-link.active .nav-chevron { opacity: 1; }

        .sidebar-footer {
          padding: 16px 12px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }

        .user-card {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
          border-radius: 10px;
          background: rgba(255,255,255,0.04);
          margin-bottom: 8px;
        }

        .user-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
          color: white;
          flex-shrink: 0;
        }

        .user-info { flex: 1; min-width: 0; }

        .user-name {
          font-size: 0.8rem;
          font-weight: 600;
          color: #fff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-role {
          font-size: 0.65rem;
          color: rgba(255,255,255,0.4);
          font-weight: 400;
        }

        .signout-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 9px 12px;
          border-radius: 8px;
          background: transparent;
          border: none;
          cursor: pointer;
          color: rgba(255,255,255,0.4);
          font-size: 0.8rem;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          transition: all 0.2s;
          text-align: left;
        }

        .signout-btn:hover {
          background: rgba(239,68,68,0.1);
          color: #f87171;
        }

        /* ── Main content ── */
        .vet-main {
          margin-left: 260px;
          flex: 1;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .vet-topbar {
          background: white;
          border-bottom: 1px solid #e2e8f0;
          padding: 0 32px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 40;
        }

        .topbar-title {
          font-family: 'Sora', sans-serif;
          font-size: 1.05rem;
          font-weight: 600;
          color: #0f172a;
        }

        .topbar-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .topbar-date {
          font-size: 0.8rem;
          color: #94a3b8;
        }

        .vet-content {
          flex: 1;
          padding: 32px;
        }

        @media (max-width: 768px) {
          .vet-sidebar { display: none; }
          .vet-main { margin-left: 0; }
        }
      `}</style>

      <div className="vet-shell">
        {/* Sidebar */}
        <aside className="vet-sidebar">
          <div className="sidebar-logo">
            <Link href="/dashboard/vet" className="logo-mark">
              <div className="logo-icon">
                <Stethoscope size={18} color="white" />
              </div>
              <span className="logo-name">Vet<span>alist</span></span>
            </Link>
            <div className="sidebar-badge">Veterinarian Portal</div>
          </div>

          <nav className="sidebar-nav">
            <span className="nav-label">Main</span>
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="nav-link">
                <item.icon size={16} />
                {item.label}
                <ChevronRight size={12} className="nav-chevron" />
              </Link>
            ))}
          </nav>

          <div className="sidebar-footer">
            <div className="user-card">
              <div className="user-avatar">{initials}</div>
              <div className="user-info">
                <div className="user-name">Dr. {firstName} {lastName}</div>
                <div className="user-role">Veterinarian</div>
              </div>
            </div>
            <form
              action={async () => {
                "use server"
                const { signOut: so } = await import("@/lib/auth")
                await so({ redirectTo: "/login" })
              }}
            >
              <button type="submit" className="signout-btn">
                <LogOut size={14} />
                Sign out
              </button>
            </form>
          </div>
        </aside>

        {/* Main */}
        <main className="vet-main">
          <div className="vet-topbar">
            <span className="topbar-title">Veterinarian Dashboard</span>
            <div className="topbar-right">
              <span className="topbar-date">
                {new Date().toLocaleDateString("en-GB", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
          <div className="vet-content">{children}</div>
        </main>
      </div>
    </>
  )
}