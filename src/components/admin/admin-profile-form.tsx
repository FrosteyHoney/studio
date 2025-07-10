
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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-provider";
import { updateEmail, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { useState } from "react";
import { Loader2 } from "lucide-react";
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

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

export function AdminProfileForm() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isReauthDialogOpen, setReauthDialogOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [reauthError, setReauthError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: user?.email || "",
    },
  });

  const handleReauthenticateAndRetry = async () => {
    if (!user || !password) {
      setReauthError("Password is required.");
      return;
    }
    
    setIsLoading(true);
    setReauthError(null);

    try {
      if (!user.email) throw new Error("User email not found for re-authentication.");
      
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      
      // Re-authentication successful, now retry the email update
      const newEmail = form.getValues("email");
      await updateEmail(user, newEmail);
      
      toast({
        title: "Email Updated",
        description: "Your login email has been successfully changed.",
      });
      setReauthDialogOpen(false);
      setPassword("");

    } catch (error: any) {
      console.error("Re-authentication or email update failed:", error);
      setReauthError(error.message || "An unexpected error occurred.");
    } finally {
        setIsLoading(false);
    }
  };

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
        await updateEmail(user, values.email);
        toast({
            title: "Email Updated",
            description: "Your login email has been successfully changed.",
        });
    } catch (error: any) {
        if (error.code === 'auth/requires-recent-login' || error.code === 'auth/operation-not-allowed') {
            setReauthDialogOpen(true);
        } else {
            toast({
                variant: "destructive",
                title: "Error updating email",
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

      <AlertDialog open={isReauthDialogOpen} onOpenChange={setReauthDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Please Re-authenticate</AlertDialogTitle>
            <AlertDialogDescription>
              For your security, please enter your current password to confirm this change.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
             <Input 
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="mt-2"
              />
              {reauthError && <p className="text-sm text-destructive">{reauthError}</p>}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {setPassword(''); setReauthError(null);}}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReauthenticateAndRetry} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

