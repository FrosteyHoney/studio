
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
import { Loader2 } from "lucide-react";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

const dailyRoastGrillMenuSeedData = [
    // Salads
    { name: 'Broccoli Salad', price: 75.00, calories: 350, description: 'A fresh and crunchy broccoli salad.', ingredients: 'Broccoli, Dressing', image: 'https://placehold.co/400x300.png' },
    { name: 'Hummus with Carrot & Cucumber', price: 65.00, calories: 250, description: 'Creamy hummus served with fresh carrot and cucumber sticks.', ingredients: 'Hummus, Carrot, Cucumber', image: 'https://placehold.co/400x300.png' },
    { name: 'Chicken Salad', price: 85.00, calories: 450, description: 'Classic chicken salad with a creamy dressing.', ingredients: 'Chicken, Mayonnaise, Celery, Lettuce', image: 'https://placehold.co/400x300.png' },
    { name: 'Tuna Salad', price: 80.00, calories: 420, description: 'Flaky tuna mixed with mayonnaise and herbs.', ingredients: 'Tuna, Mayonnaise, Herbs', image: 'https://placehold.co/400x300.png' },

    // Burgers
    { name: 'Beef Burger', price: 85.00, calories: 750, description: 'A classic beef burger served with a side of crispy chips.', ingredients: 'Beef Patty, Bun, Lettuce, Tomato, Chips', image: 'https://placehold.co/400x300.png' },
    { name: 'Chicken Burger', price: 85.00, calories: 700, description: 'A juicy chicken burger served with a side of crispy chips.', ingredients: 'Chicken Patty, Bun, Lettuce, Tomato, Chips', image: 'https://placehold.co/400x300.png' },
    { name: 'Mushroom Burger', price: 95.00, calories: 680, description: 'A savory mushroom burger served with a side of crispy chips.', ingredients: 'Mushroom Patty, Bun, Lettuce, Tomato, Chips', image: 'https://placehold.co/400x300.png' },
    { name: 'Cheeseburger', price: 95.00, calories: 800, description: 'A classic beef burger with cheese, served with a side of crispy chips.', ingredients: 'Beef Patty, Cheese, Bun, Lettuce, Tomato, Chips', image: 'https://placehold.co/400x300.png' },
    { name: 'Sloppy Joe', price: 95.00, calories: 820, description: 'A hearty and messy Sloppy Joe served with a side of crispy chips.', ingredients: 'Ground Beef, Tomato Sauce, Bun, Chips', image: 'https://placehold.co/400x300.png' },

    // Pastas
    { name: 'Spaghetti Bolognese with Egg Noodles', price: 75.00, calories: 650, description: 'A rich bolognese sauce served over egg noodles.', ingredients: 'Ground Beef, Tomato Sauce, Egg Noodles', image: 'https://placehold.co/400x300.png' },
    { name: 'Salmon Alfredo', price: 95.00, calories: 750, description: 'Creamy Alfredo pasta with pieces of flaky salmon.', ingredients: 'Salmon, Fettuccine, Cream, Parmesan', image: 'https://placehold.co/400x300.png' },
    { name: 'Chicken & Mushroom Fettuccine', price: 95.00, calories: 720, description: 'Fettuccine pasta with chicken and mushrooms in a creamy sauce.', ingredients: 'Chicken, Mushroom, Fettuccine, Cream Sauce', image: 'https://placehold.co/400x300.png' },

    // Keto Meals
    { name: 'Salmon & Avo Salad', price: 125.00, calories: 550, description: 'A keto-friendly salad with salmon and fresh avocado.', ingredients: 'Salmon, Avocado, Mixed Greens, Lemon Dressing', image: 'https://placehold.co/400x300.png' },
    { name: 'Steak & Broccoli', price: 130.00, calories: 600, description: 'Grilled steak served with a side of steamed broccoli.', ingredients: 'Steak, Broccoli, Garlic Butter', image: 'https://placehold.co/400x300.png' },
    { name: 'Hake & Veggies', price: 110.00, calories: 480, description: 'A light and healthy meal of hake fillet with mixed vegetables.', ingredients: 'Hake, Mixed Vegetables, Lemon', image: 'https://placehold.co/400x300.png' },
    { name: 'Cheesy Hake served with Salad', price: 115.00, calories: 520, description: 'Hake fillet topped with cheese and served with a side salad.', ingredients: 'Hake, Cheese, Mixed Greens', image: 'https://placehold.co/400x300.png' },

    // Sweet Tooth
    { name: 'Protein Brownies (x2)', price: 45.00, calories: 300, description: 'Two rich and fudgy protein-packed brownies.', ingredients: 'Protein Powder, Cocoa, Almond Flour', image: 'https://placehold.co/400x300.png' },
    { name: 'Coconut Chia Granola Clusters (x2)', price: 50.00, calories: 280, description: 'Two crunchy granola clusters with coconut and chia seeds.', ingredients: 'Oats, Coconut, Chia Seeds, Honey', image: 'https://placehold.co/400x300.png' },
    { name: 'Egg Muffins (x3)', price: 50.00, calories: 320, description: 'Three savory egg muffins, perfect for a protein boost.', ingredients: 'Eggs, Spinach, Feta, Bell Peppers', image: 'https://placehold.co/400x300.png' },
    { name: 'Whey Protein Muffins', price: 55.00, calories: 250, description: 'A muffin packed with whey protein for a post-workout snack.', ingredients: 'Whey Protein, Flour, Egg', image: 'https://placehold.co/400x300.png' },
    { name: 'Cheesecake Muffin', price: 35.00, calories: 450, description: 'A single serving cheesecake muffin.', ingredients: 'Cream Cheese, Sugar, Graham Cracker', image: 'https://placehold.co/400x300.png' },
    { name: 'Cheesecake Slice', price: 60.00, calories: 550, description: 'A slice of creamy, classic cheesecake.', ingredients: 'Cream Cheese, Sugar, Graham Cracker Crust', image: 'https://placehold.co/400x300.png' },

    // Muffins
    { name: 'Carrot Muffin', price: 35.00, calories: 380, description: 'A moist carrot muffin with spices.', ingredients: 'Carrot, Flour, Sugar', image: 'https://placehold.co/400x300.png' },
    { name: 'Chocolate Muffin', price: 35.00, calories: 400, description: 'A rich chocolate muffin.', ingredients: 'Chocolate, Flour, Sugar', image: 'https://placehold.co/400x300.png' },
    { name: 'Lemon Poppy Muffin', price: 35.00, calories: 360, description: 'A zesty lemon and poppy seed muffin.', ingredients: 'Lemon, Poppy Seeds, Flour', image: 'https://placehold.co/400x300.png' },
    { name: 'Vanilla Muffin', price: 35.00, calories: 350, description: 'A classic vanilla muffin.', ingredients: 'Vanilla, Flour, Sugar', image: 'https://placehold.co/400x300.png' },
    { name: 'Red Velvet Muffin', price: 35.00, calories: 410, description: 'A red velvet muffin with cream cheese frosting.', ingredients: 'Red Velvet Cake, Cream Cheese', image: 'https://placehold.co/400x300.png' },
    { name: 'Blueberry Muffin', price: 35.00, calories: 370, description: 'A muffin bursting with blueberries.', ingredients: 'Blueberries, Flour, Sugar', image: 'https://placehold.co/400x300.png' },
    { name: 'Chocolate Chip Muffin', price: 35.00, calories: 420, description: 'A classic muffin with chocolate chips.', ingredients: 'Chocolate Chips, Flour, Sugar', image: 'https://placehold.co/400x300.png' },

    // Open Sandwiches
    { name: 'Salmon, Avo & Egg Open Sandwich', price: 115.00, calories: 600, description: 'An open sandwich with salmon, avocado, egg, and basil pesto cream.', ingredients: 'Sourdough, Salmon, Avocado, Egg, Basil Pesto', image: 'https://placehold.co/400x300.png' },
    { name: 'Chicken Mayonnaise Open Sandwich', price: 65.00, calories: 550, description: 'A classic chicken mayonnaise open sandwich.', ingredients: 'Sourdough, Chicken, Mayonnaise', image: 'https://placehold.co/400x300.png' },
    { name: 'Salmon, Egg & Cheese Open Sandwich', price: 110.00, calories: 620, description: 'A delicious combination of salmon, egg, and cheese on an open sandwich.', ingredients: 'Sourdough, Salmon, Egg, Cheese', image: 'https://placehold.co/400x300.png' },
    { name: 'Bacon & Egg Cheese Open Sandwich', price: 65.00, calories: 580, description: 'A hearty open sandwich with bacon, egg, and cheese.', ingredients: 'Sourdough, Bacon, Egg, Cheese', image: 'https://placehold.co/400x300.png' },
    { name: 'Bacon, Avo & Egg Open Sandwich', price: 70.00, calories: 600, description: 'A popular choice with bacon, avocado, and egg.', ingredients: 'Sourdough, Bacon, Avocado, Egg', image: 'https://placehold.co/400x300.png' },
    { name: 'Tuna Mayonnaise Open Sandwich', price: 70.00, calories: 530, description: 'A classic tuna mayonnaise open sandwich.', ingredients: 'Sourdough, Tuna, Mayonnaise', image: 'https://placehold.co/400x300.png' },
    { name: 'Egg Salad Open Sandwich', price: 55.00, calories: 500, description: 'A simple and delicious egg salad open sandwich.', ingredients: 'Sourdough, Egg, Mayonnaise', image: 'https://placehold.co/400x300.png' },
    { name: 'Ham & Cheese Open Sandwich', price: 55.00, calories: 540, description: 'A classic ham and cheese open sandwich.', ingredients: 'Sourdough, Ham, Cheese', image: 'https://placehold.co/400x300.png' },
    
    // Macro Conscious
    { name: 'Chicken Strips with Avocado, Red Onion & Feta', price: 85.00, calories: 550, description: 'Healthy and delicious chicken strips.', ingredients: 'Chicken, Avocado, Red Onion, Feta', image: 'https://placehold.co/400x300.png' },
    { name: 'Chicken & Avo Wrap', price: 85.00, calories: 600, description: 'A wrap filled with chicken and avocado.', ingredients: 'Chicken, Avocado, Wrap', image: 'https://placehold.co/400x300.png' },
    { name: 'Chicken Stir-Fry with Basmati Rice', price: 85.00, calories: 620, description: 'A healthy chicken stir-fry.', ingredients: 'Chicken, Vegetables, Basmati Rice', image: 'https://placehold.co/400x300.png' },
    { name: 'Chicken, Carbs & Veg', price: 85.00, calories: 580, description: 'A balanced meal of chicken, carbs, and vegetables.', ingredients: 'Chicken, Potato, Mixed Veggies', image: 'https://placehold.co/400x300.png' },
    { name: 'Chicken Coconut Curry', price: 85.00, calories: 650, description: 'A fragrant chicken coconut curry.', ingredients: 'Chicken, Coconut Milk, Spices', image: 'https://placehold.co/400x300.png' },
    { name: 'Chicken Strips & Chips with Dip', price: 85.00, calories: 750, description: 'A classic favorite, chicken strips and chips.', ingredients: 'Chicken Strips, Chips, Dip', image: 'https://placehold.co/400x300.png' },
    { name: 'Chickpea Coconut Curry', price: 85.00, calories: 550, description: 'A vegetarian-friendly chickpea curry.', ingredients: 'Chickpeas, Coconut Milk, Spices', image: 'https://placehold.co/400x300.png' },
    { name: 'Beef, Feta & Avo Wrap', price: 95.00, calories: 680, description: 'A delicious beef wrap with feta and avocado.', ingredients: 'Beef, Feta, Avocado, Wrap', image: 'https://placehold.co/400x300.png' },
    { name: 'Mince Wrap (Mexican)', price: 95.00, calories: 700, description: 'A spicy Mexican mince wrap.', ingredients: 'Mince, Spices, Wrap, Salsa', image: 'https://placehold.co/400x300.png' },
    { name: 'Steak, Egg & Chips', price: 110.00, calories: 900, description: 'A hearty meal of steak, egg, and chips.', ingredients: 'Steak, Egg, Chips', image: 'https://placehold.co/400x300.png' },

    // Breakfast
    { name: 'Poached Egg on Greens with Cottage Cheese', price: 60.00, calories: 350, description: 'A light and healthy breakfast.', ingredients: 'Poached Eggs, Kale, Red Onion, Cottage Cheese', image: 'https://placehold.co/400x300.png' },
    { name: 'Overnight Oats with Berries', price: 40.00, calories: 380, description: 'A convenient and healthy breakfast option.', ingredients: 'Oats, Chia Seeds, Yogurt, Berries', image: 'https://placehold.co/400x300.png' },
    { name: 'Breakfast Pizza (Egg Base)', price: 65.00, calories: 550, description: 'A pizza for breakfast with an egg base.', ingredients: 'Egg, Bacon, Mushrooms, Cheese', image: 'https://placehold.co/400x300.png' },
    { name: 'Triple Delight Omelette', price: 65.00, calories: 600, description: 'A three-egg omelette with your choice of fillings.', ingredients: 'Eggs, Bacon, Cheese, Tomato, Onion', image: 'https://placehold.co/400x300.png' },
    { name: 'Powerhouse Omelette', price: 70.00, calories: 650, description: 'A four-egg omelette packed with protein.', ingredients: 'Eggs, Bacon, Spinach, Herbs, Cheese', image: 'https://placehold.co/400x300.png' },
    { name: 'Breakfast Beast', price: 110.00, calories: 1200, description: 'For the very hungry!', ingredients: 'Eggs, Bacon, Cheese Griller, Chips, Spinach, Sourdough', image: 'https://placehold.co/400x300.png' },
    { name: 'English Breakfast', price: 55.00, calories: 700, description: 'A classic English breakfast.', ingredients: 'Eggs, Bacon, Grilled Tomato, Sourdough', image: 'https://placehold.co/400x300.png' },
    { name: 'Heavy Breakfast', price: 90.00, calories: 1000, description: 'A larger breakfast for a big appetite.', ingredients: 'Eggs, Bacon, Grilled Tomato, Sourdough, Cheese Griller', image: 'https://placehold.co/400x300.png' },
    { name: 'Hash Brown Breakfast', price: 85.00, calories: 850, description: 'A breakfast centered around hash browns.', ingredients: 'Bacon, Hash Browns, Cheese Balls', image: 'https://placehold.co/400x300.png' },
    { name: 'Eggs Benedict', price: 89.00, calories: 750, description: 'Classic Eggs Benedict with ham or bacon.', ingredients: 'Muffin, Ham or Bacon, Poached Eggs, Hollandaise', image: 'https://placehold.co/400x300.png' },
    { name: 'Eggs Benedict with Salmon', price: 125.00, calories: 720, description: 'Eggs Benedict with salmon.', ingredients: 'Muffin, Salmon, Poached Eggs, Hollandaise', image: 'https://placehold.co/400x300.png' },
    { name: 'Potato Rosti', price: 75.00, calories: 800, description: 'A crispy potato rosti with all the fixings.', ingredients: 'Potato Rosti, Cheese, Egg, Viennas, Bacon, Sourdough', image: 'https://placehold.co/400x300.png' },
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

  const handleSeedMenu = async () => {
    setIsSeeding(true);
    const batch = writeBatch(db);
    const menuCollection = collection(db, "menu");
    
    dailyRoastGrillMenuSeedData.forEach(meal => {
        const docRef = doc(menuCollection); // Automatically generate a new ID
        batch.set(docRef, meal);
    });

    batch.commit().then(() => {
        toast({
            title: "Menu Created!",
            description: `${dailyRoastGrillMenuSeedData.length} healthy meals have been added to the menu.`,
        });
        fetchMeals(); // Refresh the list
    }).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: menuCollection.path,
            operation: 'create', // This is a batch write, approximating as 'create'
            requestResourceData: dailyRoastGrillMenuSeedData,
        });
        errorEmitter.emit('permission-error', permissionError);
    }).finally(() => {
        setIsSeeding(false);
    });
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
        <Button onClick={handleSeedMenu} variant="outline" disabled={isSeeding}>
            {isSeeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Create Mock Menu
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
                        <p className="text-muted-foreground mt-2">Get started by adding a meal manually, or create a mock menu.</p>
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

    