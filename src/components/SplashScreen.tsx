import { Sparkles } from "lucide-react";

export function SplashScreen() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-from to-accent-to animate-pulse-slow">
        <Sparkles className="h-8 w-8 text-black" />
      </div>
      <p className="text-lg font-semibold text-foreground">Habit Tracker</p>
      <div className="mt-2 h-1 w-24 overflow-hidden rounded-full bg-surface-hover">
        <div className="h-full w-1/3 animate-loading-bar rounded-full bg-gradient-to-r from-accent-from to-accent-to" />
      </div>
    </main>
  );
}
