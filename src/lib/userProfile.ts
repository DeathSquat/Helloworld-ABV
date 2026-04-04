import { User as FirebaseUser } from 'firebase/auth';
import { createUserProfile as createFirebaseProfile, getUserProfile as getFirebaseProfile } from '@/integrations/firebase/client';

export interface UserProfile {
  id: string;
  user_id: string;
  username: string | null;
  full_name: string | null;
  email: string | null;
  bio: string | null;
  avatar_url: string | null;
  role: string | null;
  experience_points: number | null;
  learning_streak: number | null;
  joined_at: string | null;
  updated_at: string | null;
}

/**
 * Creates a user profile in Firebase Firestore
 */
export const createUserProfile = async (user: FirebaseUser, role: string = 'learner'): Promise<UserProfile> => {
  try {
    return await createFirebaseProfile(user, role);
  } catch (error) {
    console.error('Profile creation failed:', error);
    throw new Error(`Profile creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Retrieves a user profile by user_id
 */
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    return await getFirebaseProfile(userId);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

/**
 * Logs registration errors for debugging
 */
export const logRegistrationError = (error: Error | unknown, userEmail: string, context?: string) => {
  console.error('Registration Error:', {
    error: error instanceof Error ? error.message : error,
    email: userEmail,
    context: context || 'registration',
    timestamp: new Date().toISOString(),
  });
};