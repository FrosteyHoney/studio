
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

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) {
        // If there's no user, they can't have roles.
        setIsAdmin(false);
        setIsTrainer(false);
        setLoading(false);
      }
    });
    
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      const unsubscribeFirestore = onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
            const data = doc.data();
            setIsAdmin(data.isAdmin || user.email === 'myburghjobro@gmail.com');
            setIsTrainer(data.isTrainer);
        } else {
            // User document doesn't exist, they have no special roles
            setIsAdmin(user.email === 'myburghjobro@gmail.com');
            setIsTrainer(false);
        }
        setLoading(false);
      }, (error) => {
        console.error("Error fetching user roles:", error);
        setIsAdmin(user.email === 'myburghjobro@gmail.com');
        setIsTrainer(false);
        setLoading(false);
      });
      return () => unsubscribeFirestore();
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
