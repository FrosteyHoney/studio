
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useCallback } from "react";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface Meal {
    id: string;
    name: string;
}

interface User {
    id: string;
    name: string;
}

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function MealPrepPage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [mealPlan, setMealPlan] = useState<Record<string, Record<string, string>>>({});
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [menuSnapshot, usersSnapshot, mealPlanSnapshot] = await Promise.all([
        getDocs(collection(db, "menu")),
        getDocs(collection(db, "users")),
        getDocs(collection(db, "mealPlans")),
      ]);

      const mealsData = menuSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Meal));
      setMeals(mealsData);

      const usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
      setUsers(usersData);
      
      const mealPlanData: Record<string, Record<string, string>> = {};
      mealPlanSnapshot.forEach(doc => {
        mealPlanData[doc.id] = doc.data() as Record<string, string>;
      });

      // Initialize plan for users not in the mealPlans collection yet
      usersData.forEach(user => {
        if (!mealPlanData[user.id]) {
          mealPlanData[user.id] = {};
        }
      });
      setMealPlan(mealPlanData);

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error fetching data",
        description: "Could not retrieve data for the meal prep schedule.",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePlanChange = (userId: string, day: string, mealName: string) => {
    setMealPlan(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [day]: mealName === "none" ? "" : mealName,
      }
    }));
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const savePromises = Object.entries(mealPlan).map(([userId, schedule]) => {
        const planRef = doc(db, "mealPlans", userId);
        // Ensure we don't save empty schedules if a user has no meals planned
        const filteredSchedule = Object.fromEntries(Object.entries(schedule).filter(([, meal]) => meal));
        return setDoc(planRef, filteredSchedule);
      });
      await Promise.all(savePromises);
      toast({
        title: "Meal Plan Saved",
        description: "All meal prep changes have been successfully saved.",
      });
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Error Saving Plan",
        description: "Could not save the meal plan. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Weekly Meal Prep</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Meal Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-48 w-full" />
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Weekly Meal Prep</h1>
        <Button onClick={handleSaveChanges} disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Meal Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Member</TableHead>
                  {daysOfWeek.map(day => <TableHead key={day}>{day}</TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    {daysOfWeek.map(day => (
                      <TableCell key={day}>
                        <Select 
                          value={mealPlan[user.id]?.[day] || "none"}
                          onValueChange={(value) => handlePlanChange(user.id, day, value)}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select a meal" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {meals.map(meal => (
                               <SelectItem key={meal.id} value={meal.name}>{meal.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
