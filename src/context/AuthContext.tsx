import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { UserRole, UserProfile } from '../types';

interface AuthContextType {
  firebaseUser: User | null;
  currentUser: UserProfile | null;
  currentRole: UserRole;
  isAuthenticated: boolean;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  loginUserDirect: (profile: UserProfile) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (uid: string, email: string | null, displayName: string | null): Promise<UserProfile> => {
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) {
        return snap.data() as UserProfile;
      }
    } catch (err) {
      console.warn('Could not fetch Firestore user profile:', err);
    }
    return {
      uid,
      email: email || '',
      displayName: displayName || email?.split('@')[0] || 'User',
      role: 'DONOR',
      createdAt: new Date().toISOString(),
      consentGiven: true
    };
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        const profile = await fetchProfile(user.uid, user.email, user.displayName);
        setCurrentUser(profile);
      } else {
        setCurrentUser(prev => prev);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshUserProfile = async () => {
    if (firebaseUser) {
      const profile = await fetchProfile(firebaseUser.uid, firebaseUser.email, firebaseUser.displayName);
      setCurrentUser(profile);
    }
  };

  const loginUserDirect = (profile: UserProfile) => {
    setCurrentUser(profile);
  };

  const logout = async () => {
    await signOut(auth);
    setFirebaseUser(null);
    setCurrentUser(null);
  };

  const currentRole = currentUser?.role || 'DONOR';

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        currentUser,
        currentRole,
        isAuthenticated: !!currentUser,
        loading,
        logout,
        refreshUserProfile,
        loginUserDirect
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


