// Firebase client configuration
import { auth, db } from '@/utils/firebase';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  UserCredential
} from 'firebase/auth';
import { 
  doc,
  setDoc,
  getDoc,
  updateDoc,
  increment,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  deleteDoc,
  Timestamp
} from 'firebase/firestore';

// User profile interface - Only essential user details
export interface UserProfile {
  // Basic info
  id: string;
  user_id: string;
  username: string | null;
  full_name: string | null;
  email: string | null;
  bio: string | null;
  avatar_url: string | null;
  role: string | null;
  
  // Basic stats
  experience_points: number;
  learning_streak: number;
  total_xp: number;
  
  // Timestamps
  joined_at: string | null;
  updated_at: string | null;
  
  // Preferences
  theme: 'light' | 'dark' | 'system';
  email_notifications: boolean;
}

// Progress tracking interface
export interface UserProgress {
  id: string;
  user_id: string;
  
  // Overall progress
  completed_lessons: number;
  completed_projects: number;
  completed_quizzes: number;
  problems_solved: number;
  skills_mastered: number;
  total_hours_coded: number;
  current_week_xp: number;
  last_active: string | null;
  
  // Skills progress
  skills_progress: Record<string, {
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    progress: number;
    xp: number;
    last_practiced: string | null;
    lessons_completed: number;
    projects_completed: number;
    quiz_scores: number[];
  }>;
  
  // Learning paths progress
  learning_paths: Record<string, {
    path_id: string;
    progress: number;
    completed_modules: string[];
    current_module: string | null;
    started_at: string;
    last_accessed: string;
  }>;
  
  // Daily activity
  daily_activity: Record<string, {
    date: string;
    xp_earned: number;
    time_spent: number;
    lessons_completed: number;
    problems_solved: number;
  }>;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

// Auth functions
export const signInWithEmail = (email: string, password: string) => 
  signInWithEmailAndPassword(auth, email, password);
export const signUpWithEmail = (email: string, password: string) => 
  createUserWithEmailAndPassword(auth, email, password);
export const signOut = () => firebaseSignOut(auth);
export const onAuthChange = (callback: (user: FirebaseUser | null) => void) => 
  onAuthStateChanged(auth, callback);

// User profile functions
export const createUserProfile = async (user: FirebaseUser, role: string = 'student'): Promise<UserProfile> => {
  const now = new Date().toISOString();

  const profileData: Omit<UserProfile, 'id'> = {
    // Basic info
    user_id: user.uid,
    email: user.email,
    full_name: user.displayName || user.email?.split('@')[0] || 'New User',
    username: user.email?.split('@')[0] || `user_${user.uid.slice(0, 8)}`,
    role,
    bio: 'Hello! I\'m new to the platform.',
    avatar_url: user.photoURL || null,
    
    // Basic stats
    experience_points: 0,
    learning_streak: 0,
    total_xp: 0,
    
    // Timestamps
    joined_at: now,
    updated_at: now,
    
    // Preferences
    theme: 'system',
    email_notifications: true,
  };

  const userRef = doc(db, 'users', user.uid);
  await setDoc(userRef, profileData);

  // Also create initial progress record
  await createUserProgress(user.uid);

  return {
    id: user.uid,
    ...profileData
  };
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    return null;
  }

  return {
    id: userDoc.id,
    ...userDoc.data()
  } as UserProfile;
};

export const updateUserProfile = async (userId: string, data: Partial<UserProfile>): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    ...data,
    updated_at: new Date().toISOString()
  });
};

export interface UserScores {
  user_id: string;
  total_xp: number;
  experience_points: number;
  current_week_xp: number;
  updated_at: string;
  created_at: string;
}

export const ensureUserScores = async (user: FirebaseUser): Promise<UserScores> => {
  const now = new Date().toISOString();
  const scoreRef = doc(db, 'scores', user.uid);
  const scoreDoc = await getDoc(scoreRef);

  if (scoreDoc.exists()) {
    return { user_id: user.uid, ...scoreDoc.data() } as UserScores;
  }

  const data: UserScores = {
    user_id: user.uid,
    total_xp: 0,
    experience_points: 0,
    current_week_xp: 0,
    created_at: now,
    updated_at: now,
  };
  await setDoc(scoreRef, data);
  return data;
};

