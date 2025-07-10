
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface Meal {
    id: string;
    name: string;
}

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const mealPlan = {
  "John Doe": { "Monday": "Lean Chicken & Quinoa", "Wednesday": "Salmon with Asparagus", "Friday": "Tofu Stir-fry" },
  "Jane Smith": { "Tuesday": "Salmon with Asparagus", "Thursday": "Lean Chicken & Quinoa" },
  "Peter Jones": { "Monday": "Tofu Stir-fry", "Wednesday": "Tofu Stir-fry", "Friday": "Lean Chicken & Quinoa" },
};

export default function MealPrepPage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMeals = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "menu"));
        const mealsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Meal));
        setMeals(mealsData);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error fetching menu",
          description: "Could not retrieve menu data for the meal prep schedule.",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchMeals();
  }, [toast]);

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
      <h1 className="text-3xl font-bold">Weekly Meal Prep</h1>
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
                {Object.entries(mealPlan).map(([name, schedule]) => (
                  <TableRow key={name}>
                    <TableCell className="font-medium">{name}</TableCell>
                    {daysOfWeek.map(day => (
                      <TableCell key={day}>
                        <Select defaultValue={schedule[day as keyof typeof schedule] || "none"}>
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
