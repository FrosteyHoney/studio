import { MenuTable } from "@/components/admin/menu-table";

export default function MenuPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Menu Management</h1>
      <MenuTable />
    </div>
  );
}
