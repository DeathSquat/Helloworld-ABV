// Test Firebase connection and permissions
import { auth, db, testConnection } from '@/integrations/firebase/client';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const testFirebaseConnection = async () => {
  console.log('🧪 Testing Firebase Connection...');
  
  try {
    // Test 1: Basic connection
    const connectionTest = await testConnection();
    if (!connectionTest) {
      throw new Error('Firebase connection failed');
    }
    
    // Test 2: Auth state
    const currentUser = auth.currentUser;
    console.log('👤 Current user:', currentUser?.email || 'Not logged in');
    
    // Test 3: Firestore permissions (only if user is logged in)
    if (currentUser) {
      const testDoc = await getDoc(doc(db, 'users', currentUser.uid));
      console.log('📄 Firestore read test:', testDoc.exists ? 'Success' : 'No document found');
    }
    
    console.log('✅ Firebase connection test completed successfully');
    return { success: true };
    
  } catch (error) {
    console.error('❌ Firebase test failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

// Test function to create a test user profile
export const createTestUserProfile = async (user: any, role: string = 'student') => {
  try {
    const profileData = {
      user_id: user.uid,
      email: user.email,
      full_name: user.displayName || user.email?.split('@')[0] || 'Test User',
      username: user.email?.split('@')[0] || `test_${user.uid.slice(0, 8)}`,
      role,
      bio: 'Test user for development',
      avatar_url: user.photoURL || null,
      
      // Initialize all stats to 0
      experience_points: 0,
      learning_streak: 0,
      total_xp: 0,
      total_hours_coded: 0,
      problems_solved: 0,
      skills_mastered: 0,
      current_week_xp: 0,
      last_active: new Date().toISOString(),
      
      // Progress tracking
      completed_lessons: 0,
      completed_projects: 0,
      completed_quizzes: 0,
      
      // Timestamps
      joined_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      
      // Preferences
      theme: 'system',
      email_notifications: true,
      
      // Skills progress
      skills_progress: {
        python: { level: 'Beginner', progress: 0, xp: 0, last_practiced: null },
        javascript: { level: 'Beginner', progress: 0, xp: 0, last_practiced: null },
        java: { level: 'Beginner', progress: 0, xp: 0, last_practiced: null },
      },
    };

    await setDoc(doc(db, 'users', user.uid), profileData);
    
    // Also create scores document
    const scoresData = {
      user_id: user.uid,
      total_xp: 0,
      experience_points: 0,
      current_week_xp: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    await setDoc(doc(db, 'scores', user.uid), scoresData);
    
    console.log('✅ Test user profile created successfully');
    return { success: true };
    
  } catch (error) {
    console.error('❌ Failed to create test user profile:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};
