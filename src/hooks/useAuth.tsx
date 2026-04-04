import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth, signOut as firebaseSignOut, getCurrentUser, getUserProfile, ensureUserProfile, ensureUserProgress, UserProfile } from '@/integrations/firebase/client';

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  refreshUserProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);

  const loadUserProfile = useCallback(async (user: FirebaseUser | null) => {
    if (!user) {
      setUserProfile(null);
      setProfileLoading(false);
      return;
    }

    try {
      setProfileLoading(true);
      let profile = await getUserProfile(user.uid);
      if (!profile) {
        profile = await ensureUserProfile(user, 'student');
      }
      setUserProfile(profile);
    } catch (error) {
      console.error('Failed to load user profile:', error);
      setUserProfile(null);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    // Set up auth state listener
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      await loadUserProfile(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [loadUserProfile]);

  const refreshUserProfile = useCallback(async () => {
    if (user) {
      await loadUserProfile(user);
    }
  }, [user, loadUserProfile]);

  const handleSignOut = async () => {
    await firebaseSignOut();
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userProfile, 
      loading: loading || profileLoading, 
      refreshUserProfile,
      signOut: handleSignOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};