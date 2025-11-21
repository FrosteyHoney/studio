
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Dispatch, SetStateAction } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters." }),
  price: z.coerce.number().min(0, { message: "Price must be a positive number." }),
  calories: z.coerce.number().min(0, { message: "Calories must be a positive number." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  ingredients: z.string().min(3, { message: "Ingredients must be at least 3 characters." }),
  category: z.string().min(3, { message: "Category is required." }),
  image: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
});

export type MenuItem = z.infer<typeof formSchema> & { id: string };

const categories = [
    "Salads",
    "Burgers",
    "Pastas",
    "Keto Meals",
    "Sweet Tooth",
    "Muffins",
    "Drinks",
    "Smoothies & Lattes",
    "Crushers",
    "Breakfast",
    "Open Sandwiches",
    "Macro Conscious",
    "Uncategorized",
]

interface MenuFormProps {
    setOpen: Dispatch<SetStateAction<boolean>>;
    initialData?: MenuItem | null;
    onMealUpdated: () => void;
}

export function MenuForm({ setOpen, initialData, onMealUpdated }: MenuFormProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      price: 0,
      calories: 0,
      description: "",
      ingredients: "",
      category: "Uncategorized",
      image: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (initialData) {
        // Update existing meal
        const mealRef = doc(db, "menu", initialData.id);
        updateDoc(mealRef, values).then(() => {
            toast({
                title: 'Meal Updated',
                description: `"${values.name}" has been successfully updated.`,
            });
            onMealUpdated();
            setOpen(false);
        }).catch(serverError => {
            const permissionError = new FirestorePermissionError({
                path: mealRef.path,
                operation: 'update',
                requestResourceData: values
            });
            errorEmitter.emit('permission-error', permissionError);
        });
    } else {
        // Add new meal
        const menuCollection = collection(db, "menu");
        addDoc(menuCollection, values).then(() => {
            toast({
                title: 'Meal Added',
                description: `"${values.name}" has been successfully added to the menu.`,
            });
            onMealUpdated();
            setOpen(false);
        }).catch(serverError => {
             const permissionError = new FirestorePermissionError({
                path: menuCollection.path,
                operation: 'create',
                requestResourceData: values
            });
            errorEmitter.emit('permission-error', permissionError);
        });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meal Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Grilled Chicken Salad" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Price (R)</FormLabel>
                <FormControl>
                    <Input type="number" step="0.01" placeholder="e.g., 120.00" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="calories"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Calories</FormLabel>
                <FormControl>
                    <Input type="number" placeholder="e.g., 550" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="A brief description of the meal." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="ingredients"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ingredients</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Chicken, Quinoa, Spinach" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        {categories.map(category => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input placeholder="https://placehold.co/400x300.png" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
        </div>
      </form>
    </Form>
  );
}
