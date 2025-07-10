
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useCallback, useMemo } from "react";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Flame, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { format, startOfWeek, endOfWeek } from "date-fns";

interface Meal {
    id: string;
    name: string;
    calories: number;
}

interface User {
    id: string;
    name: string;
}

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const mealTypes = ["Breakfast", "Lunch", "Dinner"];

export default function MealPrepPage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [mealPlan, setMealPlan] = useState<Record<string, Record<string, string>>>({});
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const mealsByName = useMemo(() => {
    return meals.reduce((acc, meal) => {
        acc[meal.name] = meal;
        return acc;
    }, {} as Record<string, Meal>);
  }, [meals]);

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

  const handlePlanChange = (userId: string, day: string, mealType: string, mealName: string) => {
    const key = `${day}_${mealType}`;
    setMealPlan(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [key]: mealName === "none" ? "" : mealName,
      }
    }));
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const savePromises = Object.entries(mealPlan).map(([userId, schedule]) => {
        const planRef = doc(db, "mealPlans", userId);
        // Using setDoc with merge: true will create the document if it doesn't exist,
        // or update it if it does. This ensures the collection is created.
        return setDoc(planRef, schedule, { merge: true });
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

  const calculateDailyCalories = (userId: string, day: string) => {
    const userPlan = mealPlan[userId] || {};
    let totalCalories = 0;
    mealTypes.forEach(mealType => {
        const key = `${day}_${mealType}`;
        const mealName = userPlan[key];
        if (mealName && mealsByName[mealName]) {
            totalCalories += mealsByName[mealName].calories;
        }
    });
    return totalCalories;
  };
  
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 }); // Sunday
  const weekRange = `${format(weekStart, 'MMMM d')} - ${format(weekEnd, 'MMMM d')}`;

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <CardDescription>{weekRange}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
              <Input 
                placeholder="Search by member name..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px] min-w-[150px] sticky left-0 bg-card z-10">Member</TableHead>
                  {daysOfWeek.map(day => <TableHead key={day} className="min-w-[220px]">{day}</TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium sticky left-0 bg-card z-10">{user.name}</TableCell>
                    {daysOfWeek.map(day => (
                      <TableCell key={day}>
                        <div className="grid gap-2">
                            {mealTypes.map(mealType => {
                                const key = `${day}_${mealType}`;
                                return (
                                    <div key={key} className="grid w-full max-w-sm items-center gap-1.5">
                                        <Label htmlFor={key} className="text-xs text-muted-foreground">{mealType}</Label>

                                        <Select 
                                            value={mealPlan[user.id]?.[key] || "none"}
                                            onValueChange={(value) => handlePlanChange(user.id, day, mealType, value)}
                                        >
                                            <SelectTrigger id={key} className="w-[180px]">
                                                <SelectValue placeholder="Select a meal" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">None</SelectItem>
                                                {meals.map(meal => (
                                                <SelectItem key={meal.id} value={meal.name}>{meal.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )
                            })}
                            <div className="mt-2 flex items-center gap-2 border-t pt-2">
                                <Flame className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-semibold">{calculateDailyCalories(user.id, day)}</span>
                                <span className="text-xs text-muted-foreground">kcal</span>
                            </div>
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={daysOfWeek.length + 1} className="h-24 text-center">
                      No members found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
