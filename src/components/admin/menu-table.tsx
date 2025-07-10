
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MenuForm, type MenuItem } from "./menu-form";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "../ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function MenuTable() {
  const [meals, setMeals] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<MenuItem | null>(null);
  const { toast } = useToast();

  const fetchMeals = useCallback(async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "menu"));
      const mealsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MenuItem));
      setMeals(mealsData);
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Error fetching menu",
        description: "Could not retrieve menu data from the database.",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchMeals();
  }, [fetchMeals]);

  const handleEdit = (meal: MenuItem) => {
    setEditingMeal(meal);
    setDialogOpen(true);
  };
  
  const handleAddNew = () => {
    setEditingMeal(null);
    setDialogOpen(true);
  };
  
  const handleDeleteMeal = async (mealId: string) => {
    try {
      await deleteDoc(doc(db, "menu", mealId));
      setMeals(prevMeals => prevMeals.filter(meal => meal.id !== mealId));
      toast({
        title: "Meal Deleted",
        description: "The meal has been successfully removed from the menu.",
      });
    } catch(error) {
       toast({
        variant: "destructive",
        title: "Error Deleting Meal",
        description: "There was a problem deleting the meal.",
      });
    }
  };

  if (loading) {
    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Skeleton className="h-10 w-32" />
            </div>
            <Skeleton className="h-[200px] w-full" />
        </div>
    )
  }

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={handleAddNew}>Add New Meal</Button>
      </div>
      <div className="rounded-md border mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Price (R)</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {meals.length > 0 ? meals.map((meal) => (
              <TableRow key={meal.id}>
                <TableCell>
                  <Image src={meal.image || "https://placehold.co/40x40.png"} alt={meal.name} width={40} height={40} className="rounded-md" data-ai-hint="meal food" />
                </TableCell>
                <TableCell>{meal.name}</TableCell>
                <TableCell>{meal.price?.toFixed(2) ?? '0.00'}</TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex rounded-md shadow-sm">
                    <Button variant="outline" size="sm" className="rounded-r-none" onClick={() => handleEdit(meal)}>Edit</Button>
                     <AlertDialog>
                      <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" className="rounded-l-none">Delete</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                          <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete this meal from the menu.
                          </Description>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteMeal(meal.id)}>
                              Continue
                          </AlertDialogAction>
                          </AlertDialogFooter>
                      </AlertDialogContent>
                      </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            )) : (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                        No meals found. Add a meal to get started.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingMeal ? "Edit Meal" : "Add New Meal"}</DialogTitle>
            <DialogDescription>
              {editingMeal ? "Update the details for this meal." : "Fill in the details for the new meal."}
            </DialogDescription>
          </DialogHeader>
          <MenuForm setOpen={setDialogOpen} initialData={editingMeal} onMealUpdated={fetchMeals} />
        </DialogContent>
      </Dialog>
    </>
  );
}
