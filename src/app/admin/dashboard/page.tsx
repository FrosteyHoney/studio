import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CalendarCheck, DollarSign } from "lucide-react";

export default function AdminDashboardPage() {
    const summary = [
        { title: "Total Users", value: "3", icon: Users },
        { title: "Active Bookings", value: "5", icon: CalendarCheck },
        { title: "Revenue (This Month)", value: "R 79,500", icon: DollarSign },
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
                            <div className="text-2xl font-bold">{item.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            <div>
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Activity feed will be displayed here.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
