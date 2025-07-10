import { MealPlan } from "@/components/dashboard/meal-plan";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function FoodPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Food &amp; Meal Planning</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Book Your Meals</CardTitle>
          <CardDescription>
            Plan your nutrition by booking meals for the upcoming week. Select a day to see available options.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MealPlan />
        </CardContent>
      </Card>
    </div>
  );
}
