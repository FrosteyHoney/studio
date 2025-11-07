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

const healthyMealsSeedData = [
    // Breakfast
    { name: 'Quinoa Porridge', price: 85.00, calories: 350, description: 'Warm quinoa porridge with berries, nuts, and a drizzle of honey.', ingredients: 'Quinoa, Almond Milk, Berries, Almonds, Honey', image: 'https://placehold.co/400x300.png' },
    { name: 'Avocado Toast with Egg', price: 95.00, calories: 400, description: 'Sourdough toast with smashed avocado, a poached egg, and chili flakes.', ingredients: 'Sourdough Bread, Avocado, Egg, Chili Flakes', image: 'https://placehold.co/400x300.png' },
    { name: 'Greek Yogurt Parfait', price: 75.00, calories: 320, description: 'Layers of Greek yogurt, granola, and fresh fruit.', ingredients: 'Greek Yogurt, Granola, Mixed Berries', image: 'https://placehold.co/400x300.png' },
    { name: 'Oatmeal with Berries and Nuts', price: 70.00, calories: 380, description: 'Classic rolled oats cooked with milk, topped with mixed berries and walnuts.', ingredients: 'Rolled Oats, Milk, Mixed Berries, Walnuts', image: 'https://placehold.co/400x300.png' },
    { name: 'Scrambled Eggs with Spinach', price: 90.00, calories: 350, description: 'Fluffy scrambled eggs with fresh spinach, served with whole-wheat toast.', ingredients: 'Eggs, Spinach, Whole-wheat Toast, Olive Oil', image: 'https://placehold.co/400x300.png' },
    { name: 'Smoothie Bowl', price: 100.00, calories: 420, description: 'A thick smoothie with banana and spinach, topped with chia seeds and fruit.', ingredients: 'Banana, Spinach, Protein Powder, Almond Milk, Chia Seeds, Fruit', image: 'https://placehold.co/400x300.png' },

    // Lunch
    { name: 'Grilled Chicken Salad', price: 120.00, calories: 450, description: 'Mixed greens with grilled chicken breast, cherry tomatoes, cucumber, and a light vinaigrette.', ingredients: 'Chicken Breast, Mixed Greens, Cherry Tomatoes, Cucumber, Vinaigrette', image: 'https://placehold.co/400x300.png' },
    { name: 'Salmon with Asparagus', price: 160.00, calories: 550, description: 'Grilled salmon fillet served with steamed asparagus and a lemon wedge.', ingredients: 'Salmon Fillet, Asparagus, Lemon, Olive Oil', image: 'https://placehold.co/400x300.png' },
    { name: 'Lentil Soup', price: 90.00, calories: 380, description: 'A hearty and nutritious soup made with lentils, carrots, celery, and spices.', ingredients: 'Lentils, Carrots, Celery, Vegetable Broth, Spices', image: 'https://placehold.co/400x300.png' },
    { name: 'Quinoa Bowl with Roasted Vegetables', price: 110.00, calories: 480, description: 'A vibrant bowl of quinoa topped with roasted seasonal vegetables and a tahini dressing.', ingredients: 'Quinoa, Bell Peppers, Zucchini, Broccoli, Tahini Dressing', image: 'https://placehold.co/400x300.png' },
    { name: 'Turkey and Avocado Wrap', price: 115.00, calories: 480, description: 'Sliced turkey breast with avocado, lettuce, and tomato in a whole-wheat tortilla.', ingredients: 'Turkey Breast, Avocado, Lettuce, Tomato, Whole-wheat Tortilla', image: 'https://placehold.co/400x300.png' },
    { name: 'Black Bean Burger', price: 105.00, calories: 520, description: 'A homemade black bean patty on a whole-wheat bun with all the fixings.', ingredients: 'Black Beans, Breadcrumbs, Onion, Spices, Whole-wheat Bun', image: 'https://placehold.co/400x300.png' },
    { name: 'Chicken and Vegetable Skewers', price: 130.00, calories: 500, description: 'Grilled chicken and colorful vegetable skewers served with brown rice.', ingredients: 'Chicken Breast, Bell Peppers, Zucchini, Onion, Brown Rice', image: 'https://placehold.co/400x300.png' },

    // Dinner
    { name: 'Lean Beef Steak with Sweet Potato', price: 180.00, calories: 600, description: 'A lean cut of beef steak, grilled to perfection, served with roasted sweet potato wedges.', ingredients: 'Beef Steak, Sweet Potato, Rosemary, Garlic', image: 'https://placehold.co/400x300.png' },
    { name: 'Tofu Stir-fry', price: 115.00, calories: 420, description: 'Crispy tofu stir-fried with a variety of colorful vegetables in a light soy-ginger sauce.', ingredients: 'Tofu, Broccoli, Carrots, Snap Peas, Soy Sauce, Ginger', image: 'https://placehold.co/400x300.png' },
    { name: 'Baked Cod with Greens', price: 150.00, calories: 490, description: 'Flaky baked cod served on a bed of sautéed spinach and kale.', ingredients: 'Cod Fillet, Spinach, Kale, Garlic, Lemon', image: 'https://placehold.co/400x300.png' },
    { name: 'Shrimp Scampi with Zucchini Noodles', price: 165.00, calories: 450, description: 'Garlic shrimp sautéed with zucchini noodles for a light, low-carb pasta alternative.', ingredients: 'Shrimp, Zucchini, Garlic, Lemon, Parsley', image: 'https://placehold.co/400x300.png' },
    { name: 'Stuffed Bell Peppers', price: 125.00, calories: 470, description: 'Bell peppers stuffed with a mix of ground turkey, quinoa, and vegetables, baked to perfection.', ingredients: 'Bell Peppers, Ground Turkey, Quinoa, Tomato Sauce', image: 'https://placehold.co/400x300.png' },
    { name: 'Vegetable Curry', price: 110.00, calories: 430, description: 'A fragrant curry with chickpeas, sweet potatoes, and spinach in a coconut milk base.', ingredients: 'Chickpeas, Sweet Potato, Spinach, Coconut Milk, Curry Spices', image: 'https://placehold.co/400x300.png' },
    { name: 'Sheet Pan Chicken Fajitas', price: 135.00, calories: 530, description: 'Sliced chicken and bell peppers tossed in fajita seasoning and roasted on a single sheet pan.', ingredients: 'Chicken Breast, Bell Peppers, Onion, Fajita Seasoning', image: 'https://placehold.co/400x300.png' },
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
    }).catch(serverError => {
        const permissionError = new FirestorePermissionError({
            path: menuCollection.path,
            operation: 'list'
        });
        errorEmitter.emit('permission-error', permissionError);
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
    }).catch(serverError => {
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
    
    healthyMealsSeedData.forEach(meal => {
        const docRef = doc(menuCollection); // Automatically generate a new ID
        batch.set(docRef, meal);
    });

    batch.commit().then(() => {
        toast({
            title: "Menu Created!",
            description: `${healthyMealsSeedData.length} healthy meals have been added to the menu.`,
        });
        fetchMeals(); // Refresh the list
    }).catch(serverError => {
        const permissionError = new FirestorePermissionError({
            path: menuCollection.path,
            operation: 'create', // This is a batch write, approximating as 'create'
            requestResourceData: healthyMealsSeedData,
        });
        errorEmitter.emit('permission-error', permissionError);
    }).finally(() => {
        setIsSeeding(false);
    });
  }

  const getSafeImageUrl = (url?: string) => {
    const placeholder = "https://placehold.co/400x300.png";
    if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
      return placeholder;
    }
    return url;
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
                src={getSafeImageUrl(meal.image)} 
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
                    </SerialDescription>
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
