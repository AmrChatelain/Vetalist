"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight } from "lucide-react"
import type { LucideIcon } from "lucide-react"

export function NavLink({
  href,
  label,
  icon: Icon,
}: {
  href: string
  label: string
  icon: LucideIcon
}) {
  const pathname = usePathname()
  // Root dashboard paths need exact match; sub-routes use prefix
  const isBase   = href.split("/").filter(Boolean).length <= 2
  const isActive = isBase ? pathname === href : pathname.startsWith(href)

  return (
    <Link href={href} className={`nav-link${isActive ? " active" : ""}`}>
      <Icon size={16} />
      {label}
      <ChevronRight size={12} className="nav-chevron" />
    </Link>
  )
}