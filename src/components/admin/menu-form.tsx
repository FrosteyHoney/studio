
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

const formSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters." }),
  price: z.coerce.number().min(0, { message: "Price must be a positive number." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  ingredients: z.string().min(3, { message: "Ingredients must be at least 3 characters." }),
  image: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
});

export type MenuItem = z.infer<typeof formSchema> & { id: string };

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
      description: "",
      ingredients: "",
      image: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
        if (initialData) {
            // Update existing meal
            const mealRef = doc(db, "menu", initialData.id);
            await updateDoc(mealRef, values);
            toast({
                title: 'Meal Updated',
                description: `"${values.name}" has been successfully updated.`,
            });
        } else {
            // Add new meal
            await addDoc(collection(db, "menu"), values);
            toast({
                title: 'Meal Added',
                description: `"${values.name}" has been successfully added to the menu.`,
            });
        }
        onMealUpdated();
        setOpen(false);
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Database Error",
            description: "Could not save the meal. Please try again.",
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
