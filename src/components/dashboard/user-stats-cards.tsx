
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-provider";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowDown, ArrowUp, Weight, Ruler, BarChart, Percent, Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserStats {
  height: number;
  weight: number;
  bmi: number;
  bodyFat: number;
  muscleMass: number;
  prevWeight?: number;
  prevBmi?: number;
  prevBodyFat?: number;
  prevMuscleMass?: number;
}

const StatChangeIndicator = ({ change, good }: { change: number; good: "up" | "down" }) => {
  if (change === 0 || isNaN(change) || !isFinite(change)) return null;

  const isGood = (good === "up" && change > 0) || (good === "down" && change < 0);
  const isBad = (good === "up" && change < 0) || (good === "down" && change > 0);

  return (
    <div
      className={cn(
        "flex items-center text-xs font-semibold",
        isGood && "text-green-500",
        isBad && "text-red-500"
      )}
    >
      {change > 0 ? (
        <ArrowUp className="h-4 w-4" />
      ) : (
        <ArrowDown className="h-4 w-4" />
      )}
      {Math.abs(change).toFixed(1)}%
    </div>
  );
};

export function UserStatsCards() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const docRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        setStats(doc.data() as UserStats);
      } else {
        console.log("No such document!");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-6 w-6" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return <p>No stats available.</p>;
  }
  
  const calculateChange = (current: number, previous: number | undefined) => {
    if (previous === undefined || previous === 0 || current === previous) return 0;
    return ((current - previous) / previous) * 100;
  };
  
  const weightChange = calculateChange(stats.weight, stats.prevWeight);
  const bmiChange = calculateChange(stats.bmi, stats.prevBmi);
  const bodyFatChange = calculateChange(stats.bodyFat, stats.prevBodyFat);
  const muscleMassChange = calculateChange(stats.muscleMass, stats.prevMuscleMass);

  const userStatCards = [
    { title: "Height", value: `${stats.height} cm`, icon: Ruler, change: 0, good: 'up' },
    { title: "Weight", value: `${stats.weight} kg`, icon: Weight, change: weightChange, good: 'down' },
    { title: "BMI", value: stats.bmi.toFixed(1), icon: BarChart, change: bmiChange, good: 'down' },
    { title: "Body Fat", value: `${stats.bodyFat}%`, icon: Percent, change: bodyFatChange, good: 'down' },
    { title: "Muscle Mass", value: `${stats.muscleMass} kg`, icon: Dumbbell, change: muscleMassChange, good: 'up' },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {userStatCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.change !== 0 && <StatChangeIndicator change={stat.change} good={stat.good as 'up' | 'down'} />}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
