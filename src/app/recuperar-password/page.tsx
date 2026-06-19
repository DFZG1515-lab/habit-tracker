"use client";

import { sendPasswordResetEmail } from "firebase/auth";
import Link from "next/link";
import { useState } from "react";
import { AuthBackground } from "@/components/AuthBackground";
import { GuestRoute } from "@/components/ProtectedRoute";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormField } from "@/components/ui/FormField";
import { auth } from "@/lib/firebase/client";
import { getFirebaseErrorMessage } from "@/lib/firebase/errors";

function RecuperarPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSubmitting(true);

    try {
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/login`,
      });
      setMessage("Si el correo existe, te enviamos un enlace para restablecer tu contraseña");
    } catch (err) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative flex flex-1 items-center justify-center px-4 py-12">
      <AuthBackground />
      <Card className="relative w-full max-w-sm p-8 shadow-xl">
        <h1 className="text-2xl font-semibold text-foreground">
          Recuperar contraseña
        </h1>
        <p className="mt-1 text-sm text-muted">
          Te enviaremos un enlace para restablecerla
        </p>

        {error && (
          <div className="mt-4">
            <Alert variant="error">{error}</Alert>
          </div>
        )}

        {message && (
          <div className="mt-4">
            <Alert variant="success">{message}</Alert>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <FormField
            label="Correo electrónico"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <Button type="submit" disabled={submitting} className="mt-2">
            {submitting ? "Enviando..." : "Enviar enlace"}
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

export default function RecuperarPasswordPage() {
  return (
    <GuestRoute>
      <RecuperarPasswordForm />
    </GuestRoute>
  );
}
