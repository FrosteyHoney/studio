"use client";

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';

// This is a client component that will listen for permission errors
// and throw them to be caught by the Next.js error overlay.
// This is only active in development.
export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      console.error("Caught permission error:", error.message);
      
      // In a real app, you might want to show a toast or a less intrusive notification.
      // For this debugging environment, we will throw it to make it visible.
      if (process.env.NODE_ENV === 'development') {
         // This will be caught by Next.js's error overlay
        throw error;
      } else {
        // In production, just show a generic error toast.
        toast({
            variant: "destructive",
            title: "Permission Denied",
            description: "You do not have permission to perform this action.",
        });
      }
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, [toast]);

  return null; // This component does not render anything.
}
