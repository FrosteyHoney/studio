
"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  activity: z.string().min(1, "Please select an activity."),
  duration: z.coerce.number().min(1, "Duration must be at least 1 minute.").max(360, "Duration cannot exceed 360 minutes."),
});

const activities = [
    { value: "running", label: "Running" },
    { value: "weightlifting", label: "Weightlifting" },
    { value: "cycling", label: "Cycling" },
    { value: "yoga", label: "Yoga/Stretching" },
    { value: "swimming", label: "Swimming" },
    { value: "other", label: "Other" },
];

export function LogWorkout() {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      activity: "",
      duration: 60,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    toast({
      title: "Workout Logged!",
      description: `Great job! Your ${values.duration} minute ${values.activity} session is saved.`,
    });
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="activity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Activity</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an activity" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {activities.map(activity => (
                    <SelectItem key={activity.value} value={activity.value}>
                      {activity.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration (minutes)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 60" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">Log Workout</Button>
      </form>
    </Form>
  );
}
