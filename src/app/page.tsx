
"use client";

import { LoginForm } from "@/components/auth/login-form";
import { SignUpForm } from "@/components/auth/signup-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-provider";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const tab = searchParams.get("tab") || "login";

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const onTabChange = (value: string) => {
    router.push(`/?tab=${value}`);
  };

  if (loading || user) {
    return (
        <div className="flex flex-col min-h-[calc(100vh-3.5rem)] items-center justify-center p-4">
            <div className="flex items-center space-x-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-32" />
                <p>Redirecting...</p>
            </div>
        </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-3.5rem)] items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Tabs value={tab} onValueChange={onTabChange} className="w-full">
            <Card className="border-none shadow-none bg-transparent">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl">Committed Bodies</CardTitle>
                <CardDescription>Welcome back to your fitness journey</CardDescription>
              </CardHeader>
              <CardContent>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                <TabsContent value="login">
                    <LoginForm />
                </TabsContent>
                <TabsContent value="signup">
                    <SignUpForm />
                </TabsContent>
              </CardContent>
            </Card>
        </Tabs>
      </div>
    </div>
  );
}
