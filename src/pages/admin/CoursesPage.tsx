import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getAllCourses, createCourse, deleteCourse, Course } from '@/integrations/firebase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BookOpen, Plus, Edit, Trash2, Shield } from 'lucide-react';
import Navbar from '@/components/Navbar';

const CoursesPage = () => {
  const { userProfile } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateCourseOpen, setIsCreateCourseOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: '', description: '', duration: '', difficulty: 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced' });

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
      const coursesData = await getAllCourses();
      setCourses(coursesData);
    } catch (error) {
      console.error('Failed to load courses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateCourse = async () => {
    try {
      const courseData = {
        title: newCourse.title,
        description: newCourse.description,
        duration: newCourse.duration,
        difficulty: newCourse.difficulty,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      await createCourse(courseData);
      setNewCourse({ title: '', description: '', duration: '', difficulty: 'Beginner' });
      setIsCreateCourseOpen(false);
      await loadData(); // Reload data to show new course
    } catch (error) {
      console.error('Failed to create course:', error);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-golden"></div>
            <p className="mt-4 text-lg text-muted-foreground">Loading courses...</p>
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Course Management</h1>
                  <p className="text-muted-foreground">Create and manage courses for roadmaps</p>
                </div>
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
                      <Label htmlFor="course-title" className="text-cyan-700 dark:text-cyan-300">Title</Label>
                      <Input
                        id="course-title"
                        value={newCourse.title}
                        onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                        placeholder="e.g., Introduction to React"
                        className="bg-cyan-100 dark:bg-cyan-800/50 border-cyan-300 dark:border-cyan-600 text-cyan-800 dark:text-cyan-200"
                      />
                    </div>
                    <div>
                      <Label htmlFor="course-description" className="text-cyan-700 dark:text-cyan-300">Description</Label>
                      <Textarea
                        id="course-description"
                        value={newCourse.description}
                        onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                        placeholder="Describe the course content..."
                        className="bg-cyan-100 dark:bg-cyan-800/50 border-cyan-300 dark:border-cyan-600 text-cyan-800 dark:text-cyan-200"
                        rows={4}
                      />
                    </div>
                    <div>
                      <Label htmlFor="course-duration" className="text-cyan-700 dark:text-cyan-300">Duration</Label>
                      <Input
                        id="course-duration"
                        value={newCourse.duration}
                        onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
                        placeholder="e.g., 4 weeks"
                        className="bg-cyan-100 dark:bg-cyan-800/50 border-cyan-300 dark:border-cyan-600 text-cyan-800 dark:text-cyan-200"
                      />
                    </div>
                    <div>
                      <Label htmlFor="course-difficulty" className="text-cyan-700 dark:text-cyan-300">Difficulty</Label>
                      <Select
                        value={newCourse.difficulty}
                        onValueChange={(value: 'Beginner' | 'Intermediate' | 'Advanced') => {
                          setNewCourse({ ...newCourse, difficulty: value });
                        }}
                      >
                        <SelectTrigger className="w-full bg-cyan-100 dark:bg-cyan-800/50 border-cyan-300 dark:border-cyan-600 text-cyan-800 dark:text-cyan-200">
                          <SelectValue placeholder="Select difficulty" />
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
          </div>

          {/* Courses Grid */}
          <div className="space-y-6">
            {courses.length === 0 ? (
              <div className="text-center py-12">
                <div className="p-4 bg-cyan-100 dark:bg-cyan-800/30 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <BookOpen className="w-12 h-12 text-cyan-400" />
                </div>
                <h3 className="text-2xl font-bold text-cyan-800 dark:text-cyan-200 mb-3">No courses created yet</h3>
                <p className="text-cyan-600 dark:text-cyan-400 mb-6 max-w-md mx-auto">
                  Create your first course to start building your learning library.
                </p>
                <Button 
                  onClick={() => setIsCreateCourseOpen(true)}
                  className="bg-cyan-500 hover:bg-cyan-600 text-white shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Course
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
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
                      <div className="space-y-4">
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
                        <div className="flex justify-between text-xs text-cyan-600 dark:text-cyan-400">
                          <span>Course ID: {course.id}</span>
                          <span>Difficulty: {course.difficulty}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CoursesPage;