export interface AchievementEarned {
  achievement_id: string;
  title: string;
  description: string;
  earned_at: string;
}

export const getUserAchievements = async (userId: string): Promise<AchievementEarned[]> => {
  const earnedRef = collection(db, 'achievements', userId, 'earned');
  const snapshot = await getDocs(earnedRef);
  return snapshot.docs.map((d) => d.data() as AchievementEarned);
};

export const awardAchievement = async (userId: string, achievement: AchievementEarned): Promise<void> => {
  const earnedRef = doc(db, 'achievements', userId, 'earned', achievement.achievement_id);
  await setDoc(earnedRef, achievement, { merge: true });
};

export const addRecentEvent = async (userId: string, event: { type: string; message: string; meta?: Record<string, unknown> }): Promise<void> => {
  const now = new Date().toISOString();
  const eventsRef = collection(db, 'recent', userId, 'events');
  await addDoc(eventsRef, {
    ...event,
    created_at: now,
  });
};

export const ensureUserProfile = async (user: FirebaseUser, role: string = 'student'): Promise<UserProfile> => {
  let profile = await getUserProfile(user.uid);
  if (!profile) {
    profile = await createUserProfile(user, role);
  }

  await ensureUserScores(user);
  await ensureUserProgress(user.uid);
  return profile;
};

// Progress management functions
export const createUserProgress = async (userId: string): Promise<UserProgress> => {
  const now = new Date().toISOString();
  
  const defaultSkills: UserProgress['skills_progress'] = {
    python: { 
      level: 'Beginner', 
      progress: 0, 
      xp: 0, 
      last_practiced: null,
      lessons_completed: 0,
      projects_completed: 0,
      quiz_scores: []
    },
    javascript: { 
      level: 'Beginner', 
      progress: 0, 
      xp: 0, 
      last_practiced: null,
      lessons_completed: 0,
      projects_completed: 0,
      quiz_scores: []
    },
    java: { 
      level: 'Beginner', 
      progress: 0, 
      xp: 0, 
      last_practiced: null,
      lessons_completed: 0,
      projects_completed: 0,
      quiz_scores: []
    },
  };

  const progressData: Omit<UserProgress, 'id'> = {
    user_id: userId,
    
    // Overall progress
    completed_lessons: 0,
    completed_projects: 0,
    completed_quizzes: 0,
    problems_solved: 0,
    skills_mastered: 0,
    total_hours_coded: 0,
    current_week_xp: 0,
    last_active: now,
    
    // Skills progress
    skills_progress: defaultSkills,
    
    // Learning paths (empty initially)
    learning_paths: {},
    
    // Daily activity (empty initially)
    daily_activity: {},
    
    // Timestamps
    created_at: now,
    updated_at: now,
  };

  const progressRef = doc(db, 'progress', userId);
  await setDoc(progressRef, progressData);

  return {
    id: userId,
    ...progressData
  };
};

export const getUserProgress = async (userId: string): Promise<UserProgress | null> => {
  const progressRef = doc(db, 'progress', userId);
  const progressDoc = await getDoc(progressRef);

  if (!progressDoc.exists()) {
    return null;
  }

  return {
    id: progressDoc.id,
    ...progressDoc.data()
  } as UserProgress;
};

export const ensureUserProgress = async (userId: string): Promise<UserProgress> => {
  let progress = await getUserProgress(userId);
  if (!progress) {
    progress = await createUserProgress(userId);
  }
  return progress;
};

export const updateUserProgress = async (userId: string, data: Partial<UserProgress>): Promise<void> => {
  const progressRef = doc(db, 'progress', userId);
  await updateDoc(progressRef, {
    ...data,
    updated_at: new Date().toISOString()
  });
};

export const updateSkillProgress = async (
  userId: string, 
  skill: string, 
  progressData: Partial<UserProgress['skills_progress'][string]>
): Promise<void> => {
  const progressRef = doc(db, 'progress', userId);
  const skillPath = `skills_progress.${skill}`;
  
  await updateDoc(progressRef, {
    [skillPath]: progressData,
    updated_at: new Date().toISOString()
  });
};

