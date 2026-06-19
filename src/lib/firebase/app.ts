import { getApps, initializeApp, type FirebaseApp } from "firebase/app";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Solo se usa en el navegador (todo lo que lo consume es client component),
// pero Next.js igual carga este módulo durante el prerender en el servidor, donde
// las env vars públicas pueden no estar disponibles. Evitamos inicializar ahí.
export const firebaseApp: FirebaseApp | undefined =
  typeof window !== "undefined"
    ? getApps().length
      ? getApps()[0]
      : initializeApp(firebaseConfig)
    : undefined;
