
"use client";

import { useAuth } from "@/contexts/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function FoodLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
       <div className="flex-1 space-y-4 p-8 pt-6">
        <Skeleton className="h-10 w-1/3" />
        <div className="space-y-4">
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-80 w-full rounded-lg" />
        </div>
       </div>
    );
  }

  return <>{children}</>;
}
