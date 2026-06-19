import {
  BookOpen,
  CheckCircle2,
  CircleDollarSign,
  Dumbbell,
  Moon,
  Sparkles,
  Star,
  Sunrise,
  type LucideIcon,
} from "lucide-react";

export type HabitCategory =
  | "imprescindibles"
  | "rutina_matutina"
  | "dormir_mejor"
  | "tareas_pendientes"
  | "salud"
  | "estudio"
  | "finanzas"
  | "otro";

export type HabitFrequency =
  | { type: "diaria" }
  | { type: "dias_semana"; dias: number[] } // 0=domingo ... 6=sábado
  | { type: "veces_por_semana"; veces: number };

export type Habit = {
  id: string;
  userId: string;
  nombre: string;
  categoria: HabitCategory;
  frecuencia: HabitFrequency;
  horaRecordatorio: string | null;
  color: string;
  createdAt: number;
};

export const CATEGORIAS: { value: HabitCategory; label: string; icon: LucideIcon }[] = [
  { value: "imprescindibles", label: "Hábitos imprescindibles", icon: Sparkles },
  { value: "rutina_matutina", label: "Rutina matutina", icon: Sunrise },
  { value: "dormir_mejor", label: "Dormir mejor", icon: Moon },
  { value: "tareas_pendientes", label: "Terminar tareas pendientes", icon: CheckCircle2 },
  { value: "salud", label: "Salud", icon: Dumbbell },
  { value: "estudio", label: "Estudio", icon: BookOpen },
  { value: "finanzas", label: "Finanzas", icon: CircleDollarSign },
  { value: "otro", label: "Otro", icon: Star },
];

export const COLORES = [
  "#6366f1",
  "#a855f7",
  "#06b6d4",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
];

export const DIAS_SEMANA = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
