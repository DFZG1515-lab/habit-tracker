"use client";

import { confirmPasswordReset } from "firebase/auth";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormField } from "@/components/ui/FormField";
import { auth } from "@/lib/firebase/client";
import { getFirebaseErrorMessage } from "@/lib/firebase/errors";

function ActualizarPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const oobCode = searchParams.get("oobCode");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!oobCode) {
      setError("El enlace no es válido o ya fue usado.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setSubmitting(true);

    try {
      await confirmPasswordReset(auth, oobCode, password);
      router.push("/login?message=Contraseña+actualizada,+inicia+sesión");
    } catch (err) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <Card className="w-full max-w-sm p-8 shadow-xl animate-card-in">
        <h1 className="text-2xl font-semibold text-foreground">
          Nueva contraseña
        </h1>
        <p className="mt-1 text-sm text-muted">
          Elige una contraseña nueva para tu cuenta
        </p>

        {error && (
          <div className="mt-4">
            <Alert variant="error">{error}</Alert>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <FormField
            label="Nueva contraseña"
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
            {submitting ? "Actualizando..." : "Actualizar contraseña"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          <Link href="/login" className="text-accent-from hover:text-accent-to">
            Volver a iniciar sesión
          </Link>
        </p>
      </Card>
    </main>
  );
}

export default function ActualizarPasswordPage() {
  return (
    <Suspense>
      <ActualizarPasswordForm />
    </Suspense>
  );
}
