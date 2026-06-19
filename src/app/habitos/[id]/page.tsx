"use client";

import { ChevronLeft, ChevronRight, Flame, Trash2, Trophy } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { deleteHabit, getHabit, subscribeToHabitLogs } from "@/lib/habits/api";
import { calculateStreaks } from "@/lib/habits/streak";
import { CATEGORIAS, type Habit } from "@/lib/habits/types";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function buildMonthGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = firstDay.getDay();

  const cells: (string | null)[] = Array(startOffset).fill(null);
  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    cells.push(dateKey);
  }
  return cells;
}

function HabitDetail() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [habit, setHabit] = useState<Habit | null>(null);
  const [completedDates, setCompletedDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewDate, setViewDate] = useState(() => new Date());

  useEffect(() => {
    getHabit(params.id).then((h) => {
      setHabit(h);
      setLoading(false);
    });
  }, [params.id]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToHabitLogs(user.uid, params.id, (logs) =>
      setCompletedDates(logs.map((l) => l.fecha))
    );
    return unsub;
  }, [user, params.id]);

  async function handleDelete() {
    if (!confirm("¿Eliminar este hábito? Esta acción no se puede deshacer.")) return;
    await deleteHabit(params.id);
    router.push("/");
  }

  if (loading) {
    return (
      <main className="flex flex-1 justify-center px-4 py-8">
        <div className="w-full max-w-lg flex flex-col gap-3">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-24" />
          <Skeleton className="h-72" />
        </div>
      </main>
    );
  }

  if (!habit) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 text-muted">
        <p>No se encontró este hábito.</p>
        <Link href="/" className="text-accent-from hover:text-accent-to">
          Volver al inicio
        </Link>
      </main>
    );
  }

  const categoria = CATEGORIAS.find((c) => c.value === habit.categoria);
  const Icon = categoria?.icon;
  const { current, best } = calculateStreaks(completedDates);
  const completedSet = new Set(completedDates);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const cells = buildMonthGrid(year, month);

  function changeMonth(delta: number) {
    setViewDate(new Date(year, month + delta, 1));
  }

  return (
    <main className="flex flex-1 justify-center px-4 py-8 pb-24 sm:pb-12">
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1 text-sm text-muted hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Volver
          </Link>
          <Button variant="danger" onClick={handleDelete} className="px-3 py-2">
            <Trash2 className="h-4 w-4" />
            Eliminar
          </Button>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${habit.color}26` }}
          >
            {Icon && <Icon className="h-5 w-5" style={{ color: habit.color }} />}
          </span>
          <h1 className="text-2xl font-semibold text-foreground">{habit.nombre}</h1>
        </div>
        {habit.horaRecordatorio && (
          <p className="mt-1 text-sm text-muted">
            Recordatorio: {habit.horaRecordatorio}
          </p>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Card className="p-5">
            <div className="flex items-center gap-2 text-foreground">
              <Flame className="h-5 w-5 text-orange-400" />
              <p className="text-3xl font-bold">{current}</p>
            </div>
            <p className="mt-1 text-sm text-muted">días de racha actual</p>
          </Card>
          <Card className="bg-gradient-to-br from-accent-from/20 to-accent-to/20 p-5">
            <div className="flex items-center gap-2 text-foreground">
              <Trophy className="h-5 w-5 text-amber-400" />
              <p className="text-3xl font-bold">{best}</p>
            </div>
            <p className="mt-1 text-sm text-muted">mejor racha</p>
          </Card>
        </div>

        <Card className="mt-6 p-5">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              className="rounded-lg p-1.5 text-muted hover:bg-surface-hover hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="text-sm font-medium text-foreground">
              {MESES[month]} {year}
            </p>
            <button
              type="button"
              onClick={() => changeMonth(1)}
              className="rounded-lg p-1.5 text-muted hover:bg-surface-hover hover:text-foreground"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1.5 text-center text-xs text-muted">
            {["D", "L", "M", "M", "J", "V", "S"].map((d, i) => (
              <span key={i}>{d}</span>
            ))}
          </div>

          <div className="mt-1.5 grid grid-cols-7 gap-1.5">
            {cells.map((dateKey, idx) => {
              if (!dateKey) return <span key={idx} />;
              const done = completedSet.has(dateKey);
              const day = Number(dateKey.slice(-2));
              return (
                <div
                  key={dateKey}
                  className={`flex aspect-square items-center justify-center rounded-md text-xs transition ${
                    done
                      ? "bg-success text-white"
                      : "bg-surface-hover text-muted"
                  }`}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </main>
  );
}

export default function HabitDetailPage() {
  return (
    <ProtectedRoute>
      <HabitDetail />
    </ProtectedRoute>
  );
}
