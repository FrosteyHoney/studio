
"use client";

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
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { RefreshCw } from "lucide-react";

export function MenuTable() {
  const [meals, setMeals] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<MenuItem | null>(null);
  const { toast } = useToast();

  const fetchMeals = useCallback(async () => {
    setLoading(true);
    const menuCollection = collection(db, "menu");
    getDocs(menuCollection).then(querySnapshot => {
        const mealsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MenuItem));
        setMeals(mealsData);
        toast({
            title: "Menu Updated",
            description: "The menu has been synced with the database.",
        });
    }).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: menuCollection.path,
            operation: 'list'
        });
        errorEmitter.emit('permission-error', permissionError);
        setMeals([]);
    }).finally(() => {
        setLoading(false);
    });
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
    const mealDocRef = doc(db, "menu", mealId);
    deleteDoc(mealDocRef).then(() => {
        setMeals(prevMeals => prevMeals.filter(meal => meal.id !== mealId));
        toast({
            title: "Meal Deleted",
            description: "The meal has been successfully removed from the menu.",
        });
    }).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: mealDocRef.path,
            operation: 'delete'
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  };

  if (loading) {
    return (
        <div className="space-y-4">
            <div className="flex justify-end gap-2">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <Skeleton className="h-40 w-full rounded-t-lg" />
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/4" />
                  </CardHeader>
                  <CardFooter className="flex justify-end gap-2">
                    <Skeleton className="h-9 w-20" />
                    <Skeleton className="h-9 w-20" />
                  </CardFooter>
                </Card>
              ))}
            </div>
        </div>
    )
  }

  return (
    <>
      <div className="flex justify-end gap-2">
        <Button onClick={fetchMeals} variant="outline" disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Update Menu
        </Button>
        <Button onClick={handleAddNew}>Add New Meal</Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4">
        {meals.length > 0 ? meals.map((meal) => (
          <Card key={meal.id} className="flex flex-col">
            <div className="relative h-40 w-full">
              <Image
                src={(meal.image && (meal.image.startsWith('http://') || meal.image.startsWith('https://'))) ? meal.image : "https://placehold.co/400x300.png"}
                alt={meal.name}
                fill
                className="object-cover rounded-t-lg"
                data-ai-hint="meal food"
              />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{meal.name}</CardTitle>
              <div className="flex gap-2 pt-1">
                <Badge variant="secondary">R{meal.price?.toFixed(2) ?? '0.00'}</Badge>
                <Badge variant="outline">{meal.calories ?? 0} kcal</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-grow pt-2">
              <CardDescription className="line-clamp-2">{meal.description}</CardDescription>
              <p className="text-xs text-muted-foreground mt-2 font-medium">Ingredients: <span className="font-normal">{meal.ingredients}</span></p>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => handleEdit(meal)}>Edit</Button>
                <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">Delete</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete this meal from the menu.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDeleteMeal(meal.id)}>
                        Continue
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
                </AlertDialog>
            </CardFooter>
          </Card>
        )) : (
            <div className="col-span-full text-center py-12">
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-xl font-semibold">Your Menu is Empty</h3>
                        <p className="text-muted-foreground mt-2">Get started by adding a meal manually.</p>
                    </CardContent>
                </Card>
            </div>
        )}
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
