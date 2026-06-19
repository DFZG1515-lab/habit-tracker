import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase/firestore";
import type { Habit, HabitCategory, HabitFrequency } from "./types";

export type HabitLog = {
  fecha: string;
  completado: boolean;
};

export async function createHabit(params: {
  userId: string;
  nombre: string;
  categoria: HabitCategory;
  frecuencia: HabitFrequency;
  horaRecordatorio: string | null;
  color: string;
}) {
  await addDoc(collection(db, "habits"), {
    ...params,
    createdAt: Date.now(),
  });
}

export function subscribeToHabits(
  userId: string,
  onChange: (habits: Habit[]) => void
) {
  const q = query(collection(db, "habits"), where("userId", "==", userId));

  return onSnapshot(q, (snapshot) => {
    const habits = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Habit[];

    habits.sort((a, b) => b.createdAt - a.createdAt);
    onChange(habits);
  });
}

export async function getHabit(habitId: string): Promise<Habit | null> {
  const snap = await getDoc(doc(db, "habits", habitId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Habit;
}

export async function deleteHabit(habitId: string) {
  await deleteDoc(doc(db, "habits", habitId));
}

export function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export async function toggleHabitToday(
  userId: string,
  habitId: string,
  completed: boolean
) {
  const logId = `${habitId}_${todayKey()}`;
  await setDoc(doc(db, "habit_logs", logId), {
    userId,
    habitId,
    fecha: todayKey(),
    completado: completed,
  });
}

export function subscribeToTodayLogs(
  userId: string,
  onChange: (completedHabitIds: Set<string>) => void
) {
  const q = query(
    collection(db, "habit_logs"),
    where("userId", "==", userId),
    where("fecha", "==", todayKey())
  );

  return onSnapshot(q, (snapshot) => {
    const completed = new Set<string>();
    snapshot.docs.forEach((d) => {
      const data = d.data();
      if (data.completado) completed.add(data.habitId);
    });
    onChange(completed);
  });
}

export function subscribeToAllUserLogs(
  userId: string,
  onChange: (logs: HabitLog[]) => void
) {
  const q = query(collection(db, "habit_logs"), where("userId", "==", userId));

  return onSnapshot(q, (snapshot) => {
    const logs = snapshot.docs
      .map((d) => d.data() as HabitLog)
      .filter((log) => log.completado);
    onChange(logs);
  });
}

export function subscribeToHabitLogs(
  userId: string,
  habitId: string,
  onChange: (logs: HabitLog[]) => void
) {
  const q = query(
    collection(db, "habit_logs"),
    where("userId", "==", userId),
    where("habitId", "==", habitId)
  );

  return onSnapshot(q, (snapshot) => {
    const logs = snapshot.docs
      .map((d) => d.data() as HabitLog)
      .filter((log) => log.completado);
    onChange(logs);
  });
}
