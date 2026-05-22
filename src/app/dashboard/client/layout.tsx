import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import {
  PawPrint,
  LayoutDashboard,
  CalendarDays,
  PawPrint as PawIcon,
  UserCircle,
  LogOut,
  Menu,
} from "lucide-react"
import { NavLink } from "@/components/dashboard/NavLink"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import "./client-dashboard.css"

const navItems: { href: string; label: string; icon: React.ReactNode }[] = [
  { href: "/dashboard/client",              label: "Tableau de bord", icon: <LayoutDashboard size={16} /> },
  { href: "/dashboard/client/appointments", label: "Mes rendez-vous", icon: <CalendarDays size={16} />    },
  { href: "/dashboard/client/pets",         label: "Mes animaux",     icon: <PawIcon size={16} />         },
  { href: "/dashboard/client/settings",     label: "Mon profil",      icon: <UserCircle size={16} />      },
]

function SidebarContent({
  initials,
  firstName,
  lastName,
}: {
  initials:  string
  firstName: string
  lastName:  string
}) {
  return (
    // ⚠️ No position:fixed here — desktop aside handles that, Sheet handles mobile
    <div className="client-sidebar-inner">
      {/* Logo */}
      <div className="client-sidebar__logo">
        <Link href="/" className="client-sidebar__logo-link">
          <div className="client-sidebar__logo-icon">
            <PawPrint size={18} color="white" />
          </div>
          <span className="client-sidebar__logo-name">
            Veta<span>list</span>
          </span>
        </Link>
        <div className="client-sidebar__badge">Espace client</div>
      </div>

      {/* Nav */}
      <nav className="client-sidebar__nav">
        <span className="client-sidebar__nav-label">Navigation</span>
        {navItems.map((item) => (
          <NavLink key={item.href} href={item.href} label={item.label} icon={item.icon} />
        ))}
      </nav>

      {/* Footer */}
      <div className="client-sidebar__footer">
        <div className="client-sidebar__user">
          <div className="client-sidebar__avatar">{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="client-sidebar__user-name">{firstName} {lastName}</div>
            <div className="client-sidebar__user-role">Client</div>
          </div>
        </div>
        <form
          action={async () => {
            "use server"
            const { signOut } = await import("@/lib/auth")
            await signOut({ redirectTo: "/login" })
          }}
        >
          <button type="submit" className="client-signout-btn">
            <LogOut size={14} />
            Se déconnecter
          </button>
        </form>
      </div>
    </div>
  )
}

export default async function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user)                 redirect("/login")
  if (session.user.role !== "CLIENT") redirect("/dashboard/vet")

  const firstName = session.user.firstName || "Vous"
  const lastName  = session.user.lastName  || ""
  const initials  = `${firstName[0]}${lastName[0] || ""}`.toUpperCase()

  return (
    <div className="client-shell">

      {/* Desktop sidebar — fixed, hidden on mobile */}
      <aside className="client-sidebar">
        <SidebarContent initials={initials} firstName={firstName} lastName={lastName} />
      </aside>

      {/* Main */}
      <main className="client-main">
        {/* Topbar */}
        <div className="client-topbar">
          <div className="client-topbar__left">

            {/* Mobile hamburger */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-slate-600">
                  <Menu size={20} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[264px] p-0 border-0">
                {/* Required by Radix for accessibility — hidden visually */}
                <VisuallyHidden>
                  <SheetTitle>Menu de navigation</SheetTitle>
                </VisuallyHidden>
                <SidebarContent initials={initials} firstName={firstName} lastName={lastName} />
              </SheetContent>
            </Sheet>

            <span className="client-topbar__title">Espace client</span>
          </div>

          <span className="client-topbar__date hidden sm:block">
            {new Date().toLocaleDateString("fr-FR", {
              weekday: "long",
              day:     "numeric",
              month:   "long",
              year:    "numeric",
            })}
          </span>
        </div>

        <div className="client-content">{children}</div>
      </main>
    </div>
  )
}