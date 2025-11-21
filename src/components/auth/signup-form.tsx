
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
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Eye, EyeOff } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, { message: "First name must be at least 2 characters." }),
  surname: z.string().min(2, { message: "Surname must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export function SignUpForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      surname: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;
      
      if (user) {
        const displayName = `${values.name} ${values.surname}`;
        await updateProfile(user, {
            displayName: displayName
        });

        await setDoc(doc(db, "users", user.uid), {
            id: user.uid,
            name: displayName,
            email: user.email,
            status: "Active",
            joined: new Date().toISOString().split('T')[0], 
            height: 0,
            weight: 0,
            bmi: 0,
            bodyFat: 0,
            muscleMass: 0,
            prevWeight: 0,
            prevBmi: 0,
            prevBodyFat: 0,
            prevMuscleMass: 0,
            isAdmin: false,
            isTrainer: false,
        });
      }

      toast({
        title: "Account Created",
        description: "Welcome! You have successfully signed up.",
      });
      router.push("/dashboard");
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        toast({
          variant: "destructive",
          title: "Sign Up Failed",
          description: "This email is already in use. Please try logging in instead.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: `Firebase: Error (${error.code || error.message})`,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-6">
        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
                <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                    <Input placeholder="John" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="surname"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Surname</FormLabel>
                <FormControl>
                    <Input placeholder="Doe" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="m@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
               <div className="relative">
                <FormControl>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...field}
                  />
                </FormControl>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute inset-y-0 right-0 h-full px-3 py-2 text-muted-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  <span className="sr-only">
                    {showPassword ? "Hide password" : "Show password"}
                  </span>
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full !mt-6" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Sign Up
        </Button>
         <div className="text-center text-sm text-muted-foreground pt-4">
            Already have an account? <Button variant="link" className="p-0 h-auto text-primary" type="button" onClick={() => router.push('/?tab=login')}>Sign In</Button>
        </div>
      </form>
    </Form>
  );
}

    
