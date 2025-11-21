
"use client";

import { ProgressChart } from "@/components/dashboard/progress-chart";
import { LogWorkout } from "@/components/dashboard/log-workout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserStatsCards } from "@/components/dashboard/user-stats-cards";
import { Button } from "@/components/ui/button";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "@/hooks/use-toast";
import { Wifi } from "lucide-react";

export default function DashboardPage() {
  const handleTestConnection = async () => {
    try {
      const testDocRef = doc(db, "test", "connection");
      await setDoc(testDocRef, { status: "connected", timestamp: new Date() });
      console.log("Database connection successful!");
      toast({
        title: "Connection Success!",
        description: "Successfully connected to and wrote to the database.",
      });
    } catch (error: any) {
      console.error("Database connection test failed:", error.message);
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: `Could not write to the database. Error: ${error.message}`,
      });
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <Button variant="outline" onClick={handleTestConnection}>
          <Wifi className="mr-2 h-4 w-4" />
          Test DB Connection
        </Button>
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
    </div>
  );
}
