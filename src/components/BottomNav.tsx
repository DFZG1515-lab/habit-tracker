"use client";

import { Home, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export function BottomNav() {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const items = [
    { href: "/", label: "Inicio", icon: Home, active: pathname === "/" },
    {
      href: "/habitos/nuevo",
      label: "Nuevo",
      icon: Plus,
      active: pathname === "/habitos/nuevo",
    },
  ];

  return (
    <nav className="sticky bottom-0 z-10 border-t border-border bg-background/95 backdrop-blur sm:hidden">
      <div className="mx-auto flex max-w-2xl">
        {items.map(({ href, label, icon: Icon, active }) => (
          <Link
            key={href}
            href={href}
            className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-xs transition ${
              active ? "text-accent-from" : "text-muted hover:text-foreground"
            }`}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
