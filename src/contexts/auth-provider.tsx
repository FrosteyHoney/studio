
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isTrainer: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  isTrainer: false,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isTrainer, setIsTrainer] = useState(false);
  const [lastKnownDbIsAdmin, setLastKnownDbIsAdmin] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      setUser(user);
      if (user) {
        try {
          const tokenResult = await user.getIdTokenResult();
          const claimsIsAdmin = !!tokenResult.claims.admin;
          const isSuperAdmin = user.email === 'myburghjobro@gmail.com';
          
          setIsAdmin(isSuperAdmin || claimsIsAdmin);
          setIsTrainer(!!tokenResult.claims.trainer);
        } catch (error) {
          console.error("Error fetching user token:", error);
          setIsAdmin(false);
          setIsTrainer(false);
        }
      } else {
        setIsAdmin(false);
        setIsTrainer(false);
        setLastKnownDbIsAdmin(undefined);
      }
      setLoading(false);
    });
    
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      const unsubscribeFirestore = onSnapshot(userDocRef, async (doc) => {
        if (doc.exists()) {
            const data = doc.data();
            const currentDbIsAdmin = !!data.isAdmin;

            // If the database role has changed since we last checked, force a token refresh.
            if (lastKnownDbIsAdmin !== undefined && lastKnownDbIsAdmin !== currentDbIsAdmin) {
              console.log("Admin role change detected in DB, forcing token refresh...");
              await user.getIdToken(true); // This forces a refresh
              // Re-check claims after refresh
              const tokenResult = await user.getIdTokenResult();
              setIsAdmin(user.email === 'myburghjobro@gmail.com' || !!tokenResult.claims.admin);
            }
            // Update our last known state from the DB.
            setLastKnownDbIsAdmin(currentDbIsAdmin);
        }
      }, (error) => {
        // This listener might fail if the user has no read access to their own doc yet.
        // We shouldn't crash the app, just log it. The main auth logic is token-based.
        console.warn("Could not set up listener for user document:", error.message);
      });
      return () => unsubscribeFirestore();
    }
  }, [user, lastKnownDbIsAdmin]);
  
  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, isTrainer }}>
      <FirebaseErrorListener />
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
