
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, Flame, Clock } from "lucide-react";

interface StatsCardsProps {
    showCalories: boolean;
}

export function StatsCards({ showCalories }: StatsCardsProps) {
    let stats = [
        {
            title: "Workouts this week",
            value: "0",
            icon: Dumbbell,
        },
        {
            title: "Calories Burned",
            value: "0",
            icon: Flame,
            id: "calories"
        },
        {
            title: "Time Spent",
            value: "0m",
            icon: Clock,
        },
    ];

    if (!showCalories) {
        stats = stats.filter(stat => stat.id !== "calories");
    }


    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stats.map((stat) => (
                <Card key={stat.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                        <stat.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <p className="text-xs text-muted-foreground">Start logging to see your progress!</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
