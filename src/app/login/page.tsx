"use client";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { AuthBackground } from "@/components/AuthBackground";
import { GuestRoute } from "@/components/ProtectedRoute";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormField } from "@/components/ui/FormField";
import { auth } from "@/lib/firebase/auth";
import { getFirebaseErrorMessage } from "@/lib/firebase/errors";

type Tab = "login" | "registro";

function AuthTabs({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  return (
    <div className="relative flex rounded-xl bg-surface-hover p-1">
      <div
        className="absolute inset-y-1 w-[calc(50%-0.25rem)] rounded-lg bg-gradient-to-r from-accent-from to-accent-to transition-transform duration-300 ease-out"
        style={{
          transform: tab === "login" ? "translateX(0%)" : "translateX(calc(100% + 0.5rem))",
        }}
      />
      {(
        [
          { value: "login", label: "Iniciar sesión" },
          { value: "registro", label: "Registrarse" },
        ] as const
      ).map((t) => (
        <button
          key={t.value}
          type="button"
          onClick={() => onChange(t.value)}
          className={`relative z-10 flex-1 rounded-lg py-2 text-sm font-medium transition-colors duration-300 ${
            tab === t.value ? "text-black" : "text-muted hover:text-foreground"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function LoginFields({ onSubmitted }: { onSubmitted: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      onSubmitted();
    } catch (err) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
      {error && <Alert variant="error">{error}</Alert>}

      <FormField
        label="Correo electrónico"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        required
      />

      <FormField
        label="Contraseña"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
        required
      />

      <Link
        href="/recuperar-password"
        className="self-end text-xs text-accent-from hover:underline"
      >
        ¿Olvidaste tu contraseña?
      </Link>

      <Button type="submit" disabled={submitting} className="mt-2">
        {submitting ? "Iniciando sesión..." : "Iniciar sesión"}
      </Button>
    </form>
  );
}

function RegistroFields({ onSubmitted }: { onSubmitted: () => void }) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setSubmitting(true);

    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(user, { displayName: nombre });
      onSubmitted();
    } catch (err) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
      {error && <Alert variant="error">{error}</Alert>}

      <FormField
        label="Nombre"
        type="text"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        autoComplete="name"
        required
      />

      <FormField
        label="Correo electrónico"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        required
      />

      <FormField
        label="Contraseña"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="new-password"
        minLength={6}
        required
      />

      <FormField
        label="Confirmar contraseña"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        autoComplete="new-password"
        minLength={6}
        required
      />

      <Button type="submit" disabled={submitting} className="mt-2">
        {submitting ? "Creando cuenta..." : "Registrarme"}
      </Button>
    </form>
  );
}

function AuthCard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get("message");
  const [tab, setTab] = useState<Tab>(
    searchParams.get("tab") === "registro" ? "registro" : "login"
  );

  return (
    <main className="relative flex flex-1 items-center justify-center px-4 py-12">
      <AuthBackground />

      <Card className="relative w-full max-w-sm p-8 shadow-xl animate-card-in">
        <div className="flex items-center gap-2 text-accent-from">
          <Sparkles className="h-5 w-5" />
          <span className="text-xs font-medium uppercase tracking-wide">
            Habit Tracker
          </span>
        </div>
        <div key={tab} className="animate-fade-slide-in">
          <h1 className="mt-3 text-2xl font-semibold text-foreground">
            {tab === "login" ? "Bienvenido de vuelta" : "Crea tu cuenta"}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {tab === "login"
              ? "Inicia sesión para seguir con tus hábitos"
              : "Empieza a construir mejores hábitos hoy"}
          </p>
        </div>

        <div className="mt-6">
          <AuthTabs tab={tab} onChange={setTab} />
        </div>

        {message && (
          <div className="mt-4">
            <Alert variant="success">{message}</Alert>
          </div>
        )}

        <div key={tab} className="animate-fade-slide-in">
          {tab === "login" ? (
            <LoginFields onSubmitted={() => router.push("/")} />
          ) : (
            <RegistroFields onSubmitted={() => router.push("/")} />
          )}
        </div>
      </Card>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <GuestRoute>
        <AuthCard />
      </GuestRoute>
    </Suspense>
  );
}
