import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const bookings = [
  { id: "1", userName: "John Doe", mealName: "Lean Chicken & Quinoa", date: "2024-05-20" },
  { id: "2", userName: "Jane Smith", mealName: "Salmon with Asparagus", date: "2024-05-21" },
  { id: "3", userName: "John Doe", mealName: "Tofu Stir-fry", date: "2024-05-22" },
];

export function BookingTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Meal</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bookings.map((booking) => (
          <TableRow key={booking.id}>
            <TableCell>{booking.userName}</TableCell>
            <TableCell>{booking.mealName}</TableCell>
            <TableCell>{booking.date}</TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="sm">Cancel</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
