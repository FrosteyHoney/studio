
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { UpdatePasswordForm } from "@/components/dashboard/update-password-form";

export default function DashboardSettingsPage() {
  const [showCalories, setShowCalories] = useState(true);

  const handleToggleCalories = (checked: boolean) => {
    setShowCalories(checked);
    toast({
        title: "Settings Updated",
        description: `Calories card is now ${checked ? 'visible' : 'hidden'} on the dashboard. (Note: This setting will reset on page refresh).`
    })
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      <Card>
        <CardHeader>
          <CardTitle>Dashboard Preferences</CardTitle>
          <CardDescription>
            Customize the information you see on your dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
            <div className="space-y-0.5">
                <Label htmlFor="calories-card" className="text-base">Show "Calories Burned" Card</Label>
                <p className="text-sm text-muted-foreground">
                    Display the card summarizing your total calories burned.
                </p>
            </div>
            <Switch
              id="calories-card"
              checked={showCalories}
              onCheckedChange={handleToggleCalories}
            />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>
            Change your account password.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <UpdatePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
