
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
import { RefreshCw, Loader2, Utensils, Salad, Beef, VenetianMask, UtensilsCrossed, CakeSlice, Cupcake, Coffee, Martini, Soup, Sandwich, Fish, AppWindow, Apple } from "lucide-react";

const newMenuData = [
    // Salads
    { name: "Broccoli Salad", price: 60, calories: 150, description: "A refreshing broccoli salad.", ingredients: "Broccoli, dressing" },
    { name: "Hummus with Carrot & Cucumber", price: 50, calories: 180, description: "Creamy hummus with fresh vegetable sticks.", ingredients: "Hummus, Carrots, Cucumber" },
    { name: "Chicken Salad", price: 85, calories: 350, description: "Classic chicken salad.", ingredients: "Chicken, lettuce, tomato" },
    { name: "Tuna Salad", price: 80, calories: 320, description: "A light and tasty tuna salad.", ingredients: "Tuna, lettuce, cucumber" },
    // Burgers
    { name: "Beef Burger", price: 85, calories: 650, description: "A juicy beef burger served with chips.", ingredients: "Beef patty, bun, chips" },
    { name: "Chicken Burger", price: 85, calories: 600, description: "A grilled chicken burger served with chips.", ingredients: "Chicken breast, bun, chips" },
    { name: "Mushroom Burger", price: 95, calories: 550, description: "A hearty mushroom burger served with chips.", ingredients: "Mushroom, bun, chips" },
    { name: "Cheeseburger", price: 95, calories: 700, description: "A classic cheeseburger served with chips.", ingredients: "Beef patty, cheese, bun, chips" },
    { name: "Sloppy Joe", price: 95, calories: 720, description: "A delicious and messy sloppy joe served with chips.", ingredients: "Mince, bun, chips" },
    // Pastas
    { name: "Spaghetti Bolognese with Egg Noodles", price: 75, calories: 450, description: "Classic spaghetti bolognese with egg noodles.", ingredients: "Mince, tomato sauce, noodles" },
    { name: "Salmon Alfredo", price: 95, calories: 600, description: "Creamy salmon alfredo pasta.", ingredients: "Salmon, cream sauce, pasta" },
    { name: "Chicken & Mushroom Fettuccine", price: 95, calories: 550, description: "Chicken and mushroom in a creamy fettuccine.", ingredients: "Chicken, mushroom, cream, pasta" },
    // Keto Meals
    { name: "Salmon & Avo Salad", price: 105, calories: 420, description: "A healthy keto salmon and avocado salad.", ingredients: "Salmon, avocado, greens" },
    { name: "Steak & Broccoli", price: 110, calories: 500, description: "Grilled steak with a side of broccoli.", ingredients: "Steak, broccoli" },
    { name: "Hake & Veggies", price: 90, calories: 350, description: "Grilled hake with mixed vegetables.", ingredients: "Hake, mixed veggies" },
    { name: "Cheesy Hake with Salad", price: 95, calories: 400, description: "Hake with melted cheese, served with a side salad.", ingredients: "Hake, cheese, salad" },
    // Sweet Tooth
    { name: "Protein Brownies (x2)", price: 45, calories: 220, description: "Delicious protein-packed brownies.", ingredients: "Protein powder, cocoa, eggs" },
    { name: "Coconut Chia Granola Clusters (x2)", price: 50, calories: 250, description: "Crunchy granola clusters.", ingredients: "Oats, chia, coconut" },
    { name: "Egg Muffins (x3)", price: 50, calories: 300, description: "Savory egg muffins.", ingredients: "Eggs, cheese, vegetables" },
    { name: "Whey Protein Muffins", price: 55, calories: 280, description: "Muffins made with whey protein.", ingredients: "Whey protein, flour, eggs" },
    // Muffins
    { name: "Carrot Muffin", price: 35, calories: 280, description: "A delicious carrot muffin.", ingredients: "Carrot, flour, sugar" },
    { name: "Chocolate Muffin", price: 35, calories: 300, description: "A delicious chocolate muffin.", ingredients: "Chocolate, flour, sugar" },
    { name: "Lemon Poppy Muffin", price: 35, calories: 270, description: "A delicious lemon poppy seed muffin.", ingredients: "Lemon, poppy seeds, flour" },
    { name: "Vanilla Muffin", price: 35, calories: 260, description: "A delicious vanilla muffin.", ingredients: "Vanilla, flour, sugar" },
    { name: "Red Velvet Muffin", price: 35, calories: 290, description: "A delicious red velvet muffin.", ingredients: "Red velvet, flour, sugar" },
    { name: "Blueberry Muffin", price: 35, calories: 250, description: "A delicious blueberry muffin.", ingredients: "Blueberry, flour, sugar" },
    { name: "Chocolate Chip Muffin", price: 35, calories: 300, description: "A delicious chocolate chip muffin.", ingredients: "Chocolate chips, flour, sugar" },
    { name: "Cheesecake", price: 60, calories: 350, description: "A slice of classic cheesecake.", ingredients: "Cream cheese, sugar, crust" },
    // Drinks
    { name: "Bullet Coffee", price: 50, calories: 200, description: "Energy booster to start your day.", ingredients: "Coffee, butter, MCT oil" },
    { name: "Iced Coffee", price: 35, calories: 120, description: "Refreshing iced coffee.", ingredients: "Coffee, milk, ice" },
    { name: "Detox Tea", price: 40, calories: 10, description: "A cleansing detox tea.", ingredients: "Herbal tea mix" },
    { name: "Chai Tea with Honey", price: 45, calories: 120, description: "Spiced chai tea with a touch of honey.", ingredients: "Chai, milk, honey" },
    { name: "Honey Ginger Tea", price: 35, calories: 80, description: "Soothing honey ginger tea.", ingredients: "Ginger, honey, hot water" },
    { name: "Digestion & Fat Loss Tea", price: 45, calories: 10, description: "A special blend for digestion.", ingredients: "Herbal tea mix" },
    { name: "Rooibos Tea", price: 25, calories: 5, description: "Classic South African rooibos tea.", ingredients: "Rooibos tea leaves" },
    { name: "Golden Milk Tea", price: 45, calories: 150, description: "Turmeric and spice tea.", ingredients: "Turmeric, milk, spices" },
    { name: "Lemon Tea", price: 15, calories: 15, description: "Simple and refreshing lemon tea.", ingredients: "Lemon, hot water" },
    { name: "Water", price: 20, calories: 0, description: "Still or sparkling water.", ingredients: "Water" },
    { name: "Switch Energy Drink", price: 15, calories: 110, description: "An energy boost.", ingredients: "Varies" },
    // Smoothies & Lattes
    { name: "Peanut Butter Smoothie", price: 60, calories: 350, description: "Creamy peanut butter smoothie.", ingredients: "Peanut butter, milk, banana" },
    { name: "Hazelnut Latte", price: 60, calories: 280, description: "A warm hazelnut latte.", ingredients: "Espresso, milk, hazelnut syrup" },
    // Crushers
    { name: "Strawberry Crusher", price: 50, calories: 180, description: "A refreshing strawberry crusher.", ingredients: "Strawberry, ice" },
    // High Protein Breakfast
    { name: "High Protein Breakfast", price: 90, calories: 500, description: "A breakfast packed with protein.", ingredients: "3 Eggs, Spinach, Cottage Cheese, Bacon, Cucumber, Tomato, Sourdough" },
    // Open Sandwiches
    { name: "Salmon, Avo & Egg Sandwich", price: 110, calories: 480, description: "Open sandwich with salmon, avo and egg.", ingredients: "Salmon, avocado, egg, pesto, bread" },
    { name: "Chicken Mayonnaise Sandwich", price: 65, calories: 420, description: "Classic chicken mayo open sandwich.", ingredients: "Chicken, mayonnaise, bread" },
    // Macro Conscious
    { name: "Chicken Strips with Avocado", price: 85, calories: 450, description: "Macro-friendly chicken strips.", ingredients: "Chicken, avocado, red onion, feta" },
    { name: "Chicken & Avo Wrap", price: 85, calories: 480, description: "A healthy chicken and avo wrap.", ingredients: "Chicken, avocado, wrap" },
    // Breakfast
    { name: "Poached Egg on Greens", price: 60, calories: 250, description: "Two poached eggs on a bed of greens.", ingredients: "Eggs, kale, red onion, cottage cheese" },
    { name: "Overnight Oats with Berries", price: 40, calories: 300, description: "Healthy and convenient overnight oats.", ingredients: "Oats, chia seeds, yoghurt, berries"},
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
  
  const getIconForMeal = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('salad')) return <Salad className="h-10 w-10 text-muted-foreground" />;
    if (lowerName.includes('burger') || lowerName.includes('steak')) return <Beef className="h-10 w-10 text-muted-foreground" />;
    if (lowerName.includes('pasta') || lowerName.includes('fettuccine') || lowerName.includes('noodles')) return <UtensilsCrossed className="h-10 w-10 text-muted-foreground" />;
    if (lowerName.includes('keto') || lowerName.includes('hake')) return <Fish className="h-10 w-10 text-muted-foreground" />;
    if (lowerName.includes('brownie') || lowerName.includes('cheesecake') || lowerName.includes('sweet')) return <CakeSlice className="h-10 w-10 text-muted-foreground" />;
    if (lowerName.includes('muffin')) return <Cupcake className="h-10 w-10 text-muted-foreground" />;
    if (lowerName.includes('coffee') || lowerName.includes('tea') || lowerName.includes('latte')) return <Coffee className="h-10 w-10 text-muted-foreground" />;
    if (lowerName.includes('smoothie') || lowerName.includes('crusher') || lowerName.includes('drink')) return <Martini className="h-10 w-10 text-muted-foreground" />;
    if (lowerName.includes('breakfast') || lowerName.includes('egg') || lowerName.includes('oats')) return <Soup className="h-10 w-10 text-muted-foreground" />;
    if (lowerName.includes('sandwich') || lowerName.includes('wrap')) return <Sandwich className="h-10 w-10 text-muted-foreground" />;
    if (lowerName.includes('macro') || lowerName.includes('conscious')) return <Apple className="h-10 w-10 text-muted-foreground" />;
    return <Utensils className="h-10 w-10 text-muted-foreground" />;
  }


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
            <div className="h-40 w-full flex items-center justify-center bg-card-foreground/5 rounded-t-lg">
              {getIconForMeal(meal.name)}
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
