import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Utensils, Calendar } from "lucide-react";

const bookings = [
  { id: "1", userName: "John Doe", mealName: "Lean Chicken & Quinoa", date: "2024-05-20" },
  { id: "2", userName: "Jane Smith", mealName: "Salmon with Asparagus", date: "2024-05-21" },
  { id: "3", userName: "John Doe", mealName: "Tofu Stir-fry", date: "2024-05-22" },
  { id: "4", userName: "Emily White", mealName: "Lean Chicken & Quinoa", date: "2024-05-23" },
  { id: "5", userName: "Michael Brown", mealName: "Salmon with Asparagus", date: "2024-05-24" },
];

export function BookingTable() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {bookings.map((booking) => (
        <Card key={booking.id} className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">{booking.userName}</CardTitle>
            <CardDescription>Booking Details</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow space-y-3">
             <div className="flex items-center gap-2">
                <Utensils className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{booking.mealName}</span>
            </div>
            <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{booking.date}</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full">Cancel Booking</Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
