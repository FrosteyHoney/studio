
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
  const [dbIsAdmin, setDbIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Super admin check
        const isSuperAdmin = user.email === 'myburghjobro@gmail.com';

        const tokenResult = await user.getIdTokenResult();
        const claimsIsAdmin = !!tokenResult.claims.admin;
        
        // User is admin if they are super admin, have the claim, or the flag in the DB
        setIsAdmin(isSuperAdmin || claimsIsAdmin || dbIsAdmin);
        setIsTrainer(!!tokenResult.claims.trainer);
        
      } else {
        setIsAdmin(false);
        setIsTrainer(false);
      }
      setLoading(false);
    });
    
    return () => unsubscribeAuth();
  }, [user, dbIsAdmin]); // Re-run when user or db admin status changes

  useEffect(() => {
    if (user) {
      setLoading(true);
      const userDocRef = doc(db, 'users', user.uid);
      const unsubscribeFirestore = onSnapshot(userDocRef, async (doc) => {
        if (doc.exists()) {
            const data = doc.data();
            const databaseIsAdmin = !!data.isAdmin;
            
            // Update dbIsAdmin state if it has changed
            if(databaseIsAdmin !== dbIsAdmin) {
                setDbIsAdmin(databaseIsAdmin);
            }

            // Force a token refresh if the DB role doesn't match the token claim
            const tokenResult = await user.getIdTokenResult();
            if (databaseIsAdmin !== !!tokenResult.claims.admin) {
              console.log("Admin status mismatch, forcing token refresh...");
              await user.getIdToken(true);
            }
        }
        setLoading(false);
      }, (error) => {
        console.error("Error fetching user document:", error);
        setLoading(false);
      });
      return () => unsubscribeFirestore();
    } else {
        // No user, no db admin status
        setDbIsAdmin(false);
    }
  }, [user]);
  
  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, isTrainer }}>
      <FirebaseErrorListener />
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