export const addDailyActivity = async (
  userId: string, 
  activity: {
    xp_earned: number;
    time_spent: number;
    lessons_completed: number;
    problems_solved: number;
  }
): Promise<void> => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  const progressRef = doc(db, 'progress', userId);
  
  const activityData = {
    date: today,
    ...activity
  };
  
  await updateDoc(progressRef, {
    [`daily_activity.${today}`]: activityData,
    last_active: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
};

export interface LeaderboardUser {
  id: string;
  name: string;
  points: number;
  streak: number;
}

export const getLeaderboardTopUsers = async (max: number = 10): Promise<LeaderboardUser[]> => {
  const scoresRef = collection(db, 'scores');
  const q = query(scoresRef, orderBy('total_xp', 'desc'), limit(max));
  const snapshot = await getDocs(q);

  const rows = await Promise.all(
    snapshot.docs.map(async (scoreDoc) => {
      const score = scoreDoc.data() as Partial<UserScores>;
      const userId = scoreDoc.id;
      const profile = await getUserProfile(userId);
      const name = profile?.full_name || profile?.username || 'User';

      return {
        id: userId,
        name,
        points: Number(score.total_xp ?? 0),
        streak: Number(profile?.learning_streak ?? 0),
      };
    })
  );

  return rows;
};

export interface MathGameScore {
  bestScore: number;
  updated_at: string;
}

export const getMathGameScores = async (userId: string): Promise<Record<string, MathGameScore>> => {
  const scoresRef = collection(db, 'scores', userId, 'math_game_scores');
  const snapshot = await getDocs(scoresRef);
  const result: Record<string, MathGameScore> = {};

  snapshot.docs.forEach((d) => {
    const data = d.data() as Partial<MathGameScore>;
    result[d.id] = {
      bestScore: Number(data.bestScore ?? 0),
      updated_at: String(data.updated_at ?? new Date().toISOString()),
    };
  });

  return result;
};

export const upsertMathGameBestScore = async (userId: string, gameId: string, score: number): Promise<void> => {
  const scoreRef = doc(db, 'scores', userId, 'math_game_scores', gameId);
  const existing = await getDoc(scoreRef);
  const now = new Date().toISOString();

  if (!existing.exists()) {
    await setDoc(scoreRef, { bestScore: score, updated_at: now });
    return;
  }

  const prev = existing.data() as Partial<MathGameScore>;
  const prevBest = Number(prev.bestScore ?? 0);
  if (score > prevBest) {
    await updateDoc(scoreRef, { bestScore: score, updated_at: now });
  }
};

export const addUserXp = async (userId: string, xpDelta: number): Promise<void> => {
  const now = new Date().toISOString();
  const userRef = doc(db, 'users', userId);
  const scoresRef = doc(db, 'scores', userId);

  await setDoc(scoresRef, {
    user_id: userId,
    experience_points: increment(xpDelta),
    total_xp: increment(xpDelta),
    current_week_xp: increment(xpDelta),
    updated_at: now,
  }, { merge: true });

  await updateDoc(userRef, {
    experience_points: increment(xpDelta),
    total_xp: increment(xpDelta),
    current_week_xp: increment(xpDelta),
    updated_at: now,
  });
};

// Admin functions
export const getAllUsers = async (): Promise<UserProfile[]> => {
  const usersRef = collection(db, 'users');
  const snapshot = await getDocs(usersRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
};

export const updateUserRole = async (userId: string, newRole: string): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    role: newRole,
    updated_at: new Date().toISOString()
  });
};

export const getUserStats = async () => {
  const usersRef = collection(db, 'users');
  const snapshot = await getDocs(usersRef);
  const users = snapshot.docs.map(doc => doc.data() as UserProfile);
  
  const stats = {
    totalUsers: users.length,
    students: users.filter(u => u.role === 'student').length,
    teachers: users.filter(u => u.role === 'teacher').length,
    admins: users.filter(u => u.role === 'admin').length,
    newUsersThisMonth: users.filter(u => {
      const joinedDate = new Date(u.joined_at || '');
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      return joinedDate > oneMonthAgo;
    }).length
  };
  
  return stats;
};

