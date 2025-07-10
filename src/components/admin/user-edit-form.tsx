
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
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const formSchema = z.object({
  height: z.coerce.number().min(0, { message: "Height must be a positive number." }),
  weight: z.coerce.number().min(0, { message: "Weight must be a positive number." }),
  bmi: z.coerce.number().min(0, { message: "BMI must be a positive number." }),
  bodyFat: z.coerce.number().min(0, { message: "Body Fat % must be a positive number." }),
  muscleMass: z.coerce.number().min(0, { message: "Muscle Mass must be a positive number." }),
});

interface UserEditFormProps {
    setOpen: Dispatch<SetStateAction<boolean>>;
    initialData?: any;
    onUserUpdated: () => void;
}

export function UserEditForm({ setOpen, initialData, onUserUpdated }: UserEditFormProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      height: 0,
      weight: 0,
      bmi: 0,
      bodyFat: 0,
      muscleMass: 0,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!initialData?.id) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "No user ID found to update.",
        });
        return;
    }
    
    try {
        const userRef = doc(db, "users", initialData.id);
        await updateDoc(userRef, values);
        toast({
            title: "User Updated",
            description: `The details for ${initialData?.name} have been successfully saved.`,
        });
        onUserUpdated(); // Call the refetch function
        setOpen(false);
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: "Could not save user details to the database.",
        });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="height"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Height (cm)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Weight (kg)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="bmi"
          render={({ field }) => (
            <FormItem>
              <FormLabel>BMI</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="bodyFat"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Body Fat (%)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="muscleMass"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Muscle Mass (kg)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </Form>
  );
}
