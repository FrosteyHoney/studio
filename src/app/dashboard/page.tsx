
"use client";

import { ProgressChart } from "@/components/dashboard/progress-chart";
import { LogWorkout } from "@/components/dashboard/log-workout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UserStatsCards } from "@/components/dashboard/user-stats-cards";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-provider";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

export default function DashboardPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isTesting, setIsTesting] = useState(false);

  const handleTestDatabase = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Not Authenticated",
        description: "You must be logged in to test the database.",
      });
      return;
    }

    setIsTesting(true);
    try {
      const historyCollectionRef = collection(db, "users", user.uid, "statHistory");
      await addDoc(historyCollectionRef, {
        test: true,
        date: new Date().toISOString(),
      }).catch(serverError => {
        // This will be caught by the generic catch block below, but we can emit a more specific error here.
        const permissionError = new FirestorePermissionError({
            path: historyCollectionRef.path,
            operation: 'create',
            requestResourceData: { test: true }
        });
        errorEmitter.emit('permission-error', permissionError);
        // Throw to be caught by the outer try/catch
        throw permissionError;
      });

      toast({
        title: "Database Test Successful",
        description: "Successfully wrote test data to your user record.",
      });
    } catch (error: any) {
      console.error("Database test failed:", error);
      // The FirebaseErrorListener will show a generic permission error toast.
      // If we want a more specific one for this button, we can add it here.
      if (!(error instanceof FirestorePermissionError)) {
          toast({
            variant: "destructive",
            title: "Database Test Failed",
            description: "Could not write to the database. Check console for details.",
          });
      }
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <UserStatsCards />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Progress Over Time</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ProgressChart />
          </CardContent>
        </Card>
        <Card className="col-span-4 lg:col-span-3">
          <CardHeader>
            <CardTitle>Log Workout</CardTitle>
          </CardHeader>
          <CardContent>
            <LogWorkout />
          </CardContent>
        </Card>
      </div>
       <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Database Connection Test</CardTitle>
            <CardDescription>
              Click the button below to verify that the app can successfully write to the Firestore database.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleTestDatabase} disabled={isTesting}>
              {isTesting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Test Database Write
            </Button>
          </CardContent>
        </Card>
    </div>
  );
}
