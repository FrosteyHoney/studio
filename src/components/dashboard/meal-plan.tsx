import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import Image from "next/image";

const meals = [
    {
        name: "Lean Chicken & Quinoa",
        calories: 450,
        image: "https://placehold.co/400x300.png",
        hint: "chicken salad"
    },
    {
        name: "Salmon with Asparagus",
        calories: 520,
        image: "https://placehold.co/400x300.png",
        hint: "grilled salmon"
    },
     {
        name: "Tofu Stir-fry",
        calories: 380,
        image: "https://placehold.co/400x300.png",
        hint: "tofu stir-fry"
    }
];

export function MealPlan() {
    return (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Select a day and book your meal for the upcoming week.</p>
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
                    {meals.map((meal) => (
                        <Card key={meal.name} className="flex items-center">
                            <CardHeader className="p-2">
                            <Image src={meal.image} alt={meal.name} width={80} height={80} className="rounded-md" data-ai-hint={meal.hint} />
                            </CardHeader>
                            <CardContent className="p-4 flex-1">
                                <h4 className="font-semibold">{meal.name}</h4>
                                <p className="text-sm text-muted-foreground">{meal.calories} kcal</p>
                            </CardContent>
                            <CardFooter className="p-4">
                                <Button variant="outline">Book</Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
