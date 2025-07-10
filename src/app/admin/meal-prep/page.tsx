
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useCallback, useMemo } from "react";
import { collection, getDocs, doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Flame, Loader2, Sparkles } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { format, startOfWeek, endOfWeek } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { generateMealPlan } from "@/ai/flows/generate-meal-plan-flow";

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
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [calories, setCalories] = useState("1800");
  const [currentUserForGeneration, setCurrentUserForGeneration] = useState<User | null>(null);
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
      const [menuSnapshot, usersSnapshot] = await Promise.all([
        getDocs(collection(db, "menu")),
        getDocs(collection(db, "users")),
      ]);

      const mealsData = menuSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Meal));
      setMeals(mealsData);

      const usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
      setUsers(usersData);
      
      const planPromises = usersData.map(user => getDoc(doc(db, "mealPlans", user.id)));
      const planSnapshots = await Promise.all(planPromises);

      const mealPlanData: Record<string, Record<string, string>> = {};
      planSnapshots.forEach((planSnap, index) => {
          const userId = usersData[index].id;
          if(planSnap.exists()) {
              mealPlanData[userId] = planSnap.data() as Record<string, string>;
          } else {
              mealPlanData[userId] = {};
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

  const handleGeneratePlan = async () => {
    if (!currentUserForGeneration || !calories) return;
    setIsGenerating(currentUserForGeneration.id);
    setDialogOpen(false);
    try {
      const allMeals = (await getDocs(collection(db, "menu"))).docs.map(doc => doc.data() as { name: string, calories: number });
      
      const result = await generateMealPlan({
        calorieTarget: parseInt(calories, 10),
        meals: allMeals
      });

      setMealPlan(prev => {
        const newPlan = { ...prev[currentUserForGeneration.id] };
        daysOfWeek.forEach(day => {
          mealTypes.forEach(mealType => {
            const planKey = `${day}_${mealType}`;
            const generatedMeal = result.plan[day.toLowerCase() as keyof typeof result.plan]?.[mealType.toLowerCase() as keyof typeof result.plan.monday];
            if(generatedMeal && meals.find(m => m.name === generatedMeal)) {
              newPlan[planKey] = generatedMeal;
            }
          });
        });
        return { ...prev, [currentUserForGeneration.id]: newPlan };
      });

      toast({
        title: "Plan Generated!",
        description: `A new meal plan has been created for ${currentUserForGeneration.name}.`,
      });

    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "AI Generation Failed",
        description: error.message || "The AI could not generate a meal plan. Please try again.",
      });
    } finally {
      setIsGenerating(null);
      setCurrentUserForGeneration(null);
    }
  };
  
  const openGenerationDialog = (user: User) => {
    setCurrentUserForGeneration(user);
    setDialogOpen(true);
  }

  const calculateDailyCalories = (userId: string, day: string) => {
    const userPlan = mealPlan[userId] || {};
    let totalCalories = 0;
    mealTypes.forEach(mealType => {
        const key = `${day}_${mealType}`;
        const mealName = userPlan[key];
        if (mealName && mealsByName[mealName]) {
            const calories = mealsByName[mealName].calories;
            if (typeof calories === 'number' && !isNaN(calories)) {
                totalCalories += calories;
            }
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
          Save All Changes
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
                  <TableHead className="w-[250px] min-w-[250px] sticky left-0 bg-card z-10">Member</TableHead>
                  {daysOfWeek.map(day => <TableHead key={day} className="min-w-[220px]">{day}</TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium sticky left-0 bg-card z-10">
                      <div className="flex items-center gap-2">
                        <span>{user.name}</span>
                        <Button size="sm" variant="outline" onClick={() => openGenerationDialog(user)} disabled={!!isGenerating}>
                          {isGenerating === user.id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Sparkles className="mr-2 h-4 w-4" />
                          )}
                          Generate Plan
                        </Button>
                      </div>
                    </TableCell>
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

      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Meal Plan for {currentUserForGeneration?.name}</DialogTitle>
            <DialogDescription>
              Enter a daily calorie target. The AI will generate a 7-day meal plan based on the available meals.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="calories" className="text-right">
                Daily Calories
              </Label>
              <Input
                id="calories"
                type="number"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleGeneratePlan} disabled={!calories}>Generate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
