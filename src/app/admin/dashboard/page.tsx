
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, Activity } from "lucide-react";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

export default function AdminDashboardPage() {
    const [userCount, setUserCount] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const usersCollectionRef = collection(db, "users");
                const usersSnapshot = await getDocs(usersCollectionRef).catch(serverError => {
                    const permissionError = new FirestorePermissionError({
                        path: usersCollectionRef.path,
                        operation: 'list'
                    });
                    errorEmitter.emit('permission-error', permissionError);
                    setUserCount(0);
                    // Return an empty snapshot to avoid crashing the app
                    return { size: 0, docs: [] };
                });
                setUserCount(usersSnapshot.size);

            } catch (error) {
                console.error("Error fetching stats: ", error);
                setUserCount(0);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const summary = [
        { title: "Total Users", value: userCount, icon: Users, id: "users" },
        { title: "Revenue (This Month)", value: "R 0.00", icon: DollarSign },
    ];

    const recentActivity = [
      { user: "John Doe", action: "booked a meal:", item: "Lean Chicken & Quinoa" },
      { user: "Jane Smith", action: "updated their profile." },
      { user: "Peter Jones", action: "cancelled a booking:", item: "Tofu Stir-fry" },
      { user: "Admin", action: "updated the menu item:", item: "Salmon with Asparagus" },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {summary.map((item) => (
                    <Card key={item.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
                            <item.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <Skeleton className="h-8 w-1/2" />
                            ) : (
                                <div className="text-2xl font-bold">{item.value}</div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
            <div>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Activity className="h-5 w-5" />
                          Recent Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                          {recentActivity.map((activity, index) => (
                            <li key={index} className="flex items-center text-sm">
                              <span className="font-semibold w-24">{activity.user}</span>
                              <span className="text-muted-foreground">{activity.action}</span>
                              {activity.item && <span className="ml-1 font-medium text-primary">{activity.item}</span>}
                            </li>
                          ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
