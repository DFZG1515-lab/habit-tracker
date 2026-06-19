const messages: Record<string, string> = {
  "auth/invalid-email": "El correo no es válido.",
  "auth/user-disabled": "Esta cuenta fue deshabilitada.",
  "auth/user-not-found": "No existe una cuenta con ese correo.",
  "auth/wrong-password": "Contraseña incorrecta.",
  "auth/invalid-credential": "Correo o contraseña incorrectos.",
  "auth/email-already-in-use": "Ya existe una cuenta con ese correo.",
  "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
  "auth/too-many-requests": "Demasiados intentos. Intenta más tarde.",
  "auth/expired-action-code": "El enlace expiró, solicita uno nuevo.",
  "auth/invalid-action-code": "El enlace no es válido o ya fue usado.",
};

export function getFirebaseErrorMessage(error: unknown): string {
  const code = (error as { code?: string })?.code;
  if (code && messages[code]) return messages[code];
  return "Ocurrió un error inesperado. Intenta de nuevo.";
}
