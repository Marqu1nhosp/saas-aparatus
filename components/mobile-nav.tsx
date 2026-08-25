"use client";

import { CalendarDays, House, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Início", icon: House },
  { href: "/barbershops?search=", label: "Buscar", icon: Search },
  { href: "/bookings", label: "Agendamentos", icon: CalendarDays },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-3 left-1/2 z-50 w-[calc(100%-1.5rem)] max-w-[520px] -translate-x-1/2 rounded-[28px] border border-white/5 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] px-3 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.12)] backdrop-blur-[24px] dark:border-white/5 dark:bg-[linear-gradient(135deg,rgba(18,24,24,0.22),rgba(18,24,24,0.06))] dark:shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
      <div className="flex items-center justify-between gap-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isSearchLink = href.includes("search=");
          const isActive =
            href === "/"
              ? pathname === "/"
              : isSearchLink
                ? pathname.startsWith("/barbershops")
                : pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className={cn(
                "group flex h-12 flex-1 items-center justify-center rounded-[16px] border border-transparent transition-all duration-200",
                isActive
                  ? "bg-[#10b981] text-white shadow-[0_4px_12px_rgba(16,185,129,0.35)] ring-1 ring-[#10b981]/40 dark:bg-[#10b981] dark:text-white dark:shadow-[0_4px_12px_rgba(16,185,129,0.38)]"
                  : "text-[#60716f] hover:bg-white/8 dark:text-[#c8d2d0] dark:hover:bg-white/8",
              )}
            >
              <Icon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
