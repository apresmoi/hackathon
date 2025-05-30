
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { User } from 'firebase/auth'; // Import User type
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useFirebase } from './firebase-provider';
import type { UserProfile } from '@/lib/types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const createMockUser = (): { mockUser: User, mockUserProfile: UserProfile } => {
  const mockUserInstance: User = {
    uid: 'mock-user-uid-123',
    email: 'mockuser@example.com',
    displayName: 'Mock User (Admin)',
    emailVerified: true,
    isAnonymous: false,
    metadata: { creationTime: new Date().toISOString(), lastSignInTime: new Date().toISOString() },
    providerData: [],
    providerId: 'password', // or 'firebase'
    refreshToken: 'mock-refresh-token',
    tenantId: null,
    delete: async () => { console.warn('Mock user delete called'); },
    getIdToken: async (_forceRefresh?: boolean) => 'mock-id-token',
    getIdTokenResult: async (_forceRefresh?: boolean) => ({
      token: 'mock-id-token',
      claims: { admin: true },
      authTime: new Date().toISOString(),
      issuedAtTime: new Date().toISOString(),
      signInProvider: 'password',
      signInSecondFactor: null,
      expirationTime: new Date(Date.now() + 3600 * 1000).toISOString(),
    }),
    reload: async () => { console.warn('Mock user reload called'); },
    toJSON: () => ({ uid: 'mock-user-uid-123', email: 'mockuser@example.com', displayName: 'Mock User (Admin)' }),
    photoURL: null,
    phoneNumber: null,
  };
  const mockUserProfileInstance: UserProfile = {
    uid: 'mock-user-uid-123',
    email: 'mockuser@example.com',
    displayName: 'Mock User (Admin)',
    familyId: 'mock-family-id-xyz',
    isAdmin: true,
    points: 1000,
  };
  return { mockUser: mockUserInstance, mockUserProfile: mockUserProfileInstance };
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { auth, db, isFirebaseLoading } = useFirebase();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (isFirebaseLoading) {
      // Still waiting for Firebase services to be confirmed by FirebaseProvider
      setLoading(true);
      return;
    }

    if (!auth || !db) {
      console.warn(
        "Firebase auth or db service not available from FirebaseProvider. " +
        "This might be due to invalid or missing Firebase config in .env. " +
        "Providing a mock user for UI interaction. Real Firebase features will not work."
      );
      const { mockUser, mockUserProfile } = createMockUser();
      setCurrentUser(mockUser);
      setUserProfile(mockUserProfile);
      setIsAdmin(mockUserProfile.isAdmin || false);
      setLoading(false);
      return; // Exit early, no auth listener to set up
    }

    // If auth and db services are available, try to set up the real auth listener
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const profileData = userDocSnap.data() as UserProfile;
            setUserProfile(profileData);
            setIsAdmin(profileData.isAdmin || false);
          } else {
            // User exists in auth but not in Firestore. Could be a partially completed signup.
            // For a real app, you might create the profile here or redirect.
            // For mock purposes, if this happens with a real user object,
            // it's an inconsistent state, but we'll default to non-admin.
            console.warn(`User ${user.uid} authenticated but no profile found in Firestore.`);
            setUserProfile(null);
            setIsAdmin(false);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          // If fetching profile fails, fall back to mock user to keep UI usable.
          console.warn("Falling back to mock user due to profile fetch error.");
          const { mockUser: mu, mockUserProfile: mup } = createMockUser();
          setCurrentUser(mu); // It's a bit odd to set mock user if 'user' object exists, but for UI stability
          setUserProfile(mup);
          setIsAdmin(mup.isAdmin || false);
        }
      } else {
        // No real user authenticated (e.g., not logged in, or login/signup failed due to API key, etc.)
        console.warn(
          "No Firebase user authenticated or auth operations failed (e.g. invalid API key). " +
          "Providing a mock user for UI interaction. Real Firebase features will not work."
        );
        const { mockUser, mockUserProfile } = createMockUser();
        setCurrentUser(mockUser);
        setUserProfile(mockUserProfile);
        setIsAdmin(mockUserProfile.isAdmin || false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, db, isFirebaseLoading]);

  return (
    <AuthContext.Provider value={{ currentUser, userProfile, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