export const deleteUser = async (userId: string): Promise<void> => {
  // Delete user profile
  const userRef = doc(db, 'users', userId);
  await deleteDoc(userRef);
  
  // Delete user scores
  const scoresRef = doc(db, 'scores', userId);
  await deleteDoc(scoresRef);
  
  // Note: In a real implementation, you would also need to:
  // 1. Delete user authentication (requires admin SDK)
  // 2. Clean up any other user-related data
  // 3. Handle cascading deletes for related collections
};

// Roadmap and Course functions for admin panel
export interface Roadmap {
  id: string;
  title: string;
  description: string;
  phases: LearningPhase[];
  created_at: string;
  updated_at: string;
  is_active: boolean;
  
  // Enhanced specifications
  category: string; // e.g., 'Web Development', 'Data Science', 'Mobile Development'
  difficulty_level: 'Beginner' | 'Intermediate' | 'Advanced';
  estimated_duration: string; // e.g., '3 months', '12 weeks'
  prerequisites: string[]; // Required skills or knowledge
  learning_objectives: string[]; // What students will learn
  target_audience: string[]; // Who this roadmap is for
  tags: string[]; // Searchable tags
  thumbnail_url?: string; // Roadmap thumbnail
  instructor_name?: string; // Instructor or creator name
  instructor_bio?: string; // Instructor background
  language: string; // Primary language of content
  rating?: number; // Average rating (0-5)
  enrollment_count?: number; // Number of students enrolled
  completion_rate?: number; // Percentage of students who complete
}

export interface LearningPhase {
  id: string;
  title: string;
  description: string;
  order: number;
  youtube_videos: YouTubeVideo[];
  coursera_links: CourseraLink[];
  ide_projects: IDEProject[];
  estimated_duration: string;
  prerequisites?: string[]; // Phase IDs that must be completed first
  
  // Enhanced specifications
  learning_objectives: string[]; // Specific objectives for this phase
  skills_gained: string[]; // Skills students will acquire
  deliverables: string[]; // What students will create/complete
  assessment_criteria?: string; // How success is measured
  resources_summary?: string; // Summary of all resources
  phase_type: 'learning' | 'project' | 'assessment' | 'review'; // Type of phase
}

export interface YouTubeVideo {
  id: string;
  title: string;
  video_id: string; // YouTube video ID
  description: string;
  duration: string;
  thumbnail_url: string;
  order: number;
}

export interface CourseraLink {
  id: string;
  title: string;
  url: string;
  description: string;
  provider: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  order: number;
}

export interface IDEProject {
  id: string;
  title: string;
  description: string;
  language: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  starter_code: string;
  solution_code: string;
  instructions: string;
  order: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  // Enhanced specifications
  category: string;
  difficulty_level: 'Beginner' | 'Intermediate' | 'Advanced';
  estimated_duration: string;
  prerequisites: string[];
  learning_objectives: string[];
  target_audience: string[];
  tags: string[];
  thumbnail_url: string | null;
  instructor_name: string | null;
  instructor_bio: string | null;
  language: string;
  rating: number;
  enrollment_count: number;
  completion_rate: number;
  
  // Course content (all accessible at once)
  modules: CourseModule[];
  
  // Additional course materials
  documents: string[]; // URLs to uploaded documents
  youtubeLinks: string[]; // YouTube video links
  
  // Metadata
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  order: number;
  youtube_videos: YouTubeVideo[];
  coursera_links: CourseraLink[];
  // Removed ide_projects as requested
  estimated_duration: string;
  learning_objectives: string[];
  skills_gained: string[];
  deliverables: string[];
  assessment_criteria: string[];
  resources_summary: string;
  module_type: 'video' | 'reading' | 'mixed';
}

// User progress tracking for phased roadmaps
export interface UserRoadmapProgress {
  id: string;
  user_id: string;
  roadmap_id: string;
  completed_phases: string[]; // Phase IDs
  current_phase: string | null; // Currently active phase ID
  started_at: string;
  last_accessed: string;
  completed_at: string | null;
}

export interface UserPhaseProgress {
  id: string;
  user_id: string;
  roadmap_id: string;
  phase_id: string;
  completed_videos: string[];
  completed_courses: string[];
  completed_projects: string[];
  started_at: string;
  completed_at: string | null;
}

