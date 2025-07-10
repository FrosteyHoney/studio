
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import Image from "next/image";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Skeleton } from "../ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface Meal {
    id: string;
    name: string;
    calories?: number;
    price: number;
    description: string;
    image?: string;
    hint?: string;
}

export function MealPlan() {
    const [meals, setMeals] = useState<Meal[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchMeals = async () => {
            setLoading(true);
            const querySnapshot = await getDocs(collection(db, "menu"));
            const mealsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Meal));
            setMeals(mealsData);
            setLoading(false);
        };
        fetchMeals();
    }, []);

    const handleBookClick = () => {
        toast({
            title: "Booking Not Available",
            description: "This functionality is currently disabled.",
            variant: "destructive",
        });
    }

    return (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Select a day and see available meals for the upcoming week.</p>
            <div className="grid gap-8 md:grid-cols-2">
                <div className="flex justify-center">
                    <Calendar
                        mode="single"
                        selected={new Date()}
                        className="rounded-md border"
                    />
                </div>
                <div className="space-y-4">
                    <h3 className="font-semibold">Available for selected day:</h3>
                    {loading && (
                        <>
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-24 w-full" />
                        </>
                    )}
                    {!loading && meals.map((meal) => (
                        <Card key={meal.id} className="flex items-center">
                            <CardHeader className="p-2">
                            <Image src={meal.image || "https://placehold.co/80x80.png"} alt={meal.name} width={80} height={80} className="rounded-md" data-ai-hint={meal.name.split(' ').slice(0,2).join(' ')} />
                            </CardHeader>
                            <CardContent className="p-4 flex-1">
                                <h4 className="font-semibold">{meal.name}</h4>
                                <p className="text-sm text-muted-foreground">{meal.description}</p>
                            </CardContent>
                            <CardFooter className="p-4 flex flex-col items-end gap-1">
                                <span className="font-bold text-lg">R{meal.price.toFixed(2)}</span>
                                <Button variant="outline" onClick={handleBookClick} disabled>Book</Button>
                            </CardFooter>
                        </Card>
                    ))}
                     {!loading && meals.length === 0 && (
                        <p className="text-sm text-muted-foreground">No meals are available on the menu yet.</p>
                     )}
                </div>
            </div>
        </div>
    );
}
