"use client";

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { type FirestorePermissionError } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';

/**
 * A client component that listens for Firestore permission errors
 * and displays them to the user in a non-blocking way.
 */
export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      // Log the full error to the console for detailed debugging
      console.error("Caught permission error:", error.message);

      // Show a non-blocking toast notification to the user
      toast({
        variant: "destructive",
        title: "Permission Error",
        description: "Could not access some data. Please check security rules.",
      });
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, [toast]);

  return null;
}
