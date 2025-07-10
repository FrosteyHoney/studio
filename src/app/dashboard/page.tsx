import { StatsCards } from "@/components/dashboard/stats-cards";
import { WeeklyActivityChart } from "@/components/dashboard/weekly-activity-chart";
import { MealPlan } from "@/components/dashboard/meal-plan";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <StatsCards />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Weekly Activity</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <WeeklyActivityChart />
          </CardContent>
        </Card>
        <Card className="col-span-4 lg:col-span-3">
          <CardHeader>
            <CardTitle>Book Your Meals</CardTitle>
          </CardHeader>
          <CardContent>
            <MealPlan />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
