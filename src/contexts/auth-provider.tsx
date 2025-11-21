
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
  const [tokenClaims, setTokenClaims] = useState<any>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const tokenResult = await user.getIdTokenResult();
        setTokenClaims(tokenResult.claims);
        setIsAdmin(!!tokenResult.claims.admin);
        setIsTrainer(!!tokenResult.claims.trainer);
        setLoading(false);
      } else {
        // If there's no user, they can't have roles.
        setIsAdmin(false);
        setIsTrainer(false);
        setLoading(false);
        setTokenClaims(null);
      }
    });
    
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      const unsubscribeFirestore = onSnapshot(userDocRef, async (doc) => {
        if (doc.exists()) {
            const data = doc.data();
            const currentTokenIsAdmin = tokenClaims?.admin === true;
            
            // If the database role has changed compared to the token claim,
            // force a token refresh to get the new custom claims.
            if (data.isAdmin !== currentTokenIsAdmin) {
              console.log("Admin status mismatch, forcing token refresh...");
              await user.getIdToken(true); // Force refresh
            }
        }
        setLoading(false);
      }, (error) => {
        console.error("Error fetching user document for token refresh check:", error);
        setLoading(false);
      });
      return () => unsubscribeFirestore();
    }
  }, [user, tokenClaims]);
  
  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, isTrainer }}>
      <FirebaseErrorListener />
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
