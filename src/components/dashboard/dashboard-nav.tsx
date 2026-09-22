"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Users, FileText, BarChart3, Settings, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/events", label: "Events", icon: Calendar },
  { href: "/dashboard/responses", label: "Responses", icon: Users },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <Link href="/dashboard" className="text-xl font-bold text-gray-900">
          Atelier RSVP
        </Link>
      </div>

      <div className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-gray-200">
        <Link
          href="/dashboard/events/new"
          className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <FileText className="w-5 h-5" />
          New Event
        </Link>
      </div>
    </nav>
  );
}
