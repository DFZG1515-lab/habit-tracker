"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "./AuthProvider";

function FullPageLoader() {
  return (
    <main className="flex flex-1 justify-center px-4 py-8">
      <div className="w-full max-w-2xl flex flex-col gap-3">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-[68px]" />
        <Skeleton className="h-[68px]" />
      </div>
    </main>
  );
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return <FullPageLoader />;
  }

  return <>{children}</>;
}

export function GuestRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [loading, user, router]);

  if (loading || user) {
    return <FullPageLoader />;
  }

  return <>{children}</>;
}
