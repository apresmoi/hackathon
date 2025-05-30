'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { app, auth as firebaseAuth, db as firebaseDb } from '@/lib/firebase/firebase';

interface FirebaseContextType {
  app: FirebaseApp | null;
  auth: Auth | null;
  db: Firestore | null;
  isFirebaseLoading: boolean;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseApp, setFirebaseApp] = useState<FirebaseApp | null>(null);
  const [auth, setAuth] = useState<Auth | null>(null);
  const [db, setDb] = useState<Firestore | null>(null);
  const [isFirebaseLoading, setIsFirebaseLoading] = useState(true);

  useEffect(() => {
    // Firebase initializes itself in firebase.ts if on client
    // We just need to set the state here once it's available
    if (app && firebaseAuth && firebaseDb) {
      setFirebaseApp(app);
      setAuth(firebaseAuth);
      setDb(firebaseDb);
    }
    setIsFirebaseLoading(false);
  }, []);

  return (
    <FirebaseContext.Provider value={{ app: firebaseApp, auth, db, isFirebaseLoading }}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = (): FirebaseContextType => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};
