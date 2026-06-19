"use client";

import { Check, Flame, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { getGreeting } from "@/lib/greeting";
import {
  subscribeToAllUserLogs,
  subscribeToHabits,
  subscribeToTodayLogs,
  toggleHabitToday,
} from "@/lib/habits/api";
import { calculateStreaks } from "@/lib/habits/streak";
import { CATEGORIAS, type Habit } from "@/lib/habits/types";

function frecuenciaLabel(habit: Habit) {
  if (habit.frecuencia.type === "diaria") return "Todos los días";
  if (habit.frecuencia.type === "veces_por_semana")
    return `${habit.frecuencia.veces}x por semana`;
  return `${habit.frecuencia.dias.length} días/semana`;
}

function Dashboard() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completedToday, setCompletedToday] = useState<Set<string>>(new Set());
  const [allCompletedDates, setAllCompletedDates] = useState<string[]>([]);
  const [loadingHabits, setLoadingHabits] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsubHabits = subscribeToHabits(user.uid, (data) => {
      setHabits(data);
      setLoadingHabits(false);
    });
    const unsubLogs = subscribeToTodayLogs(user.uid, setCompletedToday);
    const unsubAllLogs = subscribeToAllUserLogs(user.uid, (logs) =>
      setAllCompletedDates(logs.map((l) => l.fecha))
    );

    return () => {
      unsubHabits();
      unsubLogs();
      unsubAllLogs();
    };
  }, [user]);

  async function handleToggle(habitId: string) {
    if (!user) return;
    const isCompleted = completedToday.has(habitId);
    await toggleHabitToday(user.uid, habitId, !isCompleted);
  }

  const totalHabits = habits.length;
  const doneCount = habits.filter((h) => completedToday.has(h.id)).length;
  const progress = totalHabits > 0 ? Math.round((doneCount / totalHabits) * 100) : 0;
  const { current: streakTotal } = calculateStreaks(allCompletedDates);

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-8 pb-24 sm:pb-12">
      <div className="w-full max-w-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              {getGreeting()}, {user?.displayName?.split(" ")[0] ?? "👋"}
            </h1>
            <p className="mt-1 text-sm text-muted">Así va tu día</p>
          </div>

          {streakTotal > 0 && (
            <div className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-sm font-medium text-foreground">
              <Flame className="h-4 w-4 text-orange-400" />
              {streakTotal}
            </div>
          )}
        </div>

        {!loadingHabits && totalHabits > 0 && (
          <Card className="mt-5 p-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground font-medium">
                {doneCount} de {totalHabits} completados hoy
              </span>
              <span className="text-muted">{progress}%</span>
            </div>
            <div className="mt-3 h-2 w-full rounded-full bg-surface-hover">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-accent-from to-accent-to transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </Card>
        )}

        <Link
          href="/habitos/nuevo"
          className="mt-6 hidden w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-4 text-sm text-muted transition hover:border-accent-from hover:text-foreground sm:flex"
        >
          <Plus className="h-4 w-4" />
          Nuevo hábito
        </Link>

        <div className="mt-6 flex flex-col gap-3">
          {loadingHabits && (
            <>
              <Skeleton className="h-[68px]" />
              <Skeleton className="h-[68px]" />
            </>
          )}

          {!loadingHabits && habits.length === 0 && (
            <Card className="border-dashed p-10 text-center text-muted">
              Aún no tienes hábitos. Crea el primero{" "}
              <Link href="/habitos/nuevo" className="text-accent-from hover:underline">
                aquí
              </Link>
              .
            </Card>
          )}

          {habits.map((habit) => {
            const categoria = CATEGORIAS.find((c) => c.value === habit.categoria);
            const Icon = categoria?.icon;
            const completado = completedToday.has(habit.id);

            return (
              <Card
                key={habit.id}
                className="flex items-center justify-between px-5 py-4"
              >
                <Link
                  href={`/habitos/${habit.id}`}
                  className="flex items-center gap-3 min-w-0"
                >
                  <span
                    className="h-9 w-9 shrink-0 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${habit.color}26` }}
                  >
                    {Icon && <Icon className="h-5 w-5" style={{ color: habit.color }} />}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground hover:underline truncate">
                      {habit.nombre}
                    </p>
                    <p className="text-xs text-muted">
                      {frecuenciaLabel(habit)}
                      {habit.horaRecordatorio && ` · ${habit.horaRecordatorio}`}
                    </p>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={() => handleToggle(habit.id)}
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition ${
                    completado
                      ? "animate-pop border-success bg-success text-white"
                      : "border-border text-transparent hover:border-muted"
                  }`}
                  aria-label="Marcar como hecho hoy"
                >
                  <Check className="h-4 w-4" />
                </button>
              </Card>
            );
          })}
        </div>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}
