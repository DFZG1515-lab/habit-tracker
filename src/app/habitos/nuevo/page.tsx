"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormField } from "@/components/ui/FormField";
import { createHabit } from "@/lib/habits/api";
import {
  CATEGORIAS,
  COLORES,
  DIAS_SEMANA,
  type HabitCategory,
} from "@/lib/habits/types";

type FrecuenciaTipo = "diaria" | "dias_semana" | "veces_por_semana";

function NuevoHabitoForm() {
  const { user } = useAuth();
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState<HabitCategory>("imprescindibles");
  const [frecuenciaTipo, setFrecuenciaTipo] = useState<FrecuenciaTipo>("diaria");
  const [diasSeleccionados, setDiasSeleccionados] = useState<number[]>([]);
  const [vecesPorSemana, setVecesPorSemana] = useState(3);
  const [horaRecordatorio, setHoraRecordatorio] = useState("");
  const [color, setColor] = useState(COLORES[0]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function toggleDia(dia: number) {
    setDiasSeleccionados((prev) =>
      prev.includes(dia) ? prev.filter((d) => d !== dia) : [...prev, dia]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!nombre.trim()) {
      setError("Ponle un nombre a tu hábito");
      return;
    }

    if (frecuenciaTipo === "dias_semana" && diasSeleccionados.length === 0) {
      setError("Selecciona al menos un día de la semana");
      return;
    }

    if (!user) return;
    setSubmitting(true);

    try {
      await createHabit({
        userId: user.uid,
        nombre: nombre.trim(),
        categoria,
        frecuencia:
          frecuenciaTipo === "diaria"
            ? { type: "diaria" }
            : frecuenciaTipo === "dias_semana"
              ? { type: "dias_semana", dias: diasSeleccionados }
              : { type: "veces_por_semana", veces: vecesPorSemana },
        horaRecordatorio: horaRecordatorio || null,
        color,
      });
      router.push("/");
    } catch {
      setError("No se pudo crear el hábito. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex flex-1 justify-center px-4 py-8 pb-24 sm:pb-12">
      <Card className="w-full max-w-lg p-8 shadow-xl animate-card-in">
        <h1 className="text-2xl font-semibold text-foreground">Crear un hábito</h1>
        <p className="mt-1 text-sm text-muted">
          Define qué quieres lograr y con qué frecuencia
        </p>

        {error && (
          <div className="mt-4">
            <Alert variant="error">{error}</Alert>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-6">
          <FormField
            label="Nombre del hábito"
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej. Beber agua"
            required
          />

          <div className="flex flex-col gap-2">
            <span className="text-sm text-muted">Categoría</span>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIAS.map((c) => {
                const Icon = c.icon;
                return (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setCategoria(c.value)}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-3 text-left text-sm transition ${
                      categoria === c.value
                        ? "border-accent-from bg-accent-from/10 text-foreground"
                        : "border-border bg-surface-hover/40 text-muted hover:border-muted"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm text-muted">Frecuencia</span>
            <div className="flex gap-2">
              {(
                [
                  { value: "diaria", label: "Todos los días" },
                  { value: "dias_semana", label: "Días específicos" },
                  { value: "veces_por_semana", label: "X veces/semana" },
                ] as const
              ).map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFrecuenciaTipo(f.value)}
                  className={`flex-1 rounded-xl border px-3 py-2 text-xs transition ${
                    frecuenciaTipo === f.value
                      ? "border-accent-from bg-accent-from/10 text-foreground"
                      : "border-border bg-surface-hover/40 text-muted hover:border-muted"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {frecuenciaTipo === "dias_semana" && (
              <div className="flex gap-1.5 pt-1">
                {DIAS_SEMANA.map((dia, idx) => (
                  <button
                    key={dia}
                    type="button"
                    onClick={() => toggleDia(idx)}
                    className={`h-9 w-9 rounded-full text-xs font-medium transition ${
                      diasSeleccionados.includes(idx)
                        ? "bg-accent-from text-white"
                        : "bg-surface-hover text-muted hover:text-foreground"
                    }`}
                  >
                    {dia}
                  </button>
                ))}
              </div>
            )}

            {frecuenciaTipo === "veces_por_semana" && (
              <div className="flex items-center gap-3 pt-1">
                <input
                  type="range"
                  min={1}
                  max={7}
                  value={vecesPorSemana}
                  onChange={(e) => setVecesPorSemana(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm text-muted">
                  {vecesPorSemana} {vecesPorSemana === 1 ? "vez" : "veces"} por semana
                </span>
              </div>
            )}
          </div>

          <FormField
            label="Recordatorio (opcional)"
            type="time"
            value={horaRecordatorio}
            onChange={(e) => setHoraRecordatorio(e.target.value)}
          />

          <div className="flex flex-col gap-2">
            <span className="text-sm text-muted">Color</span>
            <div className="flex gap-2">
              {COLORES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`h-8 w-8 rounded-full transition ${
                    color === c ? "ring-2 ring-foreground ring-offset-2 ring-offset-surface" : ""
                  }`}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push("/")}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting} className="flex-1">
              {submitting ? "Creando..." : "Crear hábito"}
            </Button>
          </div>
        </form>
      </Card>
    </main>
  );
}

export default function NuevoHabitoPage() {
  return (
    <ProtectedRoute>
      <NuevoHabitoForm />
    </ProtectedRoute>
  );
}
