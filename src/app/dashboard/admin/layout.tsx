import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import {
  LayoutDashboard,
  ShieldCheck,
  BadgeCheck,
  Users,
  LogOut,
  Menu,
} from "lucide-react"
import { NavLink } from "@/components/dashboard/NavLink"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

const navItems = [
  { href: "/dashboard/admin",       label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/dashboard/admin/vets",  label: "Vétérinaires",    icon: ShieldCheck     },
  { href: "/dashboard/admin/badges",label: "Badges",          icon: BadgeCheck      },
  { href: "/dashboard/admin/users", label: "Utilisateurs",    icon: Users           },
]

function SidebarContent({ initials, firstName, lastName }: {
  initials:  string
  firstName: string
  lastName:  string
}) {
  return (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-slate-800">
        <Link href="/dashboard/admin" className="flex items-center gap-2.5 no-underline">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-violet-700 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-violet-900/30">
            A
          </div>
          <div>
            <div className="text-white font-bold text-sm leading-none">Vetalist</div>
            <div className="text-violet-400 text-xs mt-0.5 font-medium">Portail Admin</div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">
          Gestion
        </p>
        {navItems.map((item) => (
          <NavLink key={item.href} href={item.href} label={item.label} icon={item.icon} />
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-slate-800">
        <div className="flex items-center gap-2.5 px-2 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="text-white text-xs font-semibold truncate">
              {firstName} {lastName}
            </div>
            <div className="text-slate-500 text-xs">Administrateur</div>
          </div>
        </div>
        <form
          action={async () => {
            "use server"
            const { signOut } = await import("@/lib/auth")
            await signOut({ redirectTo: "/login" })
          }}
        >
          <button
            type="submit"
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-all text-sm font-medium"
          >
            <LogOut size={14} />
            Se déconnecter
          </button>
        </form>
      </div>
    </div>
  )
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login")

  const firstName = session.user.firstName || "Admin"
  const lastName  = session.user.lastName  || ""
  const initials  = `${firstName[0]}${lastName[0] || ""}`.toUpperCase()

  return (
    <div className="flex min-h-screen bg-slate-50">

      {/* Desktop sidebar */}
      <aside className="w-60 min-h-screen hidden md:flex flex-col fixed top-0 left-0 bottom-0 z-50 border-r border-slate-800">
        <SidebarContent initials={initials} firstName={firstName} lastName={lastName} />
      </aside>

      {/* Main content */}
      <main className="md:ml-60 flex-1 min-h-screen">

        {/* Topbar */}
        <div className="h-14 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-40">

          {/* Mobile hamburger */}
          <div className="flex items-center gap-3">
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
              <SheetContent side="left" className="w-60 p-0 border-slate-800">
                <SidebarContent
                  initials={initials}
                  firstName={firstName}
                  lastName={lastName}
                />
              </SheetContent>
            </Sheet>

            <span className="text-sm font-semibold text-slate-800">
              Tableau de bord Admin
            </span>
          </div>

          <span className="text-xs text-slate-400 hidden sm:block">
            {new Date().toLocaleDateString("fr-FR", {
              weekday: "long",
              day:     "numeric",
              month:   "long",
              year:    "numeric",
            })}
          </span>
        </div>

        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  )
}