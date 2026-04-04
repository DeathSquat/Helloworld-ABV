import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getAllUsers, getUserStats, getAllRoadmaps, getAllCourses } from '@/integrations/firebase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  GraduationCap, 
  UserCheck, 
  MapPin, 
  BookOpen, 
  Trophy,
  Target,
  TrendingUp,
  Shield
} from 'lucide-react';
import Navbar from '@/components/Navbar';

const AdminDashboardPage = () => {
  const { userProfile } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Check if user is admin
  if (!userProfile || userProfile.role !== 'admin') {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <Shield className="w-12 h-12 mx-auto text-red-500 mb-2" />
              <CardTitle className="text-2xl font-bold text-red-600">Access Denied</CardTitle>
              <CardDescription>
                You don't have permission to access this page. This area is restricted to administrators only.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button onClick={() => window.location.href = '/dashboard'}>
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
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

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-golden"></div>
            <p className="mt-4 text-lg text-muted-foreground">Loading admin dashboard...</p>
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
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-golden-500 to-amber-500 rounded-xl">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-muted-foreground">Complete control over your learning platform</p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
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

          {/* Quick Actions & Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-golden-50 to-amber-50 dark:from-golden-900/20 dark:to-amber-900/20 border-golden-200 dark:border-golden-700 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-golden-600 dark:text-golden-400">
                  <Target className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/admin/users">
                  <Button className="w-full justify-start bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg transition-all duration-200">
                    <Users className="w-4 h-4 mr-2" />
                    Manage Users
                  </Button>
                </Link>
                <Link to="/admin/roadmaps">
                  <Button className="w-full justify-start bg-amber-500 hover:bg-amber-600 text-white shadow-md hover:shadow-lg transition-all duration-200">
                    <MapPin className="w-4 h-4 mr-2" />
                    Create Roadmap
                  </Button>
                </Link>
                <Link to="/admin/courses">
                  <Button className="w-full justify-start bg-cyan-500 hover:bg-cyan-600 text-white shadow-md hover:shadow-lg transition-all duration-200">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Add Course
                  </Button>
                </Link>
                <Link to="/admin/leaderboard">
                  <Button className="w-full justify-start bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg transition-all duration-200">
                    <Trophy className="w-4 h-4 mr-2" />
                    View Leaderboard
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <BarChart3 className="w-5 h-5" />
                  System Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-2 rounded-lg bg-blue-100 dark:bg-blue-800/30">
                    <span className="text-blue-700 dark:text-blue-300 font-medium">Total Users</span>
                    <span className="font-bold text-blue-800 dark:text-blue-200">{stats?.totalUsers || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-amber-100 dark:bg-amber-800/30">
                    <span className="text-amber-700 dark:text-amber-300 font-medium">Active Roadmaps</span>
                    <span className="font-bold text-amber-800 dark:text-amber-200">{roadmaps.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-cyan-100 dark:bg-cyan-800/30">
                    <span className="text-cyan-700 dark:text-cyan-300 font-medium">Available Courses</span>
                    <span className="font-bold text-cyan-800 dark:text-cyan-200">{courses.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-green-100 dark:bg-green-800/30">
                    <span className="text-green-700 dark:text-green-300 font-medium">New Users This Month</span>
                    <span className="font-bold text-green-800 dark:text-green-200">+{stats?.newUsersThisMonth || 0}</span>
                  </div>
                </div>
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
        </div>
      </div>
    </>
  );
};

export default AdminDashboardPage;
