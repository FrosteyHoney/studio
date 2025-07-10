
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
import { useToast } from "@/hooks/use-toast";
import { Dispatch, SetStateAction } from "react";

const formSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters." }),
  calories: z.coerce.number().min(0, { message: "Calories must be a positive number." }),
  price: z.coerce.number().min(0, { message: "Price must be a positive number." }),
  image: z.string().url({ message: "Please enter a valid URL." }),
});

interface MenuFormProps {
    setOpen: Dispatch<SetStateAction<boolean>>;
    initialData?: any;
}

export function MenuForm({ setOpen, initialData }: MenuFormProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      calories: 0,
      price: 0,
      image: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    toast({
      title: `Meal ${initialData ? 'Updated' : 'Created'}`,
      description: `"${values.name}" has been successfully saved.`,
    });
    // Here you would typically call an API to save the data
    console.log(values);
    setOpen(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
            name="calories"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Calories</FormLabel>
                <FormControl>
                    <Input type="number" placeholder="e.g., 450" {...field} />
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
        </div>
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/image.png" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
        </div>
      </form>
    </Form>
  );
}
