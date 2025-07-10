
"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Utensils } from "lucide-react";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Skeleton } from "../ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface Booking {
  id: string;
  userName: string;
  mealName: string;
  date: string;
}

export function BookingTable() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "bookings"));
        const bookingsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
        setBookings(bookingsData);
      } catch (error) {
        console.error("Error fetching bookings: ", error);
        toast({
          variant: "destructive",
          title: "Error fetching bookings",
          description: "Could not retrieve booking data from the database.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [toast]);

  if (loading) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
                <Card key={i}>
                    <CardHeader>
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-full" />
                    </CardContent>
                    <CardFooter>
                        <Skeleton className="h-10 w-full" />
                    </CardFooter>
                </Card>
            ))}
        </div>
    )
  }

  if (bookings.length === 0) {
    return (
      <Card className="col-span-full text-center">
        <CardHeader>
          <CardTitle>No Bookings Found</CardTitle>
          <CardDescription>
            There are currently no meal bookings in the system.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

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
