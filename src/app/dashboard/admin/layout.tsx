import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import {
  LayoutDashboard,
  ShieldCheck,
  BadgeCheck,
  Users,
  LogOut,
  Settings,
} from "lucide-react"

const navItems = [
  { href: "/dashboard/admin",         label: "Overview",     icon: LayoutDashboard },
  { href: "/dashboard/admin/vets",    label: "Vet Reviews",  icon: ShieldCheck     },
  { href: "/dashboard/admin/badges",  label: "Badges",       icon: BadgeCheck      },
  { href: "/dashboard/admin/users",   label: "Users",        icon: Users           },
]

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
      {/* Sidebar */}
      <aside className="w-60 min-h-screen bg-slate-900 flex flex-col fixed top-0 left-0 bottom-0 z-50 border-r border-slate-800">

        {/* Logo */}
        <div className="px-5 py-6 border-b border-slate-800">
          <Link href="/dashboard/admin" className="flex items-center gap-2.5 no-underline">
            <div className="w-8 h-8 bg-linear-to-br from-violet-500 to-violet-700 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-violet-900/30">
              A
            </div>
            <div>
              <div className="text-white font-bold text-sm leading-none">Vetalist</div>
              <div className="text-violet-400 text-xs mt-0.5 font-medium">Admin Portal</div>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">
            Management
          </p>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all text-sm font-medium no-underline group"
            >
              <item.icon size={15} className="group-hover:text-violet-400 transition-colors" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-slate-800">
          <div className="flex items-center gap-2.5 px-2 py-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-linear-to-br from-violet-500 to-violet-700 flex items-center justify-content text-white text-xs font-bold shrink-0">
              <span className="mx-auto">{initials}</span>
            </div>
            <div className="min-w-0">
              <div className="text-white text-xs font-semibold truncate">{firstName} {lastName}</div>
              <div className="text-slate-500 text-xs">Administrator</div>
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
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-60 flex-1 min-h-screen">
        {/* Topbar */}
        <div className="h-14 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-40">
          <span className="text-sm font-semibold text-slate-800">Admin Dashboard</span>
          <span className="text-xs text-slate-400">
            {new Date().toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}