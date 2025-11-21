
"use client";

import React, { Suspense, useState } from 'react';
import { LoginForm } from "@/components/auth/login-form";
import { SignUpForm } from "@/components/auth/signup-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-provider";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


function AuthTabs() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = searchParams.get("tab") || "login";
  const { toast } = useToast();
  const [isTesting, setIsTesting] = useState(false);

  const onTabChange = (value: string) => {
    router.push(`/?tab=${value}`, { scroll: false });
  };
  
  const handlePublicTest = async () => {
    setIsTesting(true);
    try {
        const testCollection = collection(db, "test_writes");
        await addDoc(testCollection, {
            message: "Connection successful!",
            timestamp: serverTimestamp(),
        }).catch(serverError => {
            const permissionError = new FirestorePermissionError({
                path: testCollection.path,
                operation: 'create',
                requestResourceData: { message: "Connection successful!" }
            });
            errorEmitter.emit('permission-error', permissionError);
            throw permissionError;
        });

        toast({
            title: "Database Test Successful!",
            description: "App is connected to the correct database.",
        });

    } catch (e: any) {
        if (!(e instanceof FirestorePermissionError)) {
             toast({
                variant: "destructive",
                title: "Database Test Failed",
                description: "Could not write to the public test collection. Check console for details.",
            });
        }
        console.error("Public database test failed:", e);
    } finally {
        setIsTesting(false);
    }
  }

  return (
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
        <CardFooter className="flex-col gap-4">
             <div className="relative w-full flex items-center justify-center">
                <div className="flex-grow border-t border-muted-foreground/20"></div>
                <span className="flex-shrink mx-4 text-xs text-muted-foreground">OR</span>
                <div className="flex-grow border-t border-muted-foreground/20"></div>
            </div>
            <Button variant="outline" className="w-full" onClick={handlePublicTest} disabled={isTesting}>
                {isTesting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Test Database Connection
            </Button>
        </CardFooter>
      </Card>
    </Tabs>
  );
}

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();
  
  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);


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
        <Suspense fallback={<Skeleton className="h-[400px] w-full max-w-md" />}>
          <AuthTabs />
        </Suspense>
      </div>
    </div>
  );
}
