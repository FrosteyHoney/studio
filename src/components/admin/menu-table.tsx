
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
import { collection, getDocs, deleteDoc, doc, writeBatch } from "firebase/firestore";
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
import { RefreshCw, Loader2 } from "lucide-react";

const newMenuData = [
    // Salads
    { name: "Broccoli Salad", price: 60, calories: 150, description: "A refreshing broccoli salad.", ingredients: "Broccoli, dressing", image: "https://placehold.co/400x300/F7CAC9/333333?text=Broccoli+Salad" },
    { name: "Hummus with Carrot & Cucumber", price: 50, calories: 180, description: "Creamy hummus with fresh vegetable sticks.", ingredients: "Hummus, Carrots, Cucumber", image: "https://placehold.co/400x300/F7CAC9/333333?text=Hummus" },
    { name: "Chicken Salad", price: 85, calories: 350, description: "Classic chicken salad.", ingredients: "Chicken, lettuce, tomato", image: "https://placehold.co/400x300/F7CAC9/333333?text=Chicken+Salad" },
    { name: "Tuna Salad", price: 80, calories: 320, description: "A light and tasty tuna salad.", ingredients: "Tuna, lettuce, cucumber", image: "https://placehold.co/400x300/F7CAC9/333333?text=Tuna+Salad" },
    // Burgers
    { name: "Beef Burger", price: 85, calories: 650, description: "A juicy beef burger served with chips.", ingredients: "Beef patty, bun, chips", image: "https://placehold.co/400x300/D36B36/FFFFFF?text=Beef+Burger" },
    { name: "Chicken Burger", price: 85, calories: 600, description: "A grilled chicken burger served with chips.", ingredients: "Chicken breast, bun, chips", image: "https://placehold.co/400x300/D36B36/FFFFFF?text=Chicken+Burger" },
    { name: "Mushroom Burger", price: 95, calories: 550, description: "A hearty mushroom burger served with chips.", ingredients: "Mushroom, bun, chips", image: "https://placehold.co/400x300/D36B36/FFFFFF?text=Mushroom+Burger" },
    { name: "Cheeseburger", price: 95, calories: 700, description: "A classic cheeseburger served with chips.", ingredients: "Beef patty, cheese, bun, chips", image: "https://placehold.co/400x300/D36B36/FFFFFF?text=Cheeseburger" },
    { name: "Sloppy Joe", price: 95, calories: 720, description: "A delicious and messy sloppy joe served with chips.", ingredients: "Mince, bun, chips", image: "https://placehold.co/400x300/D36B36/FFFFFF?text=Sloppy+Joe" },
    // Pastas
    { name: "Spaghetti Bolognese with Egg Noodles", price: 75, calories: 450, description: "Classic spaghetti bolognese with egg noodles.", ingredients: "Mince, tomato sauce, noodles", image: "https://placehold.co/400x300/F7CAC9/333333?text=Pasta" },
    { name: "Salmon Alfredo", price: 95, calories: 600, description: "Creamy salmon alfredo pasta.", ingredients: "Salmon, cream sauce, pasta", image: "https://placehold.co/400x300/F7CAC9/333333?text=Pasta" },
    { name: "Chicken & Mushroom Fettuccine", price: 95, calories: 550, description: "Chicken and mushroom in a creamy fettuccine.", ingredients: "Chicken, mushroom, cream, pasta", image: "https://placehold.co/400x300/F7CAC9/333333?text=Pasta" },
    // Keto Meals
    { name: "Salmon & Avo Salad", price: 105, calories: 420, description: "A healthy keto salmon and avocado salad.", ingredients: "Salmon, avocado, greens", image: "https://placehold.co/400x300/F7CAC9/333333?text=Keto+Meal" },
    { name: "Steak & Broccoli", price: 110, calories: 500, description: "Grilled steak with a side of broccoli.", ingredients: "Steak, broccoli", image: "https://placehold.co/400x300/F7CAC9/333333?text=Keto+Meal" },
    { name: "Hake & Veggies", price: 90, calories: 350, description: "Grilled hake with mixed vegetables.", ingredients: "Hake, mixed veggies", image: "https://placehold.co/400x300/F7CAC9/333333?text=Keto+Meal" },
    { name: "Cheesy Hake with Salad", price: 95, calories: 400, description: "Hake with melted cheese, served with a side salad.", ingredients: "Hake, cheese, salad", image: "https://placehold.co/400x300/F7CAC9/333333?text=Keto+Meal" },
    // Sweet Tooth
    { name: "Protein Brownies (x2)", price: 45, calories: 220, description: "Delicious protein-packed brownies.", ingredients: "Protein powder, cocoa, eggs", image: "https://placehold.co/400x300/D36B36/FFFFFF?text=Sweet+Tooth" },
    { name: "Coconut Chia Granola Clusters (x2)", price: 50, calories: 250, description: "Crunchy granola clusters.", ingredients: "Oats, chia, coconut", image: "https://placehold.co/400x300/D36B36/FFFFFF?text=Sweet+Tooth" },
    { name: "Egg Muffins (x3)", price: 50, calories: 300, description: "Savory egg muffins.", ingredients: "Eggs, cheese, vegetables", image: "https://placehold.co/400x300/D36B36/FFFFFF?text=Sweet+Tooth" },
    { name: "Whey Protein Muffins", price: 55, calories: 280, description: "Muffins made with whey protein.", ingredients: "Whey protein, flour, eggs", image: "https://placehold.co/400x300/D36B36/FFFFFF?text=Sweet+Tooth" },
    // Muffins
    { name: "Carrot Muffin", price: 35, calories: 280, description: "A delicious carrot muffin.", ingredients: "Carrot, flour, sugar", image: "https://placehold.co/400x300/F7CAC9/333333?text=Muffin" },
    { name: "Chocolate Muffin", price: 35, calories: 300, description: "A delicious chocolate muffin.", ingredients: "Chocolate, flour, sugar", image: "https://placehold.co/400x300/F7CAC9/333333?text=Muffin" },
    { name: "Lemon Poppy Muffin", price: 35, calories: 270, description: "A delicious lemon poppy seed muffin.", ingredients: "Lemon, poppy seeds, flour", image: "https://placehold.co/400x300/F7CAC9/333333?text=Muffin" },
    { name: "Vanilla Muffin", price: 35, calories: 260, description: "A delicious vanilla muffin.", ingredients: "Vanilla, flour, sugar", image: "https://placehold.co/400x300/F7CAC9/333333?text=Muffin" },
    { name: "Red Velvet Muffin", price: 35, calories: 290, description: "A delicious red velvet muffin.", ingredients: "Red velvet, flour, sugar", image: "https://placehold.co/400x300/F7CAC9/333333?text=Muffin" },
    { name: "Blueberry Muffin", price: 35, calories: 250, description: "A delicious blueberry muffin.", ingredients: "Blueberry, flour, sugar", image: "https://placehold.co/400x300/F7CAC9/333333?text=Muffin" },
    { name: "Chocolate Chip Muffin", price: 35, calories: 300, description: "A delicious chocolate chip muffin.", ingredients: "Chocolate chips, flour, sugar", image: "https://placehold.co/400x300/F7CAC9/333333?text=Muffin" },
    { name: "Cheesecake", price: 60, calories: 350, description: "A slice of classic cheesecake.", ingredients: "Cream cheese, sugar, crust", image: "https://placehold.co/400x300/D36B36/FFFFFF?text=Cheesecake" },
    // Drinks
    { name: "Bullet Coffee", price: 50, calories: 200, description: "Energy booster to start your day.", ingredients: "Coffee, butter, MCT oil", image: "https://placehold.co/400x300/F7CAC9/333333?text=Coffee" },
    { name: "Iced Coffee", price: 35, calories: 120, description: "Refreshing iced coffee.", ingredients: "Coffee, milk, ice", image: "https://placehold.co/400x300/F7CAC9/333333?text=Coffee" },
    { name: "Detox Tea", price: 40, calories: 10, description: "A cleansing detox tea.", ingredients: "Herbal tea mix", image: "https://placehold.co/400x300/F7CAC9/333333?text=Tea" },
    { name: "Chai Tea with Honey", price: 45, calories: 120, description: "Spiced chai tea with a touch of honey.", ingredients: "Chai, milk, honey", image: "https://placehold.co/400x300/F7CAC9/333333?text=Tea" },
    { name: "Honey Ginger Tea", price: 35, calories: 80, description: "Soothing honey ginger tea.", ingredients: "Ginger, honey, hot water", image: "https://placehold.co/400x300/F7CAC9/333333?text=Tea" },
    { name: "Digestion & Fat Loss Tea", price: 45, calories: 10, description: "A special blend for digestion.", ingredients: "Herbal tea mix", image: "https://placehold.co/400x300/F7CAC9/333333?text=Tea" },
    { name: "Rooibos Tea", price: 25, calories: 5, description: "Classic South African rooibos tea.", ingredients: "Rooibos tea leaves", image: "https://placehold.co/400x300/F7CAC9/333333?text=Tea" },
    { name: "Golden Milk Tea", price: 45, calories: 150, description: "Turmeric and spice tea.", ingredients: "Turmeric, milk, spices", image: "https://placehold.co/400x300/F7CAC9/333333?text=Tea" },
    { name: "Lemon Tea", price: 15, calories: 15, description: "Simple and refreshing lemon tea.", ingredients: "Lemon, hot water", image: "https://placehold.co/400x300/F7CAC9/333333?text=Tea" },
    { name: "Water", price: 20, calories: 0, description: "Still or sparkling water.", ingredients: "Water", image: "https://placehold.co/400x300/F7CAC9/333333?text=Water" },
    { name: "Switch Energy Drink", price: 15, calories: 110, description: "An energy boost.", ingredients: "Varies", image: "https://placehold.co/400x300/F7CAC9/333333?text=Energy+Drink" },
    // Smoothies & Lattes
    { name: "Peanut Butter Smoothie", price: 60, calories: 350, description: "Creamy peanut butter smoothie.", ingredients: "Peanut butter, milk, banana", image: "https://placehold.co/400x300/D36B36/FFFFFF?text=Smoothie" },
    { name: "Hazelnut Latte", price: 60, calories: 280, description: "A warm hazelnut latte.", ingredients: "Espresso, milk, hazelnut syrup", image: "https://placehold.co/400x300/D36B36/FFFFFF?text=Latte" },
    // Crushers
    { name: "Strawberry Crusher", price: 50, calories: 180, description: "A refreshing strawberry crusher.", ingredients: "Strawberry, ice", image: "https://placehold.co/400x300/F7CAC9/333333?text=Crusher" },
    // High Protein Breakfast
    { name: "High Protein Breakfast", price: 90, calories: 500, description: "A breakfast packed with protein.", ingredients: "3 Eggs, Spinach, Cottage Cheese, Bacon, Cucumber, Tomato, Sourdough", image: "https://placehold.co/400x300/D36B36/FFFFFF?text=Breakfast" },
    // Open Sandwiches
    { name: "Salmon, Avo & Egg Sandwich", price: 110, calories: 480, description: "Open sandwich with salmon, avo and egg.", ingredients: "Salmon, avocado, egg, pesto, bread", image: "https://placehold.co/400x300/F7CAC9/333333?text=Sandwich" },
    { name: "Chicken Mayonnaise Sandwich", price: 65, calories: 420, description: "Classic chicken mayo open sandwich.", ingredients: "Chicken, mayonnaise, bread", image: "https://placehold.co/400x300/F7CAC9/333333?text=Sandwich" },
    // Macro Conscious
    { name: "Chicken Strips with Avocado", price: 85, calories: 450, description: "Macro-friendly chicken strips.", ingredients: "Chicken, avocado, red onion, feta", image: "https://placehold.co/400x300/D36B36/FFFFFF?text=Macro+Meal" },
    { name: "Chicken & Avo Wrap", price: 85, calories: 480, description: "A healthy chicken and avo wrap.", ingredients: "Chicken, avocado, wrap", image: "https://placehold.co/400x300/D36B36/FFFFFF?text=Macro+Meal" },
    // Breakfast
    { name: "Poached Egg on Greens", price: 60, calories: 250, description: "Two poached eggs on a bed of greens.", ingredients: "Eggs, kale, red onion, cottage cheese", image: "https://placehold.co/400x300/F7CAC9/333333?text=Breakfast" },
    { name: "Overnight Oats with Berries", price: 40, calories: 300, description: "Healthy and convenient overnight oats.", ingredients: "Oats, chia seeds, yoghurt, berries", image: "https://placehold.co/400x300/F7CAC9/333333?text=Breakfast" },
];


