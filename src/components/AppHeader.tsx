"use client";

import { signOut } from "firebase/auth";
import { LogOut, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { Avatar } from "@/components/ui/Avatar";
import { auth } from "@/lib/firebase/auth";

export function AppHeader() {
  const { user } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await signOut(auth);
    router.push("/login");
  }

  if (!user) return null;

  const name = user.displayName ?? user.email ?? "Usuario";

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2 text-foreground">
          <Sparkles className="h-5 w-5 text-accent-from" />
          <span className="font-semibold">Habit Tracker</span>
        </div>

        <div className="flex items-center gap-3">
          <Avatar name={name} />
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Cerrar sesión"
            className="rounded-lg p-2 text-muted transition hover:bg-surface-hover hover:text-foreground"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
