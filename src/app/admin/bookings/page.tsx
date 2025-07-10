import { BookingTable } from "@/components/admin/booking-table";

export default function BookingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Booking Management</h1>
      <BookingTable />
    </div>
  );
}