export const createRoadmap = async (roadmapData: Omit<Roadmap, 'id' | 'created_at' | 'updated_at'>): Promise<Roadmap> => {
  const now = new Date().toISOString();
  const roadmapWithId = {
    ...roadmapData,
    id: Date.now().toString(),
    created_at: now,
    updated_at: now,
    is_active: true
  };
  
  const roadmapRef = doc(db, 'roadmaps', roadmapWithId.id);
  await setDoc(roadmapRef, roadmapWithId);
  
  return roadmapWithId;
};

export const updateRoadmap = async (id: string, roadmapData: Partial<Omit<Roadmap, 'id' | 'created_at'>>): Promise<Roadmap> => {
  const updateData = {
    ...roadmapData,
    updated_at: new Date().toISOString()
  };
  
  const roadmapRef = doc(db, 'roadmaps', id);
  await updateDoc(roadmapRef, updateData);
  
  // Return updated roadmap
  const updatedDoc = await getDoc(roadmapRef);
  return { id: updatedDoc.id, ...updatedDoc.data() } as Roadmap;
};

export const deleteRoadmap = async (id: string): Promise<void> => {
  const roadmapRef = doc(db, 'roadmaps', id);
  await deleteDoc(roadmapRef);
};

export const getAllRoadmaps = async (): Promise<Roadmap[]> => {
  const roadmapsRef = collection(db, 'roadmaps');
  const snapshot = await getDocs(roadmapsRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Roadmap));
};

export const createCourse = async (courseData: Omit<Course, 'id' | 'created_at' | 'updated_at'>): Promise<Course> => {
  const now = new Date().toISOString();
  const courseWithId = {
    ...courseData,
    id: Date.now().toString(),
    created_at: now,
    updated_at: now,
    is_active: courseData.is_active !== false
  };
  
  const courseRef = doc(db, 'courses', courseWithId.id);
  await setDoc(courseRef, courseWithId);
  
  return courseWithId;
};

export const getAllCourses = async (): Promise<Course[]> => {
  const coursesRef = collection(db, 'courses');
  const q = query(coursesRef, where('is_active', '==', true));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
};

export const deleteCourse = async (courseId: string): Promise<void> => {
  const courseRef = doc(db, 'courses', courseId);
  await deleteDoc(courseRef);
};

// Progress tracking functions for phased roadmaps
export const getUserRoadmapProgress = async (userId: string, roadmapId: string): Promise<UserRoadmapProgress | null> => {
  const progressRef = doc(db, 'user_roadmap_progress', `${userId}_${roadmapId}`);
  const progressDoc = await getDoc(progressRef);
  
  if (!progressDoc.exists()) {
    return null;
  }
  
  return { id: progressDoc.id, ...progressDoc.data() } as UserRoadmapProgress;
};

export const createUserRoadmapProgress = async (userId: string, roadmapId: string): Promise<UserRoadmapProgress> => {
  const now = new Date().toISOString();
  const progressData: Omit<UserRoadmapProgress, 'id'> = {
    user_id: userId,
    roadmap_id: roadmapId,
    completed_phases: [],
    current_phase: null,
    started_at: now,
    last_accessed: now,
    completed_at: null
  };
  
  const progressRef = doc(db, 'user_roadmap_progress', `${userId}_${roadmapId}`);
  await setDoc(progressRef, progressData);
  
  return { id: progressRef.id, ...progressData };
};

export const updateUserRoadmapProgress = async (userId: string, roadmapId: string, data: Partial<UserRoadmapProgress>): Promise<void> => {
  const progressRef = doc(db, 'user_roadmap_progress', `${userId}_${roadmapId}`);
  await updateDoc(progressRef, {
    ...data,
    last_accessed: new Date().toISOString()
  });
};

export const getUserPhaseProgress = async (userId: string, roadmapId: string, phaseId: string): Promise<UserPhaseProgress | null> => {
  const progressRef = doc(db, 'user_phase_progress', `${userId}_${roadmapId}_${phaseId}`);
  const progressDoc = await getDoc(progressRef);
  
  if (!progressDoc.exists()) {
    return null;
  }
  
  return { id: progressDoc.id, ...progressDoc.data() } as UserPhaseProgress;
};

