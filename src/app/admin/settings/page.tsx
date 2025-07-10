import { AdminProfileForm } from "@/components/admin/admin-profile-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your administrator account details.</CardDescription>
        </CardHeader>
        <CardContent>
          <AdminProfileForm />
        </CardContent>
      </Card>
    </div>
  );
}
