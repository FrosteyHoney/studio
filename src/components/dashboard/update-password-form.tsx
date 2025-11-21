
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
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
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
  newPassword: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export function UpdatePasswordForm() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showReauthDialog, setShowReauthDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newPassword: "",
    },
  });

  async function handleReauthenticateAndRetry() {
    if (!user || !currentPassword) {
      toast({ variant: "destructive", title: "Current password is required." });
      return;
    }
    
    setIsLoading(true);
    setShowReauthDialog(false);

    try {
      const credential = EmailAuthProvider.credential(user.email!, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      const newPassword = form.getValues("newPassword");
      await updatePassword(user, newPassword);
      
      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully.",
      });
      form.reset();

    } catch (error: any) {
       toast({
        variant: "destructive",
        title: "Error",
        description: `Authentication failed: ${error.message}`,
      });
    } finally {
      setIsLoading(false);
      setCurrentPassword("");
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setShowReauthDialog(true);
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-md">
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input 
                      type={showNewPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...field} />
                  </FormControl>
                   <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute inset-y-0 right-0 h-full px-3 py-2 text-muted-foreground"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                    {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                    ) : (
                        <Eye className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                        {showNewPassword ? "Hide password" : "Show password"}
                    </span>
                    </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Password
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
            <Label htmlFor="current-password">Current Password</Label>
            <div className="relative">
              <Input
                id="current-password"
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
              />
              <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute inset-y-0 right-0 h-full px-3 py-2 text-muted-foreground"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  <span className="sr-only">
                    {showCurrentPassword ? "Hide password" : "Show password"}
                  </span>
                </Button>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCurrentPassword("")}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReauthenticateAndRetry} disabled={isLoading || !currentPassword}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
