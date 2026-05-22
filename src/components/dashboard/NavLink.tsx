"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight } from "lucide-react"

export function NavLink({
  href,
  label,
  icon,
}: {
  href: string
  label: string
  icon: React.ReactNode
}) {
  const pathname = usePathname()
  const isBase   = href.split("/").filter(Boolean).length <= 2
  const isActive = isBase ? pathname === href : pathname.startsWith(href)

  return (
    <Link href={href} className={`nav-link${isActive ? " active" : ""}`}>
      {icon}
      {label}
      <ChevronRight size={12} className="nav-chevron" />
    </Link>
  )
}