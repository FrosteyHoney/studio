import { UserTable } from "@/components/admin/user-table";

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">User Management</h1>
      <UserTable />
    </div>
  );
}
