import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getAllUsers, updateUserRole, deleteUser, UserProfile } from '@/integrations/firebase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Users, UserCheck, UserX, GraduationCap, Trash2, Edit, Shield } from 'lucide-react';
import Navbar from '@/components/Navbar';

const UsersPage = () => {
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
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-golden"></div>
            <p className="mt-4 text-lg text-muted-foreground">Loading users...</p>
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
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">User Management</h1>
                <p className="text-muted-foreground">View and manage all registered users and their roles</p>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <Users className="w-5 h-5" />
                All Users ({users.length})
              </CardTitle>
              <CardDescription className="text-blue-600 dark:text-blue-300">
                Manage user roles, permissions, and account settings
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
                      <TableHead className="text-blue-800 dark:text-blue-200 font-semibold">Joined</TableHead>
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
                          {user.joined_at ? new Date(user.joined_at).toLocaleDateString() : 'N/A'}
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
        </div>
      </div>
    </>
  );
};

export default UsersPage;