export const createUserPhaseProgress = async (userId: string, roadmapId: string, phaseId: string): Promise<UserPhaseProgress> => {
  const now = new Date().toISOString();
  const progressData: Omit<UserPhaseProgress, 'id'> = {
    user_id: userId,
    roadmap_id: roadmapId,
    phase_id: phaseId,
    completed_videos: [],
    completed_courses: [],
    completed_projects: [],
    started_at: now,
    completed_at: null
  };
  
  const progressRef = doc(db, 'user_phase_progress', `${userId}_${roadmapId}_${phaseId}`);
  await setDoc(progressRef, progressData);
  
  return { id: progressRef.id, ...progressData };
};

export const updateUserPhaseProgress = async (userId: string, roadmapId: string, phaseId: string, data: Partial<UserPhaseProgress>): Promise<void> => {
  const progressRef = doc(db, 'user_phase_progress', `${userId}_${roadmapId}_${phaseId}`);
  await updateDoc(progressRef, {
    ...data,
    completed_at: data.completed_videos?.length && data.completed_courses?.length && data.completed_projects?.length ? new Date().toISOString() : null
  });
};

export const completePhaseContent = async (
  userId: string, 
  roadmapId: string, 
  phaseId: string, 
  contentType: 'video' | 'course' | 'project', 
  contentId: string
): Promise<void> => {
  const phaseProgress = await getUserPhaseProgress(userId, roadmapId, phaseId);
  
  if (!phaseProgress) {
    await createUserPhaseProgress(userId, roadmapId, phaseId);
  }
  
  const updateData: Partial<UserPhaseProgress> = {};
  
  switch (contentType) {
    case 'video':
      updateData.completed_videos = [...new Set([...(phaseProgress?.completed_videos || []), contentId])];
      break;
    case 'course':
      updateData.completed_courses = [...new Set([...(phaseProgress?.completed_courses || []), contentId])];
      break;
    case 'project':
      updateData.completed_projects = [...new Set([...(phaseProgress?.completed_projects || []), contentId])];
      break;
  }
  
  await updateUserPhaseProgress(userId, roadmapId, phaseId, updateData);
  
  // Check if phase is complete and update roadmap progress
  const updatedPhaseProgress = await getUserPhaseProgress(userId, roadmapId, phaseId);
  if (updatedPhaseProgress) {
    const roadmapProgress = await getUserRoadmapProgress(userId, roadmapId);
    if (!roadmapProgress) {
      await createUserRoadmapProgress(userId, roadmapId);
    }
    
    // Get roadmap to check phase completion
    const roadmaps = await getAllRoadmaps();
    const roadmap = roadmaps.find(r => r.id === roadmapId);
    const phase = roadmap?.phases.find(p => p.id === phaseId);
    
    if (phase && 
        updatedPhaseProgress.completed_videos.length === phase.youtube_videos.length &&
        updatedPhaseProgress.completed_courses.length === phase.coursera_links.length &&
        updatedPhaseProgress.completed_projects.length === phase.ide_projects.length) {
      
      // Phase is complete, update roadmap progress
      const currentProgress = await getUserRoadmapProgress(userId, roadmapId);
      const completedPhases = [...new Set([...(currentProgress?.completed_phases || []), phaseId])];
      
      // Find next phase
      const nextPhase = roadmap?.phases.find(p => 
        p.order === phase.order + 1 && 
        (!p.prerequisites || p.prerequisites.every(prereq => completedPhases.includes(prereq)))
      );
      
      await updateUserRoadmapProgress(userId, roadmapId, {
        completed_phases: completedPhases,
        current_phase: nextPhase?.id || null,
        completed_at: completedPhases.length === roadmap?.phases.length ? new Date().toISOString() : null
      });
    }
  }
};

