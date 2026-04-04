// Firebase Firestore Database Setup Script
// Run this in the Firebase console or using Firebase CLI

import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  writeBatch,
  getDoc,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Your Firebase configuration (same as in utils/firebase.ts)
const firebaseConfig = {
  apiKey: "AIzaSyDfhPXbPqOPcHRAdQdnL7FeaHlyGv4GNGU",
  authDomain: "thehelloworld-v1.firebaseapp.com",
  projectId: "thehelloworld-v1",
  storageBucket: "thehelloworld-v1.firebasestorage.app",
  messagingSenderId: "950519603054",
  appId: "1:950519603054:web:4cce0db9f577aad5056b7f",
  measurementId: "G-RPWYNN01Q6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Function to set up Firestore collections and indexes
export const setupFirestoreDatabase = async () => {
  console.log('🔥 Setting up Firebase Firestore database...');

  try {
    // 1. Create sample user_roles collection structure
    // Note: Firestore doesn't require explicit collection creation
    // Collections are created automatically when documents are added
    
    // Example: Create a sample user role document
    const sampleUserRole = {
      role: 'teacher', // or 'learner'
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // 2. Create sample users collection structure
    const sampleUser = {
      uid: 'sample_user_id',
      email: 'teacher@example.com',
      full_name: 'Sample Teacher',
      role: 'teacher',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // Additional fields from UserProfile interface
      display_name: 'Sample Teacher',
      photo_url: null,
      email_verified: true,
      last_sign_in_at: new Date().toISOString(),
      // Learning progress fields
      current_level: 1,
      total_experience: 0,
      completed_quests: [],
      current_roadmap: null,
      achievements: [],
      learning_preferences: {
        difficulty: 'beginner',
        interests: ['web-development', 'react'],
        learning_style: 'visual'
      }
    };

    // 3. Create sample teacher_students collection structure
    const sampleTeacherStudent = {
      teacher_id: 'teacher_uid',
      student_id: 'student_uid',
      created_at: new Date().toISOString(),
      status: 'active', // or 'inactive'
      // Additional tracking fields
      assigned_date: new Date().toISOString(),
      last_activity: new Date().toISOString(),
      progress_summary: {
        completed_quests: 0,
        current_level: 1,
        total_experience: 0
      }
    };

    console.log('✅ Database structure defined:');
    console.log('   - users collection: User profiles and preferences');
    console.log('   - user_roles collection: Role assignments (teacher/learner)');
    console.log('   - teacher_students collection: Teacher-student relationships');
    
    console.log('\n📝 Firestore Security Rules Needed:');
    console.log(`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can read their own role
    match /user_roles/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Teachers can read their students, students can read their teachers
    match /teacher_students/{docId} {
      allow read: if request.auth != null && 
        (resource.data.teacher_id == request.auth.uid || 
         resource.data.student_id == request.auth.uid);
      allow write: if request.auth != null && 
        (resource.data.teacher_id == request.auth.uid || 
         resource.data.student_id == request.auth.uid);
    }
  }
}`);

    console.log('\n🔍 Firestore Indexes Needed:');
    console.log('1. teacher_students collection:');
    console.log('   - teacher_id (Ascending)');
    console.log('   - student_id (Ascending)');
    console.log('   - created_at (Descending)');
    
    console.log('\n2. users collection:');
    console.log('   - role (Ascending) - for filtering teachers/students');
    console.log('   - created_at (Descending) - for sorting');
    
    console.log('\n3. user_roles collection:');
    console.log('   - role (Ascending) - for filtering by role');
    console.log('   - created_at (Descending)');

    console.log('\n🚀 Database setup completed!');
    console.log('Next steps:');
    console.log('1. Deploy security rules to Firebase');
    console.log('2. Create indexes in Firebase Console');
    console.log('3. Test with user registration/login');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
  }
};

// Function to create initial sample data (optional)
export const createSampleData = async () => {
  console.log('📝 Creating sample data...');

  try {
    // Create sample teacher
    const teacherRef = doc(db, 'users', 'sample_teacher_uid');
    await setDoc(teacherRef, {
      uid: 'sample_teacher_uid',
      email: 'teacher@example.com',
      full_name: 'Sample Teacher',
      role: 'teacher',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      display_name: 'Sample Teacher',
      photo_url: null,
      email_verified: true,
      last_sign_in_at: new Date().toISOString(),
      current_level: 5,
      total_experience: 1000,
      completed_quests: ['html-basics', 'css-fundamentals', 'js-intro'],
      current_roadmap: 'full-stack-development',
      achievements: ['first-quest', 'week-streak'],
      learning_preferences: {
        difficulty: 'intermediate',
        interests: ['web-development', 'react', 'nodejs'],
        learning_style: 'hands-on'
      }
    });

    // Create teacher role
    const teacherRoleRef = doc(db, 'user_roles', 'sample_teacher_uid');
    await setDoc(teacherRoleRef, {
      role: 'teacher',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    // Create sample student
    const studentRef = doc(db, 'users', 'sample_student_uid');
    await setDoc(studentRef, {
      uid: 'sample_student_uid',
      email: 'student@example.com',
      full_name: 'Sample Student',
      role: 'learner',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      display_name: 'Sample Student',
      photo_url: null,
      email_verified: true,
      last_sign_in_at: new Date().toISOString(),
      current_level: 1,
      total_experience: 50,
      completed_quests: ['html-basics'],
      current_roadmap: 'web-development-basics',
      achievements: ['first-quest'],
      learning_preferences: {
        difficulty: 'beginner',
        interests: ['web-development', 'html', 'css'],
        learning_style: 'visual'
      }
    });

    // Create student role
    const studentRoleRef = doc(db, 'user_roles', 'sample_student_uid');
    await setDoc(studentRoleRef, {
      role: 'learner',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    // Create teacher-student relationship
    const teacherStudentRef = doc(db, 'teacher_students', 'teacher_student_relationship_1');
    await setDoc(teacherStudentRef, {
      teacher_id: 'sample_teacher_uid',
      student_id: 'sample_student_uid',
      created_at: new Date().toISOString(),
      status: 'active',
      assigned_date: new Date().toISOString(),
      last_activity: new Date().toISOString(),
      progress_summary: {
        completed_quests: 1,
        current_level: 1,
        total_experience: 50
      }
    });

    console.log('✅ Sample data created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating sample data:', error);
  }
};

// Export functions for use
export { db, auth };
