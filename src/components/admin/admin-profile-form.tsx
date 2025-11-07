
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
import { useAuth } from "@/contexts/auth-provider";
import { verifyBeforeUpdateEmail, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { useState } from "react";
import { Loader2, Eye, EyeOff } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().optional(),
});

export function AdminProfileForm() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showReauthDialog, setShowReauthDialog] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: user?.email || "",
    },
  });

  async function handleReauthenticateAndRetry() {
    if (!user || !password) {
      toast({ variant: "destructive", title: "Password is required" });
      return;
    }
    
    setIsLoading(true);
    setShowReauthDialog(false);

    try {
      const credential = EmailAuthProvider.credential(user.email!, password);
      await reauthenticateWithCredential(user, credential);
      
      // Re-authentication successful, now retry the email update
      const newEmail = form.getValues("email");
      await verifyBeforeUpdateEmail(user, newEmail);
      
      toast({
        title: "Verification Email Sent",
        description: `A link to verify your new email has been sent to ${newEmail}. Please check your inbox.`,
      });
      form.reset({ email: user.email || "" });

    } catch (error: any) {
       toast({
        variant: "destructive",
        title: "Error",
        description: `Re-authentication failed: ${error.message}`,
      });
    } finally {
      setIsLoading(false);
      setPassword("");
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
        toast({ variant: "destructive", title: "Not authenticated" });
        return;
    }

    if (user.email === values.email) {
        toast({ title: "No changes", description: "The new email is the same as the current one." });
        return;
    }

    setIsLoading(true);
    try {
        await verifyBeforeUpdateEmail(user, values.email);
        toast({
            title: "Verification Email Sent",
            description: `A link to verify and update your email has been sent to ${values.email}. Please check your inbox.`,
        });
        form.reset({ email: user.email || "" });
    } catch (error: any) {
        if (error.code === 'auth/requires-recent-login') {
            setShowReauthDialog(true);
        } else {
            toast({
                variant: "destructive",
                title: "Error Sending Verification",
                description: error.message,
            });
        }
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-md">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Admin Email</FormLabel>
                <FormControl>
                  <Input placeholder="admin@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
          </Button>
        </form>
      </Form>
      <AlertDialog open={showReauthDialog} onOpenChange={setShowReauthDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Please Re-authenticate</AlertDialogTitle>
            <AlertDialogDescription>
              For your security, please enter your current password to confirm this change.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
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
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPassword("")}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReauthenticateAndRetry}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
