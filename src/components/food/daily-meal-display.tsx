
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-provider";
import { doc, getDoc, collection, query, where, getDocs, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Utensils, Salad, Beef, UtensilsCrossed, CakeSlice, Coffee, Martini, Soup, Sandwich, Fish, Apple } from "lucide-react";


interface Meal {
    id: string;
    name: string;
    description: string;
    price: number;
    image?: string;
    calories?: number;
}

interface TodaysMeals {
    Breakfast?: Meal | null;
    Lunch?: Meal | null;
    Dinner?: Meal | null;
}

const mealTypes = ["Breakfast", "Lunch", "Dinner"];

export function DailyMealDisplay() {
    const { user, loading: authLoading } = useAuth();
    const [todaysMeals, setTodaysMeals] = useState<TodaysMeals>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentDay, setCurrentDay] = useState("");

    useEffect(() => {
        const fetchTodaysMeal = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const dayOfWeek = format(new Date(), 'EEEE'); // e.g., "Monday"
                setCurrentDay(dayOfWeek);

                const planRef = doc(db, "mealPlans", user.uid);
                const planSnap = await getDoc(planRef);
                
                if (planSnap.exists()) {
                    const planData = planSnap.data();
                    const mealNamesForToday: Record<string, string> = {};
                    
                    mealTypes.forEach(mealType => {
                        const key = `${dayOfWeek}_${mealType}`;
                        if (planData[key]) {
                            mealNamesForToday[mealType] = planData[key];
                        }
                    });

                    if (Object.keys(mealNamesForToday).length > 0) {
                        const menuRef = collection(db, "menu");
                        const mealNames = Object.values(mealNamesForToday);
                        const q = query(menuRef, where("name", "in", mealNames));
                        const querySnapshot = await getDocs(q);
                        
                        const fetchedMeals = querySnapshot.docs.reduce((acc, doc) => {
                            const mealData = { id: doc.id, ...doc.data() } as Meal;
                            acc[mealData.name] = mealData;
                            return acc;
                        }, {} as Record<string, Meal>);

                        const dailyMeals: TodaysMeals = {};
                        for (const mealType in mealNamesForToday) {
                            const mealName = mealNamesForToday[mealType];
                            dailyMeals[mealType as keyof TodaysMeals] = fetchedMeals[mealName] || null;
                        }
                        setTodaysMeals(dailyMeals);

                    }
                }
            } catch (e) {
                console.error("Error fetching today's meal: ", e);
                setError("Could not load your meal for today. Please try again later.");
                setTodaysMeals({});
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading) {
            fetchTodaysMeal();
        }
    }, [user, authLoading]);

    const getIconForMeal = (name: string) => {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('salad')) return <Salad className="h-16 w-16 text-muted-foreground" />;
        if (lowerName.includes('burger') || lowerName.includes('steak')) return <Beef className="h-16 w-16 text-muted-foreground" />;
        if (lowerName.includes('pasta') || lowerName.includes('fettuccine') || lowerName.includes('noodles')) return <UtensilsCrossed className="h-16 w-16 text-muted-foreground" />;
        if (lowerName.includes('keto') || lowerName.includes('hake')) return <Fish className="h-16 w-16 text-muted-foreground" />;
        if (lowerName.includes('brownie') || lowerName.includes('cheesecake') || lowerName.includes('muffin') || lowerName.includes('sweet')) return <CakeSlice className="h-16 w-16 text-muted-foreground" />;
        if (lowerName.includes('coffee') || lowerName.includes('tea') || lowerName.includes('latte')) return <Coffee className="h-16 w-16 text-muted-foreground" />;
        if (lowerName.includes('smoothie') || lowerName.includes('crusher') || lowerName.includes('drink')) return <Martini className="h-16 w-16 text-muted-foreground" />;
        if (lowerName.includes('breakfast') || lowerName.includes('egg') || lowerName.includes('oats')) return <Soup className="h-16 w-16 text-muted-foreground" />;
        if (lowerName.includes('sandwich') || lowerName.includes('wrap')) return <Sandwich className="h-16 w-16 text-muted-foreground" />;
        if (lowerName.includes('macro') || lowerName.includes('conscious')) return <Apple className="h-16 w-16 text-muted-foreground" />;
        return <Utensils className="h-16 w-16 text-muted-foreground" />;
    }

    if (loading || authLoading) {
        return (
            <div className="space-y-4">
                 <Skeleton className="h-8 w-1/4" />
                 <div className="grid md:grid-cols-3 gap-4">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-64 w-full" />
                 </div>
            </div>
        );
    }
    
    if (error) {
        return (
             <Card className="bg-destructive/10 border-destructive">
                <CardHeader>
                    <CardTitle>An Error Occurred</CardTitle>
                </CardHeader>
                 <CardContent>
                    <p className="text-destructive-foreground">{error}</p>
                 </CardContent>
            </Card>
        )
    }

    const hasAnyMeal = Object.values(todaysMeals).some(meal => meal);

    if (!hasAnyMeal) {
        return (
            <Card>
                 <CardHeader>
                    <CardTitle>{currentDay}</CardTitle>
                    <CardDescription>No meals scheduled for today.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Enjoy your day! Check the meal prep schedule or contact an admin if you believe this is an error.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Meals for {currentDay}</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {mealTypes.map(mealType => {
                    const meal = todaysMeals[mealType as keyof TodaysMeals];
                    return (
                        <div key={mealType}>
                             <h3 className="text-xl font-semibold mb-2">{mealType}</h3>
                            {meal ? (
                                <Card className="overflow-hidden">
                                    <CardContent className="p-0">
                                        <div className="h-48 w-full flex items-center justify-center bg-muted/20">
                                            {getIconForMeal(meal.name)}
                                        </div>
                                        <div className="p-4">
                                            <CardTitle className="text-lg mb-2">{meal.name}</CardTitle>
                                            <CardDescription>{meal.description}</CardDescription>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex justify-between items-center">
                                        <p className="text-sm font-semibold">R{meal.price.toFixed(2)}</p>
                                        <p className="text-sm text-muted-foreground">{meal.calories || 0} kcal</p>
                                    </CardFooter>
                                </Card>
                            ) : (
                                <Card className="flex items-center justify-center h-full min-h-[120px] bg-muted/50">
                                    <p className="text-muted-foreground">No {mealType.toLowerCase()} scheduled.</p>
                                </Card>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    );
}

    

    