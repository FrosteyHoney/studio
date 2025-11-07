
"use client";

import { LoginForm } from "@/components/auth/login-form";
import { SignUpForm } from "@/components/auth/signup-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams, useRouter } from "next/navigation";

export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = searchParams.get("tab") || "login";

  const onTabChange = (value: string) => {
    router.push(`/?tab=${value}`);
  };

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