export function MenuTable() {
  const [meals, setMeals] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<MenuItem | null>(null);
  const { toast } = useToast();

  const fetchMeals = useCallback(async () => {
    setLoading(true);
    const menuCollection = collection(db, "menu");
    getDocs(menuCollection).then(querySnapshot => {
        const mealsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MenuItem));
        setMeals(mealsData);
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
  }, []);

  useEffect(() => {
    fetchMeals();
  }, [fetchMeals]);

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    try {
        const menuCollection = collection(db, "menu");
        // Step 1: Delete all existing documents
        const existingDocs = await getDocs(menuCollection);
        const deleteBatch = writeBatch(db);
        existingDocs.forEach(doc => {
            deleteBatch.delete(doc.ref);
        });
        await deleteBatch.commit();

        // Step 2: Add all new documents
        const addBatch = writeBatch(db);
        newMenuData.forEach(meal => {
            const newDocRef = doc(menuCollection); // Create a new doc with a generated ID
            addBatch.set(newDocRef, meal);
        });
        await addBatch.commit();

        toast({
            title: "Database Seeded",
            description: "The menu has been completely replaced with the new data.",
        });
        fetchMeals(); // Refresh the local state
    } catch (error: any) {
        console.error("Error seeding database: ", error);
        toast({
            variant: "destructive",
            title: "Seeding Failed",
            description: "Could not replace the menu data. Check console for errors.",
        });
    } finally {
        setIsSeeding(false);
    }
  };


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
         <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={isSeeding}>
              {isSeeding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Seed Database
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will delete your entire current menu and replace it with the new "Daily Roast Grill" menu. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleSeedDatabase}>
                Yes, replace the menu
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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
                        <p className="text-muted-foreground mt-2">Get started by adding a meal manually or seeding the database.</p>
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
