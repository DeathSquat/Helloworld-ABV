import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getAllUsers, UserProfile } from '@/integrations/firebase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, UserCheck, GraduationCap, Users, Shield } from 'lucide-react';
import Navbar from '@/components/Navbar';

const LeaderboardPage = () => {
  const { userProfile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
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
      const usersData = await getAllUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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

  const sortedUsers = users.sort((a, b) => (b.experience_points || 0) - (a.experience_points || 0));

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-golden"></div>
            <p className="mt-4 text-lg text-muted-foreground">Loading leaderboard...</p>
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
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Complete Leaderboard</h1>
                <p className="text-muted-foreground">Top performers across all users with their experience points and achievements</p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-200 dark:border-yellow-700">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-4xl mb-2">🥇</div>
                  <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                    {sortedUsers[0]?.full_name || sortedUsers[0]?.username || 'N/A'}
                  </h3>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {sortedUsers[0]?.experience_points || 0} XP
                  </p>
                  <Badge 
                    variant={getRoleBadgeVariant(sortedUsers[0]?.role)} 
                    className="mt-2"
                  >
                    {sortedUsers[0]?.role || 'student'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-4xl mb-2">🥈</div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">
                    {sortedUsers[1]?.full_name || sortedUsers[1]?.username || 'N/A'}
                  </h3>
                  <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                    {sortedUsers[1]?.experience_points || 0} XP
                  </p>
                  <Badge 
                    variant={getRoleBadgeVariant(sortedUsers[1]?.role)} 
                    className="mt-2"
                  >
                    {sortedUsers[1]?.role || 'student'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-700">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-4xl mb-2">🥉</div>
                  <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-1">
                    {sortedUsers[2]?.full_name || sortedUsers[2]?.username || 'N/A'}
                  </h3>
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {sortedUsers[2]?.experience_points || 0} XP
                  </p>
                  <Badge 
                    variant={getRoleBadgeVariant(sortedUsers[2]?.role)} 
                    className="mt-2"
                  >
                    {sortedUsers[2]?.role || 'student'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Full Leaderboard */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <Trophy className="w-5 h-5" />
                All Users Ranking ({sortedUsers.length})
              </CardTitle>
              <CardDescription className="text-green-600 dark:text-green-300">
                Complete ranking of all users based on their experience points
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sortedUsers.map((user, index) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-800/30 dark:to-emerald-800/30 rounded-lg border border-green-200 dark:border-green-600 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center gap-4">
                      <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-sm shadow-md ${
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
                        <div className="text-xl font-bold text-green-600 dark:text-green-400">{user.experience_points || 0}</div>
                        <div className="text-xs text-green-500 dark:text-green-500">XP</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-green-700 dark:text-green-300">{user.learning_streak || 0}</div>
                        <div className="text-xs text-green-500 dark:text-green-500">Day Streak</div>
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
        </div>
      </div>
    </>
  );
};

export default LeaderboardPage;
