
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-provider";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { format } from "date-fns";

interface Meal {
    id: string;
    name: string;
    description: string;
    price: number;
    image?: string;
}

export function DailyMealDisplay() {
    const { user, loading: authLoading } = useAuth();
    const [todaysMeal, setTodaysMeal] = useState<Meal | null>(null);
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
                    const mealNameForToday = planData[dayOfWeek];

                    if (mealNameForToday) {
                        const menuRef = collection(db, "menu");
                        const q = query(menuRef, where("name", "==", mealNameForToday));
                        const querySnapshot = await getDocs(q);

                        if (!querySnapshot.empty) {
                            const mealDoc = querySnapshot.docs[0];
                            setTodaysMeal({ id: mealDoc.id, ...mealDoc.data() } as Meal);
                        } else {
                            // Meal name in plan but not found in menu
                            setError(`Your scheduled meal "${mealNameForToday}" could not be found on the menu.`);
                        }
                    }
                    // If no meal for today, todaysMeal remains null, which is handled in the JSX
                }
            } catch (e) {
                console.error("Error fetching today's meal: ", e);
                setError("Could not load your meal for today. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading) {
            fetchTodaysMeal();
        }
    }, [user, authLoading]);

    const getSafeImageUrl = (url: string | undefined) => {
        const defaultImage = "https://placehold.co/400x300.png";
        if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
          return defaultImage;
        }
        try {
          new URL(url);
          return url;
        } catch (error) {
          return defaultImage;
        }
    };

    if (loading || authLoading) {
        return (
            <Card className="max-w-md">
                <CardHeader>
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <Skeleton className="h-48 w-full rounded-b-lg" />
            </Card>
        );
    }
    
    if (error) {
        return (
             <Card className="max-w-md bg-destructive/10 border-destructive">
                <CardHeader>
                    <CardTitle>An Error Occurred</CardTitle>
                </CardHeader>
                 <CardContent>
                    <p className="text-destructive-foreground">{error}</p>
                 </CardContent>
            </Card>
        )
    }

    if (!todaysMeal) {
        return (
            <Card className="max-w-md">
                 <CardHeader>
                    <CardTitle>{currentDay}</CardTitle>
                    <CardDescription>No meal scheduled for today.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Enjoy your day! Check the meal prep schedule or contact an admin if you believe this is an error.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="max-w-md overflow-hidden">
            <CardHeader>
                <CardTitle>{todaysMeal.name}</CardTitle>
                <CardDescription>Your scheduled meal for {currentDay}.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <div className="relative h-48 w-full">
                    <Image
                        src={getSafeImageUrl(todaysMeal.image)}
                        alt={todaysMeal.name}
                        layout="fill"
                        objectFit="cover"
                        data-ai-hint="meal food"
                    />
                </div>
                <div className="p-6">
                    <p className="text-muted-foreground">{todaysMeal.description}</p>
                </div>
            </CardContent>
             <CardFooter>
                <p className="text-sm font-semibold">Price: R{todaysMeal.price.toFixed(2)}</p>
             </CardFooter>
        </Card>
    );
}