export const getPhaseUnlockStatus = async (userId: string, roadmapId: string, phaseId: string): Promise<{
  isUnlocked: boolean;
  isCompleted: boolean;
  isInProgress: boolean;
}> => {
  const roadmapProgress = await getUserRoadmapProgress(userId, roadmapId);
  const roadmaps = await getAllRoadmaps();
  const roadmap = roadmaps.find(r => r.id === roadmapId);
  const phase = roadmap?.phases.find(p => p.id === phaseId);
  
  if (!roadmap || !phase) {
    return { isUnlocked: false, isCompleted: false, isInProgress: false };
  }
  
  const completedPhases = roadmapProgress?.completed_phases || [];
  const isCompleted = completedPhases.includes(phaseId);
  const isInProgress = roadmapProgress?.current_phase === phaseId;
  
  // Enforce sequential phase completion
  // First phase is always unlocked
  const isFirstPhase = phase.order === 0;
  
  // For subsequent phases, check if the previous phase is completed
  const previousPhase = roadmap.phases.find(p => p.order === phase.order - 1);
  const previousPhaseCompleted = previousPhase ? completedPhases.includes(previousPhase.id) : true;
  
  // Phase is unlocked if it's the first phase OR the previous phase is completed
  const isUnlocked = isFirstPhase || previousPhaseCompleted;
  
  return { isUnlocked, isCompleted, isInProgress };
};

// Utility functions
export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

export const testConnection = async (): Promise<boolean> => {
  try {
    console.log('🔄 Testing Firebase connection...');
    
    // Test auth
    const user = auth.currentUser;
    console.log('✅ Firebase connection successful!');
    return true;
  } catch (err) {
    console.error('❌ Firebase connection test error:', err);
    return false;
  }
};

// User progress tracking for courses (all modules accessible at once)
export interface UserCourseProgress {
  id: string;
  user_id: string;
  course_id: string;
  started_at: string;
  completed_at: string | null;
  last_accessed: string;
  
  // Module progress
  completed_modules: string[];
  module_progress: Record<string, {
    module_id: string;
    completed_videos: string[];
    completed_courses: string[];
    started_at: string;
    completed_at: string | null;
    time_spent: number; // minutes
  }>;
  
  // Overall course stats
  total_videos_watched: number;
  total_courses_completed: number;
  total_time_spent: number; // minutes
  progress_percentage: number; // 0-100
  
  // Metadata
  created_at: string;
  updated_at: string;
}

// Course progress tracking functions
export const getUserCourseProgress = async (userId: string, courseId: string): Promise<UserCourseProgress | null> => {
  const progressRef = doc(db, 'user_course_progress', `${userId}_${courseId}`);
  const progressDoc = await getDoc(progressRef);
  
  if (!progressDoc.exists()) {
    return null;
  }
  
  return { id: progressDoc.id, ...progressDoc.data() } as UserCourseProgress;
};

export const createUserCourseProgress = async (userId: string, courseId: string): Promise<UserCourseProgress> => {
  const now = new Date().toISOString();
  
  const progressData: Omit<UserCourseProgress, 'id'> = {
    user_id: userId,
    course_id: courseId,
    started_at: now,
    completed_at: null,
    last_accessed: now,
    
    // Module progress (empty initially)
    completed_modules: [],
    module_progress: {},
    
    // Overall stats
    total_videos_watched: 0,
    total_courses_completed: 0,
    total_time_spent: 0,
    progress_percentage: 0,
    
    // Metadata
    created_at: now,
    updated_at: now,
  };

  const progressRef = doc(db, 'user_course_progress', `${userId}_${courseId}`);
  await setDoc(progressRef, progressData);

  return { id: progressRef.id, ...progressData };
};

