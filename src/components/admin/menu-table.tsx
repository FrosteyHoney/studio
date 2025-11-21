
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
import { RefreshCw, Loader2, Utensils, Salad, Beef, UtensilsCrossed, CakeSlice, Coffee, Martini, Soup, Sandwich, Fish, Apple } from "lucide-react";

const newMenuData = [
    // Salads
    { name: "Broccoli Salad", price: 60, calories: 150, description: "A refreshing broccoli salad.", ingredients: "Broccoli, dressing", category: "Salads" },
    { name: "Hummus with Carrot & Cucumber", price: 50, calories: 180, description: "Creamy hummus with fresh vegetable sticks.", ingredients: "Hummus, Carrots, Cucumber", category: "Salads" },
    { name: "Chicken Salad", price: 85, calories: 350, description: "Classic chicken salad.", ingredients: "Chicken, lettuce, tomato", category: "Salads" },
    { name: "Tuna Salad", price: 80, calories: 320, description: "A light and tasty tuna salad.", ingredients: "Tuna, lettuce, cucumber", category: "Salads" },
    // Burgers
    { name: "Beef Burger", price: 85, calories: 650, description: "A juicy beef burger served with chips.", ingredients: "Beef patty, bun, chips", category: "Burgers" },
    { name: "Chicken Burger", price: 85, calories: 600, description: "A grilled chicken burger served with chips.", ingredients: "Chicken breast, bun, chips", category: "Burgers" },
    { name: "Mushroom Burger", price: 95, calories: 550, description: "A hearty mushroom burger served with chips.", ingredients: "Mushroom, bun, chips", category: "Burgers" },
    { name: "Cheeseburger", price: 95, calories: 700, description: "A classic cheeseburger served with chips.", ingredients: "Beef patty, cheese, bun, chips", category: "Burgers" },
    { name: "Sloppy Joe", price: 95, calories: 720, description: "A delicious and messy sloppy joe served with chips.", ingredients: "Mince, bun, chips", category: "Burgers" },
    // Pastas
    { name: "Spaghetti Bolognese with Egg Noodles", price: 75, calories: 450, description: "Classic spaghetti bolognese with egg noodles.", ingredients: "Mince, tomato sauce, noodles", category: "Pastas" },
    { name: "Salmon Alfredo", price: 95, calories: 600, description: "Creamy salmon alfredo pasta.", ingredients: "Salmon, cream sauce, pasta", category: "Pastas" },
    { name: "Chicken & Mushroom Fettuccine", price: 95, calories: 550, description: "Chicken and mushroom in a creamy fettuccine.", ingredients: "Chicken, mushroom, cream, pasta", category: "Pastas" },
    // Keto Meals
    { name: "Salmon & Avo Salad", price: 105, calories: 420, description: "A healthy keto salmon and avocado salad.", ingredients: "Salmon, avocado, greens", category: "Keto Meals" },
    { name: "Steak & Broccoli", price: 110, calories: 500, description: "Grilled steak with a side of broccoli.", ingredients: "Steak, broccoli", category: "Keto Meals" },
    { name: "Hake & Veggies", price: 90, calories: 350, description: "Grilled hake with mixed vegetables.", ingredients: "Hake, mixed veggies", category: "Keto Meals" },
    { name: "Cheesy Hake with Salad", price: 95, calories: 400, description: "Hake with melted cheese, served with a side salad.", ingredients: "Hake, cheese, salad", category: "Keto Meals" },
    // Sweet Tooth
    { name: "Protein Brownies (x2)", price: 45, calories: 220, description: "Delicious protein-packed brownies.", ingredients: "Protein powder, cocoa, eggs", category: "Sweet Tooth" },
    { name: "Coconut Chia Granola Clusters (x2)", price: 50, calories: 250, description: "Crunchy granola clusters.", ingredients: "Oats, chia, coconut", category: "Sweet Tooth" },
    { name: "Egg Muffins (x3)", price: 50, calories: 300, description: "Savory egg muffins.", ingredients: "Eggs, cheese, vegetables", category: "Sweet Tooth" },
    { name: "Whey Protein Muffins", price: 55, calories: 280, description: "Muffins made with whey protein.", ingredients: "Whey protein, flour, eggs", category: "Sweet Tooth" },
    // Muffins
    { name: "Carrot Muffin", price: 35, calories: 280, description: "A delicious carrot muffin.", ingredients: "Carrot, flour, sugar", category: "Muffins" },
    { name: "Chocolate Muffin", price: 35, calories: 300, description: "A delicious chocolate muffin.", ingredients: "Chocolate, flour, sugar", category: "Muffins" },
    { name: "Lemon Poppy Muffin", price: 35, calories: 270, description: "A delicious lemon poppy seed muffin.", ingredients: "Lemon, poppy seeds, flour", category: "Muffins" },
    { name: "Vanilla Muffin", price: 35, calories: 260, description: "A delicious vanilla muffin.", ingredients: "Vanilla, flour, sugar", category: "Muffins" },
    { name: "Red Velvet Muffin", price: 35, calories: 290, description: "A delicious red velvet muffin.", ingredients: "Red velvet, flour, sugar", category: "Muffins" },
    { name: "Blueberry Muffin", price: 35, calories: 250, description: "A delicious blueberry muffin.", ingredients: "Blueberry, flour, sugar", category: "Muffins" },
    { name: "Chocolate Chip Muffin", price: 35, calories: 300, description: "A delicious chocolate chip muffin.", ingredients: "Chocolate chips, flour, sugar", category: "Muffins" },
    { name: "Cheesecake", price: 60, calories: 350, description: "A slice of classic cheesecake.", ingredients: "Cream cheese, sugar, crust", category: "Muffins" },
    // Alternative Coffees, Teas & Drinks
    { name: "Bullet Coffee", price: 50, calories: 200, description: "Energy booster to start your day.", ingredients: "Coffee, butter, MCT oil", category: "Alternative Coffees, Teas & Drinks" },
    { name: "Iced Coffee", price: 35, calories: 120, description: "Refreshing iced coffee.", ingredients: "Coffee, milk, ice", category: "Alternative Coffees, Teas & Drinks" },
    { name: "Detox Tea", price: 40, calories: 10, description: "A cleansing detox tea.", ingredients: "Herbal tea mix", category: "Alternative Coffees, Teas & Drinks" },
    { name: "Chai Tea with Honey", price: 45, calories: 120, description: "Spiced chai tea with a touch of honey.", ingredients: "Chai, milk, honey", category: "Alternative Coffees, Teas & Drinks" },
    { name: "Honey Ginger Tea", price: 35, calories: 80, description: "Soothing honey ginger tea.", ingredients: "Ginger, honey, hot water", category: "Alternative Coffees, Teas & Drinks" },
    { name: "Digestion & Fat Loss Tea", price: 45, calories: 10, description: "A special blend for digestion.", ingredients: "Herbal tea mix", category: "Alternative Coffees, Teas & Drinks" },
    { name: "Rooibos Tea", price: 25, calories: 5, description: "Classic South African rooibos tea.", ingredients: "Rooibos tea leaves", category: "Alternative Coffees, Teas & Drinks" },
    { name: "Golden Milk Tea", price: 45, calories: 150, description: "Turmeric and spice tea.", ingredients: "Turmeric, milk, spices", category: "Alternative Coffees, Teas & Drinks" },
    { name: "Lemon Tea", price: 15, calories: 15, description: "Simple and refreshing lemon tea.", ingredients: "Lemon, hot water", category: "Alternative Coffees, Teas & Drinks" },
    { name: "Water", price: 20, calories: 0, description: "Still or sparkling water.", ingredients: "Water", category: "Alternative Coffees, Teas & Drinks" },
    { name: "Switch Energy Drink", price: 15, calories: 110, description: "An energy boost.", ingredients: "Varies", category: "Alternative Coffees, Teas & Drinks" },
    // Smoothies & Lattes
    { name: "Peanut Butter Smoothie", price: 60, calories: 350, description: "Creamy peanut butter smoothie.", ingredients: "Peanut butter, milk, banana", category: "Smoothies & Lattes" },
    { name: "Iced Coffee Smoothie", price: 60, calories: 300, description: "A refreshing iced coffee smoothie.", ingredients: "Coffee, milk, ice, protein", category: "Smoothies & Lattes" },
    { name: "Hazelnut Latte", price: 60, calories: 280, description: "A warm hazelnut latte.", ingredients: "Espresso, milk, hazelnut syrup", category: "Smoothies & Lattes" },
    { name: "Spicy Chai Latte", price: 60, calories: 260, description: "A spicy chai latte.", ingredients: "Chai, milk, spices", category: "Smoothies & Lattes" },
    { name: "Belgian Chocolate Latte", price: 60, calories: 320, description: "A rich Belgian chocolate latte.", ingredients: "Chocolate, milk, espresso", category: "Smoothies & Lattes" },
    { name: "Salted Caramel Latte", price: 60, calories: 330, description: "A sweet and salty caramel latte.", ingredients: "Caramel, salt, milk, espresso", category: "Smoothies & Lattes" },
    { name: "Milk Tart Smoothie", price: 60, calories: 300, description: "A classic South African milk tart smoothie.", ingredients: "Milk, cinnamon, custard", category: "Smoothies & Lattes" },
    { name: "Cookies & Cream Smoothie", price: 60, calories: 350, description: "A delicious cookies and cream smoothie.", ingredients: "Cookies, cream, milk", category: "Smoothies & Lattes" },
    { name: "Bar-One Smoothie", price: 60, calories: 380, description: "A decadent Bar-One chocolate smoothie.", ingredients: "Bar-One, milk, ice cream", category: "Smoothies & Lattes" },
    // Crushers
    { name: "Strawberry Crusher", price: 50, calories: 180, description: "A refreshing strawberry crusher.", ingredients: "Strawberry, ice", category: "Crushers" },
    { name: "Blueberry Crusher", price: 50, calories: 180, description: "A refreshing blueberry crusher.", ingredients: "Blueberry, ice", category: "Crushers" },
    { name: "Mixed Berry Crusher", price: 50, calories: 180, description: "A refreshing mixed berry crusher.", ingredients: "Mixed berries, ice", category: "Crushers" },
    { name: "Mango Crusher", price: 50, calories: 180, description: "A refreshing mango crusher.", ingredients: "Mango, ice", category: "Crushers" },
    { name: "Passion Fruit Crusher", price: 50, calories: 180, description: "A refreshing passion fruit crusher.", ingredients: "Passion fruit, ice", category: "Crushers" },
    // High Protein Breakfast
    { name: "High Protein Breakfast", price: 90, calories: 500, description: "A breakfast packed with protein.", ingredients: "3 Eggs, Spinach, Cottage Cheese, Bacon, Cucumber, Tomato, Sourdough", category: "High Protein Breakfast" },
    // Open Sandwiches
    { name: "Salmon, Avo & Egg Sandwich", price: 110, calories: 480, description: "Open sandwich with salmon, avo and egg.", ingredients: "Salmon, avocado, egg, pesto, bread", category: "Open Sandwiches" },
    { name: "Chicken Mayonnaise Sandwich", price: 65, calories: 420, description: "Classic chicken mayo open sandwich.", ingredients: "Chicken, mayonnaise, bread", category: "Open Sandwiches" },
    { name: "Salmon, Egg & Cheese Sandwich", price: 110, calories: 500, description: "An open sandwich with salmon, egg, and cheese.", ingredients: "Salmon, egg, cheese, bread", category: "Open Sandwiches" },
    { name: "Bacon & Egg Cheese Sandwich", price: 65, calories: 450, description: "An open sandwich with bacon, egg, and cheese.", ingredients: "Bacon, egg, cheese, bread", category: "Open Sandwiches" },
    { name: "Bacon, Avo & Egg Sandwich", price: 70, calories: 470, description: "An open sandwich with bacon, avo, and egg.", ingredients: "Bacon, avo, egg, bread", category: "Open Sandwiches" },
    { name: "Tuna Mayonnaise Sandwich", price: 70, calories: 430, description: "A classic tuna mayonnaise open sandwich.", ingredients: "Tuna, mayonnaise, bread", category: "Open Sandwiches" },
    { name: "Egg Salad Sandwich", price: 55, calories: 350, description: "An open sandwich with egg salad.", ingredients: "Egg, mayonnaise, bread", category: "Open Sandwiches" },
    { name: "Ham & Cheese Sandwich", price: 55, calories: 400, description: "A classic ham and cheese open sandwich.", ingredients: "Ham, cheese, bread", category: "Open Sandwiches" },
    // Macro Conscious
    { name: "Chicken Strips with Avocado", price: 85, calories: 450, description: "Macro-friendly chicken strips.", ingredients: "Chicken, avocado, red onion, feta", category: "Macro Conscious" },
    { name: "Chicken & Avo Wrap", price: 85, calories: 480, description: "A healthy chicken and avo wrap.", ingredients: "Chicken, avocado, wrap", category: "Macro Conscious" },
    { name: "Chicken Stir-Fry with Basmati Rice", price: 85, calories: 500, description: "A classic chicken stir-fry with rice.", ingredients: "Chicken, vegetables, rice, soy sauce", category: "Macro Conscious" },
    { name: "Chicken, Carbs & Veg", price: 85, calories: 480, description: "A balanced meal of chicken, carbs, and veggies.", ingredients: "Chicken, sweet potato, broccoli", category: "Macro Conscious" },
    { name: "Chicken Coconut Curry", price: 85, calories: 500, description: "A fragrant chicken coconut curry.", ingredients: "Chicken, coconut milk, curry spices, rice", category: "Macro Conscious" },
    { name: "Chicken Strips & Chips with Dip", price: 85, calories: 550, description: "Crispy chicken strips with chips and a dip.", ingredients: "Chicken, potatoes, dip", category: "Macro Conscious" },
    { name: "Chickpea Coconut Curry", price: 85, calories: 450, description: "A vegetarian chickpea coconut curry.", ingredients: "Chickpeas, coconut milk, curry spices, rice", category: "Macro Conscious" },
    { name: "Beef, Feta & Avo Wrap", price: 95, calories: 520, description: "A wrap with beef, feta, and avocado.", ingredients: "Beef, feta, avocado, wrap", category: "Macro Conscious" },
    { name: "Mince Wrap (Mexican)", price: 95, calories: 540, description: "A Mexican-style mince wrap.", ingredients: "Mince, beans, salsa, wrap", category: "Macro Conscious" },
    { name: "Steak, Egg & Chips", price: 110, calories: 650, description: "A classic steak, egg, and chips.", ingredients: "Steak, egg, chips", category: "Macro Conscious" },
    // Breakfast
    { name: "Poached Egg on Greens", price: 60, calories: 250, description: "Two poached eggs on a bed of greens.", ingredients: "Eggs, kale, red onion, cottage cheese", category: "Breakfast" },
    { name: "Overnight Oats with Berries", price: 40, calories: 300, description: "Healthy and convenient overnight oats.", ingredients: "Oats, chia seeds, yoghurt, berries", category: "Breakfast"},
    { name: "Breakfast Pizza (Egg Base)", price: 65, calories: 450, description: "A low-carb breakfast pizza with an egg base.", ingredients: "Egg, bacon/ham/mince, mushrooms, cheese", category: "Breakfast" },
    { name: "Triple Delight Omelette", price: 65, calories: 400, description: "An omelette with bacon or ham, cheese, tomato and onion.", ingredients: "Eggs, bacon/ham, cheese, tomato, onion", category: "Breakfast" },
    { name: "Powerhouse Omelette", price: 70, calories: 450, description: "A large omelette packed with protein.", ingredients: "4 Eggs, bacon, spinach, herbs, cheese", category: "Breakfast" },
    { name: "Breakfast Beast", price: 110, calories: 700, description: "For the hungry! A massive breakfast plate.", ingredients: "3 Eggs, 3 Bacon, 1 Cheese Griller, Chips, Spinach, Sourdough", category: "Breakfast" },
    { name: "English Breakfast", price: 55, calories: 350, description: "A classic English breakfast.", ingredients: "2 Eggs, Bacon, Grilled Tomato, Sourdough", category: "Breakfast" },
    { name: "Heavy Breakfast", price: 90, calories: 500, description: "A bigger take on the classic breakfast.", ingredients: "3 Eggs, 2 Bacon, Grilled Tomato, Sourdough, 1 Cheese Griller", category: "Breakfast" },
    { name: "Hash Brown Breakfast", price: 85, calories: 480, description: "A breakfast focused on hash browns.", ingredients: "2 Bacon, 2 Hash Browns, 3 Cheese Balls", category: "Breakfast" },
    { name: "Eggs Benedict with Ham or Bacon", price: 89, calories: 450, description: "Classic Eggs Benedict.", ingredients: "Eggs, muffin, hollandaise, ham/bacon", category: "Breakfast" },
    { name: "Eggs Benedict with Salmon", price: 125, calories: 520, description: "Eggs Benedict with salmon.", ingredients: "Eggs, muffin, hollandaise, salmon", category: "Breakfast" },
    { name: "Potato Rosti", price: 75, calories: 400, description: "A crispy potato rosti breakfast.", ingredients: "Potato, cheese, egg, viennas, bacon, toast", category: "Breakfast" },
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
    if (lowerName.includes('brownie') || lowerName.includes('cheesecake') || lowerName.includes('muffin') || lowerName.includes('sweet')) return <CakeSlice className="h-10 w-10 text-muted-foreground" />;
    if (lowerName.includes('coffee') || lowerName.includes('tea') || lowerName.includes('latte')) return <Coffee className="h-10 w-10 text-muted-foreground" />;
    if (lowerName.includes('smoothie') || lowerName.includes('crusher') || lowerName.includes('drink')) return <Martini className="h-10 w-10 text-muted-foreground" />;
    if (lowerName.includes('breakfast') || lowerName.includes('egg') || lowerName.includes('oats')) return <Soup className="h-10 w-10 text-muted-foreground" />;
    if (lowerName.includes('sandwich') || lowerName.includes('wrap')) return <Sandwich className="h-10 w-10 text-muted-foreground" />;
    if (lowerName.includes('macro') || lowerName.includes('conscious')) return <Apple className="h-10 w-10 text-muted-foreground" />;
    return <Utensils className="h-10 w-10 text-muted-foreground" />;
  }

  const categorizedMeals = meals.reduce((acc, meal) => {
    const category = (meal as any).category || "Uncategorized";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(meal);
    return acc;
  }, {} as Record<string, MenuItem[]>);


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
      <div className="space-y-8 mt-4">
        {Object.entries(categorizedMeals).sort(([catA], [catB]) => {
            const order = newMenuData.map(item => item.category);
            const indexA = order.indexOf(catA);
            const indexB = order.indexOf(catB);
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        }).map(([category, categoryMeals]) => (
            <div key={category}>
                <h2 className="text-2xl font-bold tracking-tight mb-4">{category}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {categoryMeals.map((meal) => (
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
                    ))}
                </div>
            </div>
        ))}
        {meals.length === 0 && (
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

    