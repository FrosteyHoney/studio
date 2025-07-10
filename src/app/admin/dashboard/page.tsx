import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CalendarCheck, DollarSign, Activity } from "lucide-react";

export default function AdminDashboardPage() {
    const summary = [
        { title: "Total Users", value: "3", icon: Users },
        { title: "Active Bookings", value: "5", icon: CalendarCheck },
        { title: "Revenue (This Month)", value: "R 79,500", icon: DollarSign },
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
                            <div className="text-2xl font-bold">{item.value}</div>
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
