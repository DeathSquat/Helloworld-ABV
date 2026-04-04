import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { 
  getAllUsers, 
  updateUserRole, 
  deleteUser, 
  getUserStats, 
  getAllRoadmaps,
  createRoadmap,
  updateRoadmap,
  deleteRoadmap,
  getAllCourses,
  createCourse,
  UserProfile,
  Roadmap,
  YouTubeVideo,
  CourseraLink,
  IDEProject
} from '@/integrations/firebase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Users, 
  Settings, 
  MapPin, 
  BookOpen, 
  Trash2, 
  Edit,
  Plus,
  BarChart3,
  UserCheck,
  UserX,
  GraduationCap,
  Trophy,
  Award,
  Target,
  TrendingUp
} from 'lucide-react';



const AdminPanel: React.FC = () => {
  const { userProfile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<UserProfile[]>([]);
  const [isCreateRoadmapOpen, setIsCreateRoadmapOpen] = useState(false);
  const [isCreateCourseOpen, setIsCreateCourseOpen] = useState(false);
  const [newRoadmap, setNewRoadmap] = useState({ 
    title: '', 
    description: '', 
    phases: [] as any[]
  });
  const [editingRoadmap, setEditingRoadmap] = useState<Roadmap | null>(null);
  const [newPhase, setNewPhase] = useState({ 
    title: '', 
    description: '', 
    estimated_duration: '',
    youtube_videos: [] as YouTubeVideo[],
    coursera_links: [] as CourseraLink[],
    ide_projects: [] as IDEProject[]
  });
  const [newVideo, setNewVideo] = useState({ title: '', video_id: '', description: '', duration: '', thumbnail_url: '' });
  const [newCoursera, setNewCoursera] = useState({ title: '', url: '', description: '', provider: '', duration: '', difficulty: 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced' });
  const [newIDEProject, setNewIDEProject] = useState({ title: '', description: '', language: '', difficulty: 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced', starter_code: '', solution_code: '', instructions: '' });
  const [newCourse, setNewCourse] = useState({ 
  title: '', 
  description: '', 
  duration: '', 
  difficulty: 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced',
  provider: '',
  url: '',
  topics: '',
  prerequisites: ''
});

  // Check if user is admin
  if (!userProfile || userProfile.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <UserX className="w-12 h-12 mx-auto text-red-500 mb-2" />
            <CardTitle className="text-2xl font-bold text-red-600">Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access the admin panel. This area is restricted to administrators only.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => window.location.href = '/dashboard'}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const loadData = async () => {
    try {
      const [usersData, statsData, roadmapsData, coursesData] = await Promise.all([
        getAllUsers(),
        getUserStats(),
        getAllRoadmaps(),
        getAllCourses()
      ]);
      setUsers(usersData);
      setStats(statsData);
      setRoadmaps(roadmapsData);
      setCourses(coursesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      // Mock implementation
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
    } catch (error) {
      console.error('Failed to update user role:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      // Mock implementation
      setUsers(users.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const handleCreateRoadmap = async () => {
    try {
      const roadmapData = {
        title: newRoadmap.title,
        description: newRoadmap.description,
        phases: newRoadmap.phases,
        category: 'Web Development', // Default category
        difficulty_level: 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced', // Default difficulty
        estimated_duration: '4 weeks', // Default duration
        prerequisites: [], // Empty prerequisites array
        learning_objectives: [], // Empty learning objectives array
        target_audience: ['Students'], // Default target audience
        tags: [], // Empty tags array
        thumbnail_url: null, // No thumbnail by default
        instructor_name: null, // No instructor name by default
        instructor_bio: null, // No instructor bio by default
        language: 'English', // Default language
        rating: 0, // Default rating
        enrollment_count: 0, // Default enrollment count
        completion_rate: 0, // Default completion rate
        is_active: true // Set roadmap as active
      };
      await createRoadmap(roadmapData);
      setNewRoadmap({ title: '', description: '', phases: [] });
      setIsCreateRoadmapOpen(false);
      await loadData();
    } catch (error) {
      console.error('Failed to create roadmap:', error);
    }
  };

  const handleUpdateRoadmap = async () => {
    if (!editingRoadmap) return;
    try {
      await updateRoadmap(editingRoadmap.id, {
        title: editingRoadmap.title,
        description: editingRoadmap.description,
        phases: editingRoadmap.phases,
        is_active: editingRoadmap.is_active
      });
      setEditingRoadmap(null);
      await loadData();
    } catch (error) {
      console.error('Failed to update roadmap:', error);
    }
  };

  const handleDeleteRoadmap = async (id: string) => {
    try {
      await deleteRoadmap(id);
      await loadData();
    } catch (error) {
      console.error('Failed to delete roadmap:', error);
    }
  };

  // Phase management functions
  const addPhase = () => {
    const phase: any = {
      id: Date.now().toString(),
      title: newPhase.title,
      description: newPhase.description,
      estimated_duration: newPhase.estimated_duration,
      order: newRoadmap.phases.length,
      youtube_videos: [...newPhase.youtube_videos],
      coursera_links: [...newPhase.coursera_links],
      ide_projects: [...newPhase.ide_projects]
    };
    setNewRoadmap({
      ...newRoadmap,
      phases: [...newRoadmap.phases, phase]
    });
    setNewPhase({ 
      title: '', 
      description: '', 
      estimated_duration: '',
      youtube_videos: [],
      coursera_links: [],
      ide_projects: []
    });
  };

  const removePhase = (index: number) => {
    setNewRoadmap({
      ...newRoadmap,
      phases: newRoadmap.phases.filter((_, i) => i !== index)
    });
  };

  const addYouTubeVideoToPhase = () => {
    // Extract video ID from URL
    let videoId = newVideo.video_id;
    let title = 'YouTube Video';
    let thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    
    // Handle different YouTube URL formats
    if (videoId.includes('youtube.com/watch?v=')) {
      videoId = videoId.split('v=')[1]?.split('&')[0] || videoId;
      title = `YouTube Video - ${videoId}`;
    } else if (videoId.includes('youtu.be/')) {
      videoId = videoId.split('youtu.be/')[1]?.split('?')[0] || videoId;
      title = `YouTube Video - ${videoId}`;
    } else if (!videoId.includes('http')) {
      // If it's just a video ID, use it directly
      title = `YouTube Video - ${videoId}`;
    }
    
    const video: YouTubeVideo = {
      id: Date.now().toString(),
      title: title,
      video_id: videoId,
      description: 'YouTube video resource for learning',
      duration: 'Auto-detected',
      thumbnail_url: thumbnail,
      order: newPhase.youtube_videos.length
    };
    setNewPhase({
      ...newPhase,
      youtube_videos: [...newPhase.youtube_videos, video]
    });
    setNewVideo({ title: '', video_id: '', description: '', duration: '', thumbnail_url: '' });
  };

  const addCourseraLinkToPhase = () => {
    const url = newCoursera.url;
    let title = 'Online Course';
    let provider = 'Unknown';
    
    // Extract provider and basic info from URL
    if (url.includes('coursera.org')) {
      provider = 'Coursera';
      title = 'Coursera Course';
    } else if (url.includes('edx.org')) {
      provider = 'edX';
      title = 'edX Course';
    } else if (url.includes('udemy.com')) {
      provider = 'Udemy';
      title = 'Udemy Course';
    } else if (url.includes('linkedin.com/learning')) {
      provider = 'LinkedIn Learning';
      title = 'LinkedIn Learning Course';
    } else {
      title = 'Online Course';
    }
    
    const coursera: CourseraLink = {
      id: Date.now().toString(),
      title: title,
      url: url,
      description: `Online course from ${provider}`,
      provider: provider,
      duration: 'Self-paced',
      difficulty: 'Intermediate',
      order: newPhase.coursera_links.length
    };
    setNewPhase({
      ...newPhase,
      coursera_links: [...newPhase.coursera_links, coursera]
    });
    setNewCoursera({ title: '', url: '', description: '', provider: '', duration: '', difficulty: 'Beginner' });
  };

  const addIDEProjectToPhase = () => {
    const project: IDEProject = {
      id: Date.now().toString(),
      ...newIDEProject,
      order: newPhase.ide_projects.length
    };
    setNewPhase({
      ...newPhase,
      ide_projects: [...newPhase.ide_projects, project]
    });
    setNewIDEProject({ title: '', description: '', language: '', difficulty: 'Beginner', starter_code: '', solution_code: '', instructions: '' });
  };

  const handleCreateCourse = async () => {
    try {
      const courseData = {
        title: newCourse.title,
        description: newCourse.description,
        category: 'Programming', // Default category
        difficulty_level: newCourse.difficulty,
        estimated_duration: newCourse.duration,
        prerequisites: newCourse.prerequisites ? newCourse.prerequisites.split(',').map(p => p.trim()) : [],
        learning_objectives: newCourse.topics ? newCourse.topics.split(',').map(t => t.trim()) : [],
        target_audience: ['Students'], // Default target audience
        tags: [], // Empty tags array
        thumbnail_url: null, // No thumbnail by default
        instructor_name: newCourse.provider || null,
        instructor_bio: null, // No instructor bio by default
        language: 'English', // Default language
        rating: 0, // Default rating
        enrollment_count: 0, // Default enrollment count
        completion_rate: 0, // Default completion rate
        modules: [], // Empty modules array
        documents: [], // Empty documents array
        youtubeLinks: [], // Empty YouTube links array
        url: newCourse.url,
        is_active: true // Set course as active
      };
      await createCourse(courseData);
      setNewCourse({ 
        title: '', 
        description: '', 
        duration: '', 
        difficulty: 'Beginner',
        provider: '',
        url: '',
        topics: '',
        prerequisites: ''
      });
      setIsCreateCourseOpen(false);
      await loadData();
    } catch (error) {
      console.error('Failed to create course:', error);
    }
  };

  const getRoleIcon = (role: string | null) => {
    switch (role) {
      case 'admin': return <UserCheck className="w-4 h-4" />;
      case 'teacher': return <GraduationCap className="w-4 h-4" />;
      case 'student': return <Users className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string | null) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'teacher': return 'default';
      case 'student': return 'secondary';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-golden"></div>
          <p className="mt-4 text-lg text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Admin Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                Welcome back, <span className="text-golden">{userProfile?.full_name || userProfile?.username}! 👋</span>
              </h1>
              <p className="text-muted-foreground">
                Admin Dashboard - Complete control over your learning platform
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Grid with Better Visibility */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-blue-200 dark:border-blue-700 hover:shadow-lg hover:scale-105 transition-all duration-300 animate-fade-in">
            <CardContent className="p-3 sm:p-4">
              <div className="text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center mx-auto shadow-md">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-blue-600 dark:text-blue-300 font-semibold">Total Users</p>
                  <p className="text-lg font-bold text-blue-800 dark:text-blue-100">{stats?.totalUsers || 0}</p>
                  <p className="text-xs text-blue-500 dark:text-blue-400 font-medium">+{stats?.newUsersThisMonth || 0} this month</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 border-green-200 dark:border-green-700 hover:shadow-lg hover:scale-105 transition-all duration-300 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <CardContent className="p-3 sm:p-4">
              <div className="text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center mx-auto shadow-md">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-green-600 dark:text-green-300 font-semibold">Students</p>
                  <p className="text-lg font-bold text-green-800 dark:text-green-100">{stats?.students || 0}</p>
                  <p className="text-xs text-green-500 dark:text-green-400 font-medium">Active learners</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 border-purple-200 dark:border-purple-700 hover:shadow-lg hover:scale-105 transition-all duration-300 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <CardContent className="p-3 sm:p-4">
              <div className="text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center mx-auto shadow-md">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-purple-600 dark:text-purple-300 font-semibold">Teachers</p>
                  <p className="text-lg font-bold text-purple-800 dark:text-purple-100">{stats?.teachers || 0}</p>
                  <p className="text-xs text-purple-500 dark:text-purple-400 font-medium">Educators</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 border-red-200 dark:border-red-700 hover:shadow-lg hover:scale-105 transition-all duration-300 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <CardContent className="p-3 sm:p-4">
              <div className="text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center mx-auto shadow-md">
                  <UserCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-red-600 dark:text-red-300 font-semibold">Admins</p>
                  <p className="text-lg font-bold text-red-800 dark:text-red-100">{stats?.admins || 0}</p>
                  <p className="text-xs text-red-500 dark:text-red-400 font-medium">System admins</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 border-amber-200 dark:border-amber-700 hover:shadow-lg hover:scale-105 transition-all duration-300 animate-fade-in" style={{ animationDelay: '400ms' }}>
            <CardContent className="p-3 sm:p-4">
              <div className="text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center mx-auto shadow-md">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-amber-600 dark:text-amber-300 font-semibold">Roadmaps</p>
                  <p className="text-lg font-bold text-amber-800 dark:text-amber-100">{roadmaps.length}</p>
                  <p className="text-xs text-amber-500 dark:text-amber-400 font-medium">Learning paths</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/30 dark:to-cyan-800/30 border-cyan-200 dark:border-cyan-700 hover:shadow-lg hover:scale-105 transition-all duration-300 animate-fade-in" style={{ animationDelay: '500ms' }}>
            <CardContent className="p-3 sm:p-4">
              <div className="text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center mx-auto shadow-md">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-cyan-600 dark:text-cyan-300 font-semibold">Courses</p>
                  <p className="text-lg font-bold text-cyan-800 dark:text-cyan-100">{courses.length}</p>
                  <p className="text-xs text-cyan-500 dark:text-cyan-400 font-medium">Available courses</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Navigation Tabs - Enhanced Color Palette */}
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-5 lg:w-fit mb-8 bg-card/80 backdrop-blur-sm border-border/60 shadow-lg">
            <TabsTrigger value="dashboard" className="flex items-center gap-2 data-[state=active]:bg-golden data-[state=active]:text-background data-[state=active]:shadow-md transition-all duration-200">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
              <span className="sm:hidden">📊</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Users</span>
              <span className="sm:hidden">👥</span>
            </TabsTrigger>
            <TabsTrigger value="roadmaps" className="flex items-center gap-2 data-[state=active]:bg-amber-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200">
              <MapPin className="w-4 h-4" />
              <span className="hidden sm:inline">Roadmaps</span>
              <span className="sm:hidden">🗺️</span>
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center gap-2 data-[state=active]:bg-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Courses</span>
              <span className="sm:hidden">📚</span>
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center gap-2 data-[state=active]:bg-green-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200">
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">Leaderboard</span>
              <span className="sm:hidden">🏆</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-golden-50 to-amber-50 dark:from-golden-900/20 dark:to-amber-900/20 border-golden-200 dark:border-golden-700 hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-golden-600 dark:text-golden-400">
                    <BarChart3 className="w-5 h-5" />
                    System Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-2 rounded-lg bg-golden-100 dark:bg-golden-800/30">
                      <span className="text-golden-700 dark:text-golden-300 font-medium">Total Users</span>
                      <span className="font-bold text-golden-800 dark:text-golden-200">{stats?.totalUsers || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg bg-amber-100 dark:bg-amber-800/30">
                      <span className="text-amber-700 dark:text-amber-300 font-medium">Active Roadmaps</span>
                      <span className="font-bold text-amber-800 dark:text-amber-200">{roadmaps.length}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg bg-yellow-100 dark:bg-yellow-800/30">
                      <span className="text-yellow-700 dark:text-yellow-300 font-medium">Available Courses</span>
                      <span className="font-bold text-yellow-800 dark:text-yellow-200">{courses.length}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg bg-green-100 dark:bg-green-800/30">
                      <span className="text-green-700 dark:text-green-300 font-medium">New Users This Month</span>
                      <span className="font-bold text-green-800 dark:text-green-200">+{stats?.newUsersThisMonth || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700 hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <Target className="w-5 h-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    onClick={() => setIsCreateRoadmapOpen(true)}
                    className="w-full justify-start bg-amber-500 hover:bg-amber-600 text-white shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Roadmap
                  </Button>
                  <Button 
                    onClick={() => setIsCreateCourseOpen(true)}
                    className="w-full justify-start bg-cyan-500 hover:bg-cyan-600 text-white shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Course
                  </Button>
                  <Button className="w-full justify-start bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg transition-all duration-200">
                    <Users className="w-4 h-4 mr-2" />
                    View All Users
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700 hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <TrendingUp className="w-5 h-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-green-100 dark:bg-green-800/30">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-green-800 dark:text-green-200">New user registered</p>
                        <p className="text-xs text-green-600 dark:text-green-400">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-blue-100 dark:bg-blue-800/30">
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">Roadmap created</p>
                        <p className="text-xs text-blue-600 dark:text-blue-400">5 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-amber-100 dark:bg-amber-800/30">
                      <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse"></div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">Course updated</p>
                        <p className="text-xs text-amber-600 dark:text-amber-400">1 day ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="users" className="space-y-6">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <Users className="w-5 h-5" />
                  User Management
                </CardTitle>
                <CardDescription className="text-blue-600 dark:text-blue-300">
                  View and manage all registered users and their roles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-blue-200 dark:border-blue-700 bg-blue-100 dark:bg-blue-800/30">
                        <TableHead className="text-blue-800 dark:text-blue-200 font-semibold">User</TableHead>
                        <TableHead className="text-blue-800 dark:text-blue-200 font-semibold">Email</TableHead>
                        <TableHead className="text-blue-800 dark:text-blue-200 font-semibold">Role</TableHead>
                        <TableHead className="text-blue-800 dark:text-blue-200 font-semibold">XP</TableHead>
                        <TableHead className="text-blue-800 dark:text-blue-200 font-semibold text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id} className="border-blue-100 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-800/20 transition-colors">
                          <TableCell className="font-medium text-blue-800 dark:text-blue-200">
                            <div className="flex items-center gap-3">
                              {getRoleIcon(user.role)}
                              <div>
                                <div className="font-semibold text-blue-900 dark:text-blue-100">{user.full_name || user.username}</div>
                                <div className="text-sm text-blue-600 dark:text-blue-400">@{user.username}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-blue-700 dark:text-blue-300">{user.email}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={getRoleBadgeVariant(user.role)} 
                              className="px-3 py-1 text-xs font-semibold shadow-sm"
                            >
                              {user.role || 'student'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-blue-700 dark:text-blue-300">
                            <div className="flex items-center gap-2">
                              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{user.experience_points || 0}</div>
                              <div className="text-xs text-blue-500 dark:text-blue-500">XP</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-blue-700 dark:text-blue-300">
                            <div className="flex items-center gap-2">
                              <Select
                                value={user.role || 'student'}
                                onValueChange={(value) => handleRoleChange(user.id, value)}
                              >
                                <SelectTrigger className="w-32 bg-blue-100 dark:bg-blue-800/50 border-blue-300 dark:border-blue-600 text-blue-800 dark:text-blue-200">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-blue-50 dark:bg-blue-900 border-blue-300 dark:border-blue-600">
                                  <SelectItem value="student" className="text-blue-800 dark:text-blue-200">Student</SelectItem>
                                  <SelectItem value="teacher" className="text-blue-800 dark:text-blue-200">Teacher</SelectItem>
                                  <SelectItem value="admin" className="text-blue-800 dark:text-blue-200">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-blue-50 dark:bg-blue-900 border-blue-300 dark:border-blue-600">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-blue-800 dark:text-blue-200">Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription className="text-blue-600 dark:text-blue-400">
                                      This will permanently delete user "{user.full_name || user.username}" and all their associated data.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200">Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDeleteUser(user.id)}
                                      className="bg-red-500 hover:bg-red-600 text-white"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Roadmaps Tab */}
          <TabsContent value="roadmaps" className="space-y-6">
            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-700 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                      <MapPin className="w-5 h-5" />
                      Roadmap Management
                    </CardTitle>
                    <CardDescription className="text-amber-600 dark:text-amber-300">
                      Create and manage learning roadmaps with associated courses
                    </CardDescription>
                  </div>
                  <Dialog open={isCreateRoadmapOpen} onOpenChange={setIsCreateRoadmapOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-amber-500 hover:bg-amber-600 text-white shadow-md hover:shadow-lg transition-all duration-200">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Roadmap
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-amber-50 dark:bg-amber-900 border-amber-300 dark:border-amber-600 max-w-6xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-amber-800 dark:text-amber-200">Create New Roadmap</DialogTitle>
                        <DialogDescription className="text-amber-600 dark:text-amber-400">
                          Create a comprehensive learning roadmap with multiple phases of content
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-6">
                        {/* Basic Information */}
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="roadmap-title" className="text-amber-700 dark:text-amber-300">Title</Label>
                            <Input
                              id="roadmap-title"
                              value={newRoadmap.title}
                              onChange={(e) => setNewRoadmap({ ...newRoadmap, title: e.target.value })}
                              placeholder="e.g., Full Stack Web Development"
                              className="bg-amber-100 dark:bg-amber-800/50 border-amber-300 dark:border-amber-600 text-amber-800 dark:text-amber-200"
                            />
                          </div>
                          <div>
                            <Label htmlFor="roadmap-description" className="text-amber-700 dark:text-amber-300">Description</Label>
                            <Textarea
                              id="roadmap-description"
                              value={newRoadmap.description}
                              onChange={(e) => setNewRoadmap({ ...newRoadmap, description: e.target.value })}
                              placeholder="Describe the learning path..."
                              className="bg-amber-100 dark:bg-amber-800/50 border-amber-300 dark:border-amber-600 text-amber-800 dark:text-amber-200"
                              rows={4}
                            />
                          </div>
                        </div>

                        {/* Phases Section */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200 flex items-center gap-2">
                              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                              Learning Phases
                            </h3>
                            <Badge variant="outline" className="text-amber-700 dark:text-amber-300">
                              {newRoadmap.phases.length} phases added
                            </Badge>
                          </div>

                          {/* Phase Creation Form */}
                          <div className="border-2 border-dashed border-amber-300 dark:border-amber-600 rounded-lg p-4">
                            <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-4">Create New Phase</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <Input
                                value={newPhase.title}
                                onChange={(e) => setNewPhase({ ...newPhase, title: e.target.value })}
                                placeholder="Phase title (e.g., Introduction to HTML)"
                                className="bg-amber-100 dark:bg-amber-800/50 border-amber-300 dark:border-amber-600 text-amber-800 dark:text-amber-200"
                              />
                              <Input
                                value={newPhase.estimated_duration}
                                onChange={(e) => setNewPhase({ ...newPhase, estimated_duration: e.target.value })}
                                placeholder="Duration (e.g., 2 weeks)"
                                className="bg-amber-100 dark:bg-amber-800/50 border-amber-300 dark:border-amber-600 text-amber-800 dark:text-amber-200"
                              />
                            </div>
                            <Textarea
                              value={newPhase.description}
                              onChange={(e) => setNewPhase({ ...newPhase, description: e.target.value })}
                              placeholder="Phase description..."
                              className="bg-amber-100 dark:bg-amber-800/50 border-amber-300 dark:border-amber-600 text-amber-800 dark:text-amber-200"
                              rows={2}
                            />

                            {/* Content for Phase */}
                            <div className="space-y-4 mt-4">
                              {/* YouTube Videos for Phase */}
                              <div className="border-l-4 border-red-500 pl-4">
                                <h5 className="font-medium text-red-700 dark:text-red-300 mb-2">YouTube Videos</h5>
                                <div className="space-y-2 mb-2">
                                  <Input
                                    value={newVideo.video_id}
                                    onChange={(e) => setNewVideo({ ...newVideo, video_id: e.target.value })}
                                    placeholder="Paste YouTube video URL (e.g., https://youtube.com/watch?v=dQw4w9WgXcQ)"
                                    className="bg-amber-100 dark:bg-amber-800/50 border-amber-300 dark:border-amber-600 text-amber-800 dark:text-amber-200 text-sm"
                                  />
                                  <p className="text-xs text-amber-600 dark:text-amber-400">
                                    💡 Just paste the YouTube URL and we'll automatically extract the title, duration, and thumbnail
                                  </p>
                                </div>
                                <Button 
                                  onClick={addYouTubeVideoToPhase}
                                  className="bg-red-500 hover:bg-red-600 text-white mb-2"
                                  disabled={!newVideo.video_id}
                                  size="sm"
                                >
                                  <Plus className="w-3 h-3 mr-1" />
                                  Add Video
                                </Button>
                                {newPhase.youtube_videos.length > 0 && (
                                  <div className="space-y-1">
                                    {newPhase.youtube_videos.map((video, index) => (
                                      <div key={index} className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 rounded text-sm">
                                        <span className="text-red-800 dark:text-red-200">📹 {video.title}</span>
                                        <Button 
                                          variant="outline" 
                                          size="sm"
                                          onClick={() => setNewPhase({
                                            ...newPhase,
                                            youtube_videos: newPhase.youtube_videos.filter((_, i) => i !== index)
                                          })}
                                          className="border-red-300 text-red-600 hover:bg-red-100"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Coursera Links for Phase */}
                              <div className="border-l-4 border-purple-500 pl-4">
                                <h5 className="font-medium text-purple-700 dark:text-purple-300 mb-2">Online Courses</h5>
                                <div className="space-y-2 mb-2">
                                  <Input
                                    value={newCoursera.url}
                                    onChange={(e) => setNewCoursera({ ...newCoursera, url: e.target.value })}
                                    placeholder="Paste course URL (Coursera, edX, Udemy, etc.)"
                                    className="bg-amber-100 dark:bg-amber-800/50 border-amber-300 dark:border-amber-600 text-amber-800 dark:text-amber-200 text-sm"
                                  />
                                  <p className="text-xs text-amber-600 dark:text-amber-400">
                                    💡 Paste any course URL and we'll automatically extract the course information
                                  </p>
                                </div>
                                <Button 
                                  onClick={addCourseraLinkToPhase}
                                  className="bg-purple-500 hover:bg-purple-600 text-white mb-2"
                                  disabled={!newCoursera.url}
                                  size="sm"
                                >
                                  <Plus className="w-3 h-3 mr-1" />
                                  Add Course
                                </Button>
                                {newPhase.coursera_links.length > 0 && (
                                  <div className="space-y-1">
                                    {newPhase.coursera_links.map((course, index) => (
                                      <div key={index} className="flex items-center justify-between p-2 bg-purple-50 dark:bg-purple-900/20 rounded text-sm">
                                        <span className="text-purple-800 dark:text-purple-200">🎓 {course.title}</span>
                                        <Button 
                                          variant="outline" 
                                          size="sm"
                                          onClick={() => setNewPhase({
                                            ...newPhase,
                                            coursera_links: newPhase.coursera_links.filter((_, i) => i !== index)
                                          })}
                                          className="border-purple-300 text-purple-600 hover:bg-purple-100"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* IDE Projects for Phase */}
                              <div className="border-l-4 border-green-500 pl-4">
                                <h5 className="font-medium text-green-700 dark:text-green-300 mb-2">Coding Projects</h5>
                                <div className="space-y-2 mb-2">
                                  <Input
                                    value={newIDEProject.title}
                                    onChange={(e) => setNewIDEProject({ ...newIDEProject, title: e.target.value })}
                                    placeholder="Project title (e.g., React Todo App)"
                                    className="bg-amber-100 dark:bg-amber-800/50 border-amber-300 dark:border-amber-600 text-amber-800 dark:text-amber-200 text-sm"
                                  />
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <Input
                                      value={newIDEProject.language}
                                      onChange={(e) => setNewIDEProject({ ...newIDEProject, language: e.target.value })}
                                      placeholder="Language (e.g., JavaScript, Python)"
                                      className="bg-amber-100 dark:bg-amber-800/50 border-amber-300 dark:border-amber-600 text-amber-800 dark:text-amber-200 text-sm"
                                    />
                                    <Select
                                      value={newIDEProject.difficulty}
                                      onValueChange={(value: 'Beginner' | 'Intermediate' | 'Advanced') => {
                                        setNewIDEProject({ ...newIDEProject, difficulty: value });
                                      }}
                                    >
                                      <SelectTrigger className="w-full bg-amber-100 dark:bg-amber-800/50 border-amber-300 dark:border-amber-600 text-amber-800 dark:text-amber-200 text-sm">
                                        <SelectValue placeholder="Difficulty" />
                                      </SelectTrigger>
                                      <SelectContent className="bg-amber-50 dark:bg-amber-900 border-amber-300 dark:border-amber-600">
                                        <SelectItem value="Beginner" className="text-amber-800 dark:text-amber-200">Beginner</SelectItem>
                                        <SelectItem value="Intermediate" className="text-amber-800 dark:text-amber-200">Intermediate</SelectItem>
                                        <SelectItem value="Advanced" className="text-amber-800 dark:text-amber-200">Advanced</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <Textarea
                                    value={newIDEProject.instructions}
                                    onChange={(e) => setNewIDEProject({ ...newIDEProject, instructions: e.target.value })}
                                    placeholder="Project instructions and objectives..."
                                    className="bg-amber-100 dark:bg-amber-800/50 border-amber-300 dark:border-amber-600 text-amber-800 dark:text-amber-200 text-sm"
                                    rows={2}
                                  />
                                </div>
                                <Button 
                                  onClick={addIDEProjectToPhase}
                                  className="bg-green-500 hover:bg-green-600 text-white mb-2"
                                  disabled={!newIDEProject.title || !newIDEProject.language}
                                  size="sm"
                                >
                                  <Plus className="w-3 h-3 mr-1" />
                                  Add Project
                                </Button>
                                {newPhase.ide_projects.length > 0 && (
                                  <div className="space-y-1">
                                    {newPhase.ide_projects.map((project, index) => (
                                      <div key={index} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded text-sm">
                                        <span className="text-green-800 dark:text-green-200">💻 {project.title}</span>
                                        <Button 
                                          variant="outline" 
                                          size="sm"
                                          onClick={() => setNewPhase({
                                            ...newPhase,
                                            ide_projects: newPhase.ide_projects.filter((_, i) => i !== index)
                                          })}
                                          className="border-green-300 text-green-600 hover:bg-green-100"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>

                            <Button 
                              onClick={addPhase}
                              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                              disabled={!newPhase.title}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Phase to Roadmap
                            </Button>
                          </div>

                          {/* Existing Phases */}
                          {newRoadmap.phases.length > 0 && (
                            <div className="space-y-3">
                              <h4 className="font-medium text-amber-800 dark:text-amber-200">Current Phases</h4>
                              {newRoadmap.phases.map((phase, index) => (
                                <div key={phase.id} className="p-4 bg-amber-100 dark:bg-amber-800/30 rounded-lg">
                                  <div className="flex items-center justify-between mb-2">
                                    <h5 className="font-medium text-amber-800 dark:text-amber-200">
                                      Phase {index + 1}: {phase.title}
                                    </h5>
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="text-xs">
                                        {phase.estimated_duration}
                                      </Badge>
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => removePhase(index)}
                                        className="border-red-300 text-red-600 hover:bg-red-100"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                  <p className="text-sm text-amber-600 dark:text-amber-400 mb-2">{phase.description}</p>
                                  <div className="flex flex-wrap gap-2">
                                    {phase.youtube_videos.length > 0 && (
                                      <Badge variant="secondary" className="text-xs bg-red-100 text-red-700">
                                        📹 {phase.youtube_videos.length} videos
                                      </Badge>
                                    )}
                                    {phase.coursera_links.length > 0 && (
                                      <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                                        🎓 {phase.coursera_links.length} courses
                                      </Badge>
                                    )}
                                    {phase.ide_projects.length > 0 && (
                                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                        💻 {phase.ide_projects.length} projects
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateRoadmapOpen(false)} className="bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-200">
                          Cancel
                        </Button>
                        <Button onClick={handleCreateRoadmap} className="bg-amber-500 hover:bg-amber-600 text-white" disabled={!newRoadmap.title || !newRoadmap.description || newRoadmap.phases.length === 0}>
                          Create Roadmap
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {roadmaps.length === 0 ? (
                    <div className="text-center py-12">
                      <MapPin className="w-16 h-16 text-amber-400 mx-auto mb-4 opacity-50" />
                      <h3 className="text-xl font-semibold text-amber-800 dark:text-amber-200 mb-2">No roadmaps created yet</h3>
                      <p className="text-amber-600 dark:text-amber-400">Create your first roadmap to get started with building learning paths.</p>
                      <Button 
                        onClick={() => setIsCreateRoadmapOpen(true)}
                        className="bg-amber-500 hover:bg-amber-600 text-white mt-4 shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Roadmap
                      </Button>
                    </div>
                  ) : (
                    roadmaps.map((roadmap) => (
                      <Card key={roadmap.id} className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-800/30 dark:to-orange-800/30 border-amber-200 dark:border-amber-600 hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-lg transition-all">
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between text-amber-800 dark:text-amber-200">
                            <span className="flex items-center gap-2">
                              <MapPin className="w-5 h-5 text-amber-500" />
                              {roadmap.title}
                            </span>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="border-amber-300 text-amber-600 hover:bg-amber-50 dark:border-amber-600 dark:text-amber-400 dark:hover:bg-amber-900/20"
                                onClick={() => setEditingRoadmap(roadmap)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-amber-50 dark:bg-amber-900 border-amber-300 dark:border-amber-600">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-amber-800 dark:text-amber-200">Delete Roadmap?</AlertDialogTitle>
                                    <AlertDialogDescription className="text-amber-600 dark:text-amber-400">
                                      This will permanently delete "{roadmap.title}" and all its associated content.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-200">Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDeleteRoadmap(roadmap.id)}
                                      className="bg-red-500 hover:bg-red-600 text-white"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </CardTitle>
                          <CardDescription className="text-amber-600 dark:text-amber-400">{roadmap.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {/* Phases Section */}
                            {roadmap.phases && roadmap.phases.length > 0 ? (
                              <div>
                                <h4 className="text-sm font-semibold text-amber-700 dark:text-amber-300 mb-2 flex items-center gap-2">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  Learning Phases ({roadmap.phases.length})
                                </h4>
                                <div className="space-y-2">
                                  {roadmap.phases.map((phase, index) => (
                                    <div key={phase.id} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                      <div className="flex items-center justify-between mb-2">
                                        <h5 className="font-medium text-blue-800 dark:text-blue-200">
                                          Phase {index + 1}: {phase.title}
                                        </h5>
                                        <Badge variant="outline" className="text-xs">
                                          {phase.estimated_duration}
                                        </Badge>
                                      </div>
                                      <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">{phase.description}</p>
                                      <div className="flex flex-wrap gap-2">
                                        {phase.youtube_videos.length > 0 && (
                                          <Badge variant="secondary" className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-800/50 dark:text-red-300 text-xs">
                                            📹 {phase.youtube_videos.length} Videos
                                          </Badge>
                                        )}
                                        {phase.coursera_links.length > 0 && (
                                          <Badge variant="secondary" className="px-2 py-1 bg-purple-100 text-purple-700 dark:bg-purple-800/50 dark:text-purple-300 text-xs">
                                            🎓 {phase.coursera_links.length} Courses
                                          </Badge>
                                        )}
                                        {phase.ide_projects.length > 0 && (
                                          <Badge variant="secondary" className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-800/50 dark:text-green-300 text-xs">
                                            💻 {phase.ide_projects.length} Projects
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-4 text-amber-600 dark:text-amber-400">
                                <p className="text-sm">No phases added yet. Edit to add learning phases.</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Edit Roadmap Dialog */}
          <Dialog open={!!editingRoadmap} onOpenChange={(open) => !open && setEditingRoadmap(null)}>
            <DialogContent className="bg-amber-50 dark:bg-amber-900 border-amber-300 dark:border-amber-600 max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-amber-800 dark:text-amber-200">Edit Roadmap</DialogTitle>
                <DialogDescription className="text-amber-600 dark:text-amber-400">
                  Update the learning roadmap content and settings
                </DialogDescription>
              </DialogHeader>
              {editingRoadmap && (
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="edit-roadmap-title" className="text-amber-700 dark:text-amber-300">Title</Label>
                      <Input
                        id="edit-roadmap-title"
                        value={editingRoadmap.title}
                        onChange={(e) => setEditingRoadmap({ ...editingRoadmap, title: e.target.value })}
                        className="bg-amber-100 dark:bg-amber-800/50 border-amber-300 dark:border-amber-600 text-amber-800 dark:text-amber-200"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-roadmap-description" className="text-amber-700 dark:text-amber-300">Description</Label>
                      <Textarea
                        id="edit-roadmap-description"
                        value={editingRoadmap.description}
                        onChange={(e) => setEditingRoadmap({ ...editingRoadmap, description: e.target.value })}
                        className="bg-amber-100 dark:bg-amber-800/50 border-amber-300 dark:border-amber-600 text-amber-800 dark:text-amber-200"
                        rows={4}
                      />
                    </div>
                  </div>

                  {/* Phases List */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200">Learning Phases</h3>
                    
                    {editingRoadmap.phases.length === 0 ? (
                      <p className="text-sm text-amber-600 dark:text-amber-400">No phases added</p>
                    ) : (
                      <div className="space-y-3">
                        {editingRoadmap.phases.map((phase, index) => (
                          <div key={phase.id} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium text-blue-800 dark:text-blue-200">
                                Phase {index + 1}: {phase.title}
                              </h5>
                              <Badge variant="outline" className="text-xs">
                                {phase.estimated_duration}
                              </Badge>
                            </div>
                            <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">{phase.description}</p>
                            <div className="flex flex-wrap gap-2">
                              {phase.youtube_videos.length > 0 && (
                                <Badge variant="secondary" className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-800/50 dark:text-red-300 text-xs">
                                  📹 {phase.youtube_videos.length} Videos
                                </Badge>
                              )}
                              {phase.coursera_links.length > 0 && (
                                <Badge variant="secondary" className="px-2 py-1 bg-purple-100 text-purple-700 dark:bg-purple-800/50 dark:text-purple-300 text-xs">
                                  🎓 {phase.coursera_links.length} Courses
                                </Badge>
                              )}
                              {phase.ide_projects.length > 0 && (
                                <Badge variant="secondary" className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-800/50 dark:text-green-300 text-xs">
                                  💻 {phase.ide_projects.length} Projects
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingRoadmap(null)} className="bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-200">
                  Cancel
                </Button>
                <Button onClick={handleUpdateRoadmap} className="bg-amber-500 hover:bg-amber-600 text-white" disabled={!editingRoadmap?.title || !editingRoadmap?.description}>
                  Update Roadmap
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-6">
            <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 border-cyan-200 dark:border-cyan-700 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400">
                      <BookOpen className="w-5 h-5" />
                      Course Management
                    </CardTitle>
                    <CardDescription className="text-cyan-600 dark:text-cyan-300">
                      Create and manage courses for roadmaps
                    </CardDescription>
                  </div>
                  <Dialog open={isCreateCourseOpen} onOpenChange={setIsCreateCourseOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-cyan-500 hover:bg-cyan-600 text-white shadow-md hover:shadow-lg transition-all duration-200">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Course
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-cyan-50 dark:bg-cyan-900 border-cyan-300 dark:border-cyan-600">
                      <DialogHeader>
                        <DialogTitle className="text-cyan-800 dark:text-cyan-200">Create New Course</DialogTitle>
                        <DialogDescription className="text-cyan-600 dark:text-cyan-400">
                          Create a new course that can be added to roadmaps
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="course-url" className="text-cyan-700 dark:text-cyan-300">Course URL</Label>
                          <Input
                            id="course-url"
                            value={newCourse.url || ''}
                            onChange={(e) => setNewCourse({ ...newCourse, url: e.target.value })}
                            placeholder="Paste course URL (Coursera, edX, Udemy, etc.)"
                            className="bg-cyan-100 dark:bg-cyan-800/50 border-cyan-300 dark:border-cyan-600 text-cyan-800 dark:text-cyan-200"
                          />
                          <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-1">
                            💡 Paste any course URL and we'll automatically extract the course information
                          </p>
                        </div>
                        <div>
                          <Label htmlFor="course-title" className="text-cyan-700 dark:text-cyan-300">Course Title</Label>
                          <Input
                            id="course-title"
                            value={newCourse.title}
                            onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                            placeholder="e.g., Introduction to React Development"
                            className="bg-cyan-100 dark:bg-cyan-800/50 border-cyan-300 dark:border-cyan-600 text-cyan-800 dark:text-cyan-200"
                          />
                        </div>
                        <div>
                          <Label htmlFor="course-description" className="text-cyan-700 dark:text-cyan-300">Course Description</Label>
                          <Textarea
                            id="course-description"
                            value={newCourse.description}
                            onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                            placeholder="Provide a brief description of what students will learn..."
                            className="bg-cyan-100 dark:bg-cyan-800/50 border-cyan-300 dark:border-cyan-600 text-cyan-800 dark:text-cyan-200"
                            rows={3}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="course-provider" className="text-cyan-700 dark:text-cyan-300">Provider</Label>
                            <Input
                              id="course-provider"
                              value={newCourse.provider || ''}
                              onChange={(e) => setNewCourse({ ...newCourse, provider: e.target.value })}
                              placeholder="e.g., Coursera, edX, Udemy"
                              className="bg-cyan-100 dark:bg-cyan-800/50 border-cyan-300 dark:border-cyan-600 text-cyan-800 dark:text-cyan-200"
                            />
                          </div>
                          <div>
                            <Label htmlFor="course-duration" className="text-cyan-700 dark:text-cyan-300">Duration</Label>
                            <Input
                              id="course-duration"
                              value={newCourse.duration}
                              onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
                              placeholder="e.g., 4 weeks, 20 hours"
                              className="bg-cyan-100 dark:bg-cyan-800/50 border-cyan-300 dark:border-cyan-600 text-cyan-800 dark:text-cyan-200"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="course-difficulty" className="text-cyan-700 dark:text-cyan-300">Difficulty Level</Label>
                          <Select
                            value={newCourse.difficulty}
                            onValueChange={(value: 'Beginner' | 'Intermediate' | 'Advanced') => {
                              setNewCourse({ ...newCourse, difficulty: value });
                            }}
                          >
                            <SelectTrigger className="w-full bg-cyan-100 dark:bg-cyan-800/50 border-cyan-300 dark:border-cyan-600 text-cyan-800 dark:text-cyan-200">
                              <SelectValue placeholder="Select difficulty level" />
                            </SelectTrigger>
                            <SelectContent className="bg-cyan-50 dark:bg-cyan-900 border-cyan-300 dark:border-cyan-600">
                              <SelectItem value="Beginner" className="text-cyan-800 dark:text-cyan-200">Beginner</SelectItem>
                              <SelectItem value="Intermediate" className="text-cyan-800 dark:text-cyan-200">Intermediate</SelectItem>
                              <SelectItem value="Advanced" className="text-cyan-800 dark:text-cyan-200">Advanced</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateCourseOpen(false)} className="bg-cyan-200 text-cyan-800 dark:bg-cyan-800 dark:text-cyan-200">
                          Cancel
                        </Button>
                        <Button onClick={handleCreateCourse} className="bg-cyan-500 hover:bg-cyan-600 text-white">
                          Create Course
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {courses.length === 0 ? (
                    <div className="text-center py-12">
                      <BookOpen className="w-16 h-16 text-cyan-400 mx-auto mb-4 opacity-50" />
                      <h3 className="text-xl font-semibold text-cyan-800 dark:text-cyan-200 mb-2">No courses created yet</h3>
                      <p className="text-cyan-600 dark:text-cyan-400">Create your first course to start building your learning library.</p>
                      <Button 
                        onClick={() => setIsCreateCourseOpen(true)}
                        className="bg-cyan-500 hover:bg-cyan-600 text-white mt-4 shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Course
                      </Button>
                    </div>
                  ) : (
                    courses.map((course) => (
                      <Card key={course.id} className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-800/30 dark:to-blue-800/30 border-cyan-200 dark:border-cyan-600 hover:border-cyan-400 dark:hover:border-cyan-500 hover:shadow-lg transition-all">
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between text-cyan-800 dark:text-cyan-200">
                            <span className="flex items-center gap-2">
                              <BookOpen className="w-5 h-5 text-cyan-500" />
                              {course.title}
                            </span>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="border-cyan-300 text-cyan-600 hover:bg-cyan-50 dark:border-cyan-600 dark:text-cyan-400 dark:hover:bg-cyan-900/20">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm" className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardTitle>
                          <CardDescription className="text-cyan-600 dark:text-cyan-400">{course.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-cyan-600 dark:text-cyan-400">
                              <div className="flex items-center gap-2">
                                <span className="text-sm">⏱</span>
                                <span>{course.duration}</span>
                              </div>
                              <Badge 
                                variant={course.difficulty === 'Beginner' ? 'secondary' : course.difficulty === 'Intermediate' ? 'default' : 'destructive'}
                                className="ml-2"
                              >
                                {course.difficulty}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="space-y-6">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <Trophy className="w-5 h-5" />
                  Complete Leaderboard
                </CardTitle>
                <CardDescription className="text-green-600 dark:text-green-300">
                  Top performers across all users with their experience points and achievements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leaderboard.map((user, index) => (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-800/30 dark:to-emerald-800/30 rounded-lg border border-green-200 dark:border-green-600 hover:shadow-md transition-all duration-200">
                      <div className="flex items-center gap-4">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm shadow-md ${
                          index === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white' :
                          index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white' :
                          index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white' :
                          'bg-gradient-to-br from-green-400 to-green-500 text-white'
                        }`}>
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                        </div>
                        <div className="flex items-center gap-3">
                          {getRoleIcon(user.role)}
                          <div>
                            <div className="font-semibold text-green-800 dark:text-green-200">{user.full_name || user.username}</div>
                            <div className="text-sm text-green-600 dark:text-green-400">@{user.username}</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600 dark:text-green-400">{user.experience_points || 0}</div>
                          <div className="text-xs text-green-500 dark:text-green-500">XP</div>
                        </div>
                        <Badge 
                          variant={getRoleBadgeVariant(user.role)} 
                          className="px-3 py-1 shadow-sm"
                        >
                          {user.role || 'student'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