export const updateUserCourseProgress = async (userId: string, courseId: string, data: Partial<UserCourseProgress>): Promise<void> => {
  const progressRef = doc(db, 'user_course_progress', `${userId}_${courseId}`);
  await updateDoc(progressRef, {
    ...data,
    last_accessed: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
};

export const completeCourseModule = async (
  userId: string, 
  courseId: string, 
  moduleId: string,
  contentType: 'video' | 'course', 
  contentId: string,
  timeSpent: number = 0
): Promise<void> => {
  const courseProgress = await getUserCourseProgress(userId, courseId);
  
  if (!courseProgress) {
    await createUserCourseProgress(userId, courseId);
  }
  
  // Update module progress
  const moduleProgress = courseProgress?.module_progress[moduleId] || {
    module_id: moduleId,
    completed_videos: [],
    completed_courses: [],
    started_at: new Date().toISOString(),
    completed_at: null,
    time_spent: 0
  };
  
  // Add completed content
  switch (contentType) {
    case 'video':
      moduleProgress.completed_videos = [...new Set([...moduleProgress.completed_videos, contentId])];
      break;
    case 'course':
      moduleProgress.completed_courses = [...new Set([...moduleProgress.completed_courses, contentId])];
      break;
  }
  
  moduleProgress.time_spent += timeSpent;
  
  // Check if module is complete
  const courses = await getAllCourses();
  const course = courses.find(c => c.id === courseId);
  const module = course?.modules.find(m => m.id === moduleId);
  
  if (module && 
      moduleProgress.completed_videos.length === module.youtube_videos.length &&
      moduleProgress.completed_courses.length === module.coursera_links.length) {
    moduleProgress.completed_at = new Date().toISOString();
  }
  
  // Update overall course progress
  const updatedCourseProgress = await getUserCourseProgress(userId, courseId);
  if (!updatedCourseProgress) return;
  
  const totalModules = course?.modules.length || 0;
  const completedModules = [...new Set([...(updatedCourseProgress.completed_modules || []), moduleId])];
  const allModuleProgress = { ...updatedCourseProgress.module_progress, [moduleId]: moduleProgress };
  
  // Calculate overall progress
  let totalVideos = 0, totalCourses = 0;
  let completedVideos = 0, completedCourses = 0;
  
  course?.modules.forEach(m => {
    totalVideos += m.youtube_videos.length;
    totalCourses += m.coursera_links.length;
    
    const progress = allModuleProgress[m.id];
    if (progress) {
      completedVideos += progress.completed_videos.length;
      completedCourses += progress.completed_courses.length;
    }
  });
  
  const totalContent = totalVideos + totalCourses;
  const completedContent = completedVideos + completedCourses;
  const progressPercentage = totalContent > 0 ? Math.round((completedContent / totalContent) * 100) : 0;
  
  await updateUserCourseProgress(userId, courseId, {
    completed_modules: completedModules,
    module_progress: allModuleProgress,
    total_videos_watched: completedVideos,
    total_courses_completed: completedCourses,
    total_time_spent: updatedCourseProgress.total_time_spent + timeSpent,
    progress_percentage: progressPercentage,
    completed_at: completedModules.length === totalModules ? new Date().toISOString() : null
  });
  
  // Add XP for course progress
  if (timeSpent > 0) {
    const xpEarned = Math.min(Math.floor(timeSpent / 10), 50); // 1 XP per 10 minutes, max 50 XP per session
    await addUserXp(userId, xpEarned);
  }
};

export const getCourseUnlockStatus = async (userId: string, courseId: string): Promise<{
  isEnrolled: boolean;
  isCompleted: boolean;
  progressPercentage: number;
}> => {
  const courseProgress = await getUserCourseProgress(userId, courseId);
  
  return {
    isEnrolled: !!courseProgress,
    isCompleted: courseProgress?.completed_at !== null,
    progressPercentage: courseProgress?.progress_percentage || 0
  };
};

export const enrollUserInCourse = async (userId: string, courseId: string): Promise<UserCourseProgress> => {
  const existingProgress = await getUserCourseProgress(userId, courseId);
  
  if (existingProgress) {
    return existingProgress;
  }
  
  return await createUserCourseProgress(userId, courseId);
};

export const getUserAllCoursesProgress = async (userId: string): Promise<UserCourseProgress[]> => {
  const progressRef = collection(db, 'user_course_progress');
  const q = query(progressRef, where('user_id', '==', userId));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserCourseProgress));
};

export const getFrequentCourses = async (limit: number = 6): Promise<Course[]> => {
  const coursesRef = collection(db, 'courses');
  const q = query(
    coursesRef, 
    where('is_active', '==', true)
  );
  const snapshot = await getDocs(q);
  
  // Sort by enrollment_count manually and limit
  const courses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
  return courses
    .sort((a, b) => (b.enrollment_count || 0) - (a.enrollment_count || 0))
    .slice(0, limit);
};

// Export auth and db instances
export { auth, db };
