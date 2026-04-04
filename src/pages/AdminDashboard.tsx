import React, { useState, useEffect } from 'react';
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
  BookOpen, 
  MapPin, 
  Shield, 
  Plus, 
  Edit, 
  Trash2, 
  GraduationCap, 
  UserCheck,
  BarChart3,
  Trophy,
  Target,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { 
  getAllUsers, 
  updateUserRole, 
  deleteUser, 
  getUserStats,
  createRoadmap,
  getAllRoadmaps,
  deleteRoadmap,
  createCourse,
  getAllCourses,
  deleteCourse,
  Roadmap,
  Course,
  UserProfile
} from '@/integrations/firebase/client';
import Navbar from '@/components/Navbar';

const AdminDashboard = () => {
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isCreateRoadmapOpen, setIsCreateRoadmapOpen] = useState(false);
  const [isCreateCourseOpen, setIsCreateCourseOpen] = useState(false);
  const [newRoadmap, setNewRoadmap] = useState({ 
    title: '', 
    description: '', 
    phases: [] as any[],
    // Enhanced specifications
    category: '',
    difficulty_level: 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced',
    estimated_duration: '',
    prerequisites: [] as string[],
    learning_objectives: [] as string[],
    target_audience: [] as string[],
    tags: [] as string[],
    thumbnail_url: '',
    instructor_name: '',
    instructor_bio: '',
    language: 'English'
  });
  const [newPhase, setNewPhase] = useState({ 
    title: '', 
    description: '', 
    estimated_duration: '',
    youtube_videos: [] as any[],
    coursera_links: [] as any[],
    ide_projects: [] as any[]
  });
  const [newVideo, setNewVideo] = useState({ title: '', video_id: '', description: '', duration: '', thumbnail_url: '' });
  const [newCoursera, setNewCoursera] = useState({ title: '', url: '', description: '', provider: '', duration: '', difficulty: 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced' });
  const [newIDEProject, setNewIDEProject] = useState({ title: '', description: '', language: '', difficulty: 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced', starter_code: '', solution_code: '', instructions: '' });
  const [newCourse, setNewCourse] = useState({ 
    title: '', 
    description: '', 
    // Enhanced specifications
    category: '',
    difficulty_level: 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced',
    estimated_duration: '',
    prerequisites: [] as string[],
    learning_objectives: [] as string[],
    target_audience: [] as string[],
    tags: [] as string[],
    thumbnail_url: '',
    instructor_name: '',
    instructor_bio: '',
    language: 'English',
    modules: [] as any[],
    documents: [] as string[],
    youtubeLinks: [] as string[]
  });

  // Check if user is admin
  if (userProfile && userProfile.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-500">
              <Shield className="w-5 h-5" />
              Access Denied
            </CardTitle>
            <CardDescription>
              You don't have permission to access the admin panel.
            </CardDescription>
          </CardHeader>
          <CardContent>
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
    if (user && userProfile?.role === 'admin') {
      loadData();
    }
  }, [user, userProfile]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateUserRole(userId, newRole);
      await loadData(); // Reload data to reflect changes
    } catch (error) {
      console.error('Failed to update user role:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId);
      await loadData(); // Reload data to reflect changes
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
        is_active: true,
        // Enhanced specifications
        category: newRoadmap.category || 'General',
        difficulty_level: newRoadmap.difficulty_level,
        estimated_duration: newRoadmap.estimated_duration || 'Not specified',
        prerequisites: newRoadmap.prerequisites,
        learning_objectives: newRoadmap.learning_objectives,
        target_audience: newRoadmap.target_audience,
        tags: newRoadmap.tags,
        thumbnail_url: newRoadmap.thumbnail_url || undefined,
        instructor_name: newRoadmap.instructor_name || undefined,
        instructor_bio: newRoadmap.instructor_bio || undefined,
        language: newRoadmap.language,
        rating: 0,
        enrollment_count: 0,
        completion_rate: 0
      };
      await createRoadmap(roadmapData);
      setNewRoadmap({ 
        title: '', 
        description: '', 
        phases: [],
        category: '',
        difficulty_level: 'Beginner',
        estimated_duration: '',
        prerequisites: [],
        learning_objectives: [],
        target_audience: [],
        tags: [],
        thumbnail_url: '',
        instructor_name: '',
        instructor_bio: '',
        language: 'English'
      });
      setNewPhase({ 
        title: '', 
        description: '', 
        estimated_duration: '',
        youtube_videos: [],
        coursera_links: [],
        ide_projects: []
      });
      setIsCreateRoadmapOpen(false);
      await loadData(); // Reload data to show new roadmap
    } catch (error) {
      console.error('Failed to create roadmap:', error);
    }
  };

  const addPhase = () => {
    if (newPhase.title.trim()) {
      setNewRoadmap({
        ...newRoadmap,
        phases: [...newRoadmap.phases, {
          ...newPhase,
          id: Date.now().toString(),
          order: newRoadmap.phases.length,
          youtube_videos: newPhase.youtube_videos.map((video, index) => ({
            ...video,
            id: video.id || Date.now().toString() + '_' + index,
            order: index
          })),
          coursera_links: newPhase.coursera_links.map((course, index) => ({
            ...course,
            id: course.id || Date.now().toString() + '_' + index,
            order: index
          })),
          ide_projects: newPhase.ide_projects.map((project, index) => ({
            ...project,
            id: project.id || Date.now().toString() + '_' + index,
            order: index
          }))
        }]
      });
      setNewPhase({ 
        title: '', 
        description: '', 
        estimated_duration: '',
        youtube_videos: [],
        coursera_links: [],
        ide_projects: []
      });
    }
  };

  const removePhase = (index: number) => {
    setNewRoadmap({
      ...newRoadmap,
      phases: newRoadmap.phases.filter((_, i) => i !== index)
    });
  };

  const addYouTubeVideoToPhase = () => {
    if (newVideo.video_id.trim()) {
      const videoId = extractYouTubeVideoId(newVideo.video_id);
      if (videoId) {
        setNewPhase({
          ...newPhase,
          youtube_videos: [...newPhase.youtube_videos, {
            ...newVideo,
            id: Date.now().toString(),
            video_id: videoId,
            order: newPhase.youtube_videos.length
          }]
        });
        setNewVideo({ title: '', video_id: '', description: '', duration: '', thumbnail_url: '' });
      }
    }
  };

  const addCourseraLinkToPhase = () => {
    if (newCoursera.url.trim()) {
      setNewPhase({
        ...newPhase,
        coursera_links: [...newPhase.coursera_links, {
          ...newCoursera,
          id: Date.now().toString(),
          order: newPhase.coursera_links.length
        }]
      });
      setNewCoursera({ title: '', url: '', description: '', provider: '', duration: '', difficulty: 'Beginner' });
    }
  };

  const addIDEProjectToPhase = () => {
    if (newIDEProject.title.trim() && newIDEProject.language.trim()) {
      setNewPhase({
        ...newPhase,
        ide_projects: [...newPhase.ide_projects, {
          ...newIDEProject,
          id: Date.now().toString(),
          order: newPhase.ide_projects.length
        }]
      });
      setNewIDEProject({ title: '', description: '', language: '', difficulty: 'Beginner', starter_code: '', solution_code: '', instructions: '' });
    }
  };

  const extractYouTubeVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
      /youtu\.be\/([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }
    return null;
  };

  const handleCreateCourse = async () => {
    try {
      const courseData = {
        title: newCourse.title,
        description: newCourse.description,
        is_active: true,
        // Enhanced specifications
        category: newCourse.category || 'General',
        difficulty_level: newCourse.difficulty_level,
        estimated_duration: newCourse.estimated_duration || 'Not specified',
        prerequisites: newCourse.prerequisites,
        learning_objectives: newCourse.learning_objectives,
        target_audience: newCourse.target_audience,
        tags: newCourse.tags,
        thumbnail_url: newCourse.thumbnail_url || null,
        instructor_name: newCourse.instructor_name || null,
        instructor_bio: newCourse.instructor_bio || null,
        language: newCourse.language,
        rating: 0,
        enrollment_count: 0,
        completion_rate: 0,
        modules: newCourse.modules || [],
        documents: newCourse.documents || [],
        youtubeLinks: newCourse.youtubeLinks || []
      };
      await createCourse(courseData);
      setNewCourse({ 
        title: '', 
        description: '', 
        category: '',
        difficulty_level: 'Beginner',
        estimated_duration: '',
        prerequisites: [],
        learning_objectives: [],
        target_audience: [],
        tags: [],
        thumbnail_url: '',
        instructor_name: '',
        instructor_bio: '',
        language: 'English',
        modules: [],
        documents: [],
        youtubeLinks: []
      });
      setIsCreateCourseOpen(false);
      await loadData(); // Reload data to show new course
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
      <>
        <Navbar />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-golden"></div>
              <div className="flex flex-col gap-2">
                <Shield className="w-12 h-12 text-golden animate-pulse" />
                <h1 className="text-3xl font-bold text-foreground mt-4">Admin Panel</h1>
                <p className="text-muted-foreground text-lg">Loading your dashboard...</p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          {/* Enhanced Header */}
          <div className="mb-6 sm:mb-8 text-center">
            <div className="inline-flex items-center justify-center p-1 bg-gradient-to-r from-golden/20 to-golden/10 rounded-full shadow-lg mb-6">
              <Shield className="w-8 h-8 text-golden mr-3" />
              <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
            </div>
            <p className="text-muted-foreground text-lg">Complete control over your learning platform</p>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-accent/50 transition-all duration-300 hover-scale animate-fade-in">
              <CardContent className="p-3 sm:p-4">
                <div className="text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto">
                    <Users className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Users</p>
                    <p className="text-lg font-bold text-foreground">{stats?.totalUsers || 0}</p>
                    <p className="text-xs text-blue-400">+{stats?.newUsersThisMonth || 0} this month</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-accent/50 transition-all duration-300 hover-scale animate-fade-in" style={{ animationDelay: '100ms' }}>
            <CardContent className="p-3 sm:p-4">
              <div className="text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                  <GraduationCap className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Students</p>
                  <p className="text-lg font-bold text-foreground">{stats?.students || 0}</p>
                  <p className="text-xs text-green-400">Active learners</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-accent/50 transition-all duration-300 hover-scale animate-fade-in" style={{ animationDelay: '200ms' }}>
            <CardContent className="p-3 sm:p-4">
              <div className="text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto">
                  <Users className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Teachers</p>
                  <p className="text-lg font-bold text-foreground">{stats?.teachers || 0}</p>
                  <p className="text-xs text-purple-400">Educators</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-accent/50 transition-all duration-300 hover-scale animate-fade-in" style={{ animationDelay: '300ms' }}>
            <CardContent className="p-3 sm:p-4">
              <div className="text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
                  <UserCheck className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Admins</p>
                  <p className="text-lg font-bold text-foreground">{stats?.admins || 0}</p>
                  <p className="text-xs text-red-400">System admins</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-accent/50 transition-all duration-300 hover-scale animate-fade-in" style={{ animationDelay: '400ms' }}>
            <CardContent className="p-3 sm:p-4">
              <div className="text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto">
                  <MapPin className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Roadmaps</p>
                  <p className="text-lg font-bold text-foreground">{roadmaps.length}</p>
                  <p className="text-xs text-amber-400">Learning paths</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-accent/50 transition-all duration-300 hover-scale animate-fade-in" style={{ animationDelay: '500ms' }}>
            <CardContent className="p-3 sm:p-4">
              <div className="text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center mx-auto">
                  <BookOpen className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Courses</p>
                  <p className="text-lg font-bold text-foreground">{courses.length}</p>
                  <p className="text-xs text-cyan-400">Available courses</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 p-1 bg-card/50 backdrop-blur-sm border-border/50 rounded-xl">
            <TabsTrigger 
              value="dashboard" 
              className="data-[state=active]:bg-golden data-[state=active]:text-background data-[state=active]:shadow-sm transition-all duration-200 flex items-center gap-2 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
              <span className="sm:hidden">📊</span>
            </TabsTrigger>
            <TabsTrigger 
              value="users" 
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200 flex items-center gap-2 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50"
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Users</span>
              <span className="sm:hidden">👥</span>
            </TabsTrigger>
            <TabsTrigger 
              value="roadmaps" 
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200 flex items-center gap-2 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50"
            >
              <MapPin className="w-4 h-4" />
              <span className="hidden sm:inline">Roadmaps</span>
              <span className="sm:hidden">🗺️</span>
            </TabsTrigger>
            <TabsTrigger 
              value="courses" 
              className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200 flex items-center gap-2 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Courses</span>
              <span className="sm:hidden">📚</span>
            </TabsTrigger>
            <TabsTrigger 
              value="leaderboard" 
              className="data-[state=active]:bg-green-500 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200 flex items-center gap-2 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50"
            >
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

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl font-bold text-foreground">
                  <Users className="w-6 h-6 text-blue-400" />
                  User Management
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  View and manage all registered users and their roles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border">
                        <TableHead className="text-foreground font-semibold">User</TableHead>
                        <TableHead className="text-foreground font-semibold">Email</TableHead>
                        <TableHead className="text-foreground font-semibold">Role</TableHead>
                        <TableHead className="text-foreground font-semibold">Joined</TableHead>
                        <TableHead className="text-foreground font-semibold">XP</TableHead>
                        <TableHead className="text-foreground font-semibold text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user, index) => (
                        <TableRow key={user.id} className="border-border hover:bg-accent/50 transition-colors">
                          <TableCell className="font-medium text-foreground">
                            <div className="flex items-center gap-3">
                              {getRoleIcon(user.role)}
                              <div>
                                <div className="font-semibold text-foreground">{user.full_name || user.username}</div>
                                <div className="text-sm text-muted-foreground">@{user.username}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-foreground">{user.email}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={getRoleBadgeVariant(user.role)} 
                              className="px-3 py-1 text-xs font-semibold"
                            >
                              {user.role || 'student'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-foreground">
                            {user.joined_at ? new Date(user.joined_at).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell className="text-foreground">
                            <div className="flex items-center gap-2">
                              <div className="text-lg font-bold text-blue-400">{user.experience_points || 0}</div>
                              <div className="text-xs text-muted-foreground">XP</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-foreground">
                            <div className="flex items-center gap-2">
                              <Select
                                value={user.role || 'student'}
                                onValueChange={(value) => handleRoleChange(user.id, value)}
                              >
                                <SelectTrigger className="w-32 bg-card border-border text-foreground">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border">
                                  <SelectItem value="student" className="text-foreground">Student</SelectItem>
                                  <SelectItem value="teacher" className="text-foreground">Teacher</SelectItem>
                                  <SelectItem value="admin" className="text-foreground">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-card border-border">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-foreground">Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription className="text-muted-foreground">
                                      This will permanently delete user "{user.full_name || user.username}" and all their associated data. This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="bg-accent text-foreground hover:bg-accent/80">Cancel</AlertDialogCancel>
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
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-3 text-xl font-bold text-foreground">
                      <MapPin className="w-6 h-6 text-blue-400" />
                      Roadmap Management
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Create and manage learning roadmaps with associated courses
                    </CardDescription>
                  </div>
                  <Dialog open={isCreateRoadmapOpen} onOpenChange={setIsCreateRoadmapOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg transition-all duration-200">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Roadmap
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card border-border max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-foreground text-xl">Create New Roadmap</DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                          Create a comprehensive learning roadmap with phases, videos, courses, and projects
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-6">
                        {/* Roadmap Basic Info */}
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="roadmap-title" className="text-foreground">Roadmap Title</Label>
                            <Input
                              id="roadmap-title"
                              value={newRoadmap.title}
                              onChange={(e) => setNewRoadmap({ ...newRoadmap, title: e.target.value })}
                              placeholder="e.g., Full Stack Web Development"
                              className="bg-accent/50 border-border text-foreground placeholder-muted-foreground"
                            />
                          </div>
                          <div>
                            <Label htmlFor="roadmap-description" className="text-foreground">Roadmap Description</Label>
                            <Textarea
                              id="roadmap-description"
                              value={newRoadmap.description}
                              onChange={(e) => setNewRoadmap({ ...newRoadmap, description: e.target.value })}
                              placeholder="Describe the complete learning path..."
                              className="bg-accent/50 border-border text-foreground placeholder-muted-foreground"
                              rows={3}
                            />
                          </div>
                        </div>

                        {/* Phase Creation */}
                        <div className="border-l-4 border-blue-500 pl-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-r-lg p-4">
                          <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-4">Add Learning Phase</h4>
                          
                          <div className="space-y-3">
                            <div>
                              <Label htmlFor="phase-title" className="text-foreground">Phase Title</Label>
                              <Input
                                id="phase-title"
                                value={newPhase.title}
                                onChange={(e) => setNewPhase({ ...newPhase, title: e.target.value })}
                                placeholder="e.g., HTML & CSS Fundamentals"
                                className="bg-accent/50 border-border text-foreground placeholder-muted-foreground"
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor="phase-description" className="text-foreground">Phase Description</Label>
                              <Textarea
                                id="phase-description"
                                value={newPhase.description}
                                onChange={(e) => setNewPhase({ ...newPhase, description: e.target.value })}
                                placeholder="Phase description..."
                                className="bg-accent/50 border-border text-foreground placeholder-muted-foreground"
                                rows={2}
                              />
                            </div>

                            <div>
                              <Label htmlFor="phase-duration" className="text-foreground">Estimated Duration</Label>
                              <Input
                                id="phase-duration"
                                value={newPhase.estimated_duration}
                                onChange={(e) => setNewPhase({ ...newPhase, estimated_duration: e.target.value })}
                                placeholder="e.g., 2 weeks"
                                className="bg-accent/50 border-border text-foreground placeholder-muted-foreground"
                              />
                            </div>
                          </div>

                          {/* Content for Phase */}
                          <div className="space-y-4 mt-4">
                            {/* YouTube Videos */}
                            <div className="border-l-4 border-red-500 pl-4">
                              <h5 className="font-medium text-red-700 dark:text-red-300 mb-2">YouTube Videos</h5>
                              <div className="space-y-2 mb-2">
                                <Input
                                  value={newVideo.video_id}
                                  onChange={(e) => setNewVideo({ ...newVideo, video_id: e.target.value })}
                                  placeholder="Paste YouTube video URL"
                                  className="bg-accent/50 border-border text-foreground placeholder-muted-foreground text-sm"
                                />
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
                                      <span className="text-red-800 dark:text-red-200">📹 {video.title || 'Video ' + (index + 1)}</span>
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

                            {/* Coursera Links */}
                            <div className="border-l-4 border-purple-500 pl-4">
                              <h5 className="font-medium text-purple-700 dark:text-purple-300 mb-2">Online Courses</h5>
                              <div className="space-y-2 mb-2">
                                <Input
                                  value={newCoursera.url}
                                  onChange={(e) => setNewCoursera({ ...newCoursera, url: e.target.value })}
                                  placeholder="Paste course URL (Coursera, edX, Udemy, etc.)"
                                  className="bg-accent/50 border-border text-foreground placeholder-muted-foreground text-sm"
                                />
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
                                      <span className="text-purple-800 dark:text-purple-200">🎓 {course.title || 'Course ' + (index + 1)}</span>
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

                            {/* IDE Projects */}
                            <div className="border-l-4 border-green-500 pl-4">
                              <h5 className="font-medium text-green-700 dark:text-green-300 mb-2">Coding Projects</h5>
                              <div className="space-y-2 mb-2">
                                <Input
                                  value={newIDEProject.title}
                                  onChange={(e) => setNewIDEProject({ ...newIDEProject, title: e.target.value })}
                                  placeholder="Project title"
                                  className="bg-accent/50 border-border text-foreground placeholder-muted-foreground text-sm"
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  <Input
                                    value={newIDEProject.language}
                                    onChange={(e) => setNewIDEProject({ ...newIDEProject, language: e.target.value })}
                                    placeholder="Language (e.g., JavaScript)"
                                    className="bg-accent/50 border-border text-foreground placeholder-muted-foreground text-sm"
                                  />
                                  <Select
                                    value={newIDEProject.difficulty}
                                    onValueChange={(value: 'Beginner' | 'Intermediate' | 'Advanced') => {
                                      setNewIDEProject({ ...newIDEProject, difficulty: value });
                                    }}
                                  >
                                    <SelectTrigger className="w-full bg-accent/50 border-border text-foreground text-sm">
                                      <SelectValue placeholder="Difficulty" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-accent border-border">
                                      <SelectItem value="Beginner" className="text-foreground">Beginner</SelectItem>
                                      <SelectItem value="Intermediate" className="text-foreground">Intermediate</SelectItem>
                                      <SelectItem value="Advanced" className="text-foreground">Advanced</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <Textarea
                                  value={newIDEProject.instructions}
                                  onChange={(e) => setNewIDEProject({ ...newIDEProject, instructions: e.target.value })}
                                  placeholder="Project instructions..."
                                  className="bg-accent/50 border-border text-foreground placeholder-muted-foreground text-sm"
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
                                      <span className="text-green-800 dark:text-green-200">💻 {project.title || 'Project ' + (index + 1)}</span>
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

                          {/* Existing Phases */}
                          {newRoadmap.phases.length > 0 && (
                            <div className="space-y-3 mt-4">
                              <h4 className="font-medium text-blue-700 dark:text-blue-300">Current Phases</h4>
                              {newRoadmap.phases.map((phase, index) => (
                                <div key={phase.id} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                  <div className="flex items-center justify-between mb-2">
                                    <h5 className="font-medium text-blue-800 dark:text-blue-200">
                                      Phase {index + 1}: {phase.title}
                                    </h5>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => removePhase(index)}
                                      className="border-red-300 text-red-600 hover:bg-red-100"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                  <div className="text-sm text-blue-600 dark:text-blue-400">
                                    {phase.youtube_videos.length} videos, {phase.coursera_links.length} courses, {phase.ide_projects.length} projects
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateRoadmapOpen(false)} className="bg-accent text-foreground hover:bg-accent/80">
                          Cancel
                        </Button>
                        <Button onClick={handleCreateRoadmap} className="bg-blue-500 hover:bg-blue-600 text-white" disabled={!newRoadmap.title || newRoadmap.phases.length === 0}>
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
                      <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <h3 className="text-xl font-semibold text-foreground mb-2">No roadmaps created yet</h3>
                      <p className="text-muted-foreground">Create your first roadmap to get started with building learning paths.</p>
                      <Button 
                        onClick={() => setIsCreateRoadmapOpen(true)}
                        className="bg-blue-500 hover:bg-blue-600 text-white mt-4"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Roadmap
                      </Button>
                    </div>
                  ) : (
                    roadmaps.map((roadmap) => (
                      <Card key={roadmap.id} className="group hover:shadow-lg transition-all duration-300 hover:scale-102 border-border/50">
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between text-lg font-semibold text-foreground">
                            <span className="flex items-center gap-2">
                              <MapPin className="w-5 h-5 text-blue-400" />
                              {roadmap.title}
                            </span>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="border-border text-muted-foreground hover:bg-accent/50">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm" className="border-red-500/50 text-red-400 hover:bg-red-500/10">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardTitle>
                          <CardDescription className="text-muted-foreground">{roadmap.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="text-sm text-blue-600 dark:text-blue-400">
                              {roadmap.phases?.length || 0} phases
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {roadmap.phases?.reduce((total, phase) => 
                                total + (phase.youtube_videos?.length || 0) + 
                                       (phase.coursera_links?.length || 0) + 
                                       (phase.ide_projects?.length || 0), 0) || 0} total resources
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

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-6">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-3 text-xl font-bold text-foreground">
                      <BookOpen className="w-6 h-6 text-green-400" />
                      Course Management
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Create and manage courses for roadmaps
                    </CardDescription>
                  </div>
                  <Dialog open={isCreateCourseOpen} onOpenChange={setIsCreateCourseOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-green-500 hover:bg-green-600 text-white shadow-lg transition-all duration-200">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Course
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card border-border">
                      <DialogHeader>
                        <DialogTitle className="text-foreground text-xl">Create New Course</DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                          Create a new course that can be added to roadmaps
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="course-title" className="text-foreground">Title</Label>
                          <Input
                            id="course-title"
                            value={newCourse.title}
                            onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                            placeholder="e.g., Introduction to React"
                            className="bg-accent/50 border-border text-foreground placeholder-muted-foreground"
                          />
                        </div>
                        <div>
                          <Label htmlFor="course-description" className="text-foreground">Description</Label>
                          <Textarea
                            id="course-description"
                            value={newCourse.description}
                            onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                            placeholder="Describe the course content..."
                            className="bg-accent/50 border-border text-foreground placeholder-muted-foreground"
                            rows={4}
                          />
                        </div>
                        <div>
                          <Label htmlFor="course-duration" className="text-foreground">Duration</Label>
                          <Input
                            id="course-duration"
                            value={newCourse.estimated_duration}
                            onChange={(e) => setNewCourse({ ...newCourse, estimated_duration: e.target.value })}
                            placeholder="e.g., 4 weeks"
                            className="bg-accent/50 border-border text-foreground placeholder-muted-foreground"
                          />
                        </div>
                        <div>
                          <Label htmlFor="course-difficulty" className="text-foreground">Difficulty</Label>
                          <Select
                            value={newCourse.difficulty_level}
                            onValueChange={(value: 'Beginner' | 'Intermediate' | 'Advanced') => 
                              setNewCourse({ ...newCourse, difficulty_level: value })
                            }
                          >
                            <SelectTrigger className="w-40 bg-accent/50 border-border text-foreground">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border">
                              <SelectItem value="Beginner" className="text-foreground">Beginner</SelectItem>
                              <SelectItem value="Intermediate" className="text-foreground">Intermediate</SelectItem>
                              <SelectItem value="Advanced" className="text-foreground">Advanced</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateCourseOpen(false)} className="bg-accent text-foreground hover:bg-accent/80">
                          Cancel
                        </Button>
                        <Button onClick={handleCreateCourse} className="bg-green-500 hover:bg-green-600 text-white">
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
                      <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <h3 className="text-xl font-semibold text-foreground mb-2">No courses created yet</h3>
                      <p className="text-muted-foreground">Create your first course to start building your learning library.</p>
                      <Button 
                        onClick={() => setIsCreateCourseOpen(true)}
                        className="bg-green-500 hover:bg-green-600 text-white mt-4"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Course
                      </Button>
                    </div>
                  ) : (
                    courses.map((course) => (
                      <Card key={course.id} className="group hover:shadow-lg transition-all duration-300 hover:scale-102 border-border/50">
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between text-lg font-semibold text-foreground">
                            <span className="flex items-center gap-2">
                              <BookOpen className="w-5 h-5 text-green-400" />
                              {course.title}
                            </span>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="border-border text-muted-foreground hover:bg-accent/50">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm" className="border-red-500/50 text-red-400 hover:bg-red-500/10">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardTitle>
                          <CardDescription className="text-muted-foreground">{course.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <span className="text-sm">⏱</span>
                                <span>{course.estimated_duration}</span>
                              </div>
                              <Badge 
                                variant={course.difficulty_level === 'Beginner' ? 'secondary' : course.difficulty_level === 'Intermediate' ? 'default' : 'destructive'}
                                className="ml-2"
                              >
                                {course.difficulty_level}
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
                  {users
                    .sort((a, b) => (b.experience_points || 0) - (a.experience_points || 0))
                    .map((user, index) => (
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
    </>
  );
};

export default AdminDashboard;
