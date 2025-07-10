import { UserTable } from "@/components/admin/user-table";
import { Input } from "@/components/ui/input";

export default function UsersPage() {
  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">User Management</h1>
        <div className="w-1/3">
          <Input placeholder="Search users..." />
        </div>
      </div>
      <UserTable />
    </div>
  );
}
