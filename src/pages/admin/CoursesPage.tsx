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
import { BookOpen, Plus, Edit, Trash2, Shield, FileText, Video, Upload, X, Link } from 'lucide-react';
import Navbar from '@/components/Navbar';

const CoursesPage = () => {
  const { userProfile } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateCourseOpen, setIsCreateCourseOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    category: '',
    difficulty_level: 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced',
    estimated_duration: '',
    prerequisites: '',
    learning_objectives: '',
    target_audience: '',
    tags: '',
    instructor_name: '',
    instructor_bio: '',
    language: 'English',
    documents: [] as File[],
    youtubeLinks: [] as string[]
  });

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
        category: newCourse.category,
        difficulty_level: newCourse.difficulty_level,
        estimated_duration: newCourse.estimated_duration,
        prerequisites: newCourse.prerequisites.split(',').map(p => p.trim()).filter(p => p),
        learning_objectives: newCourse.learning_objectives.split('\n').map(obj => obj.trim()).filter(obj => obj),
        target_audience: newCourse.target_audience.split(',').map(a => a.trim()).filter(a => a),
        tags: newCourse.tags.split(',').map(t => t.trim()).filter(t => t),
        thumbnail_url: null,
        instructor_name: newCourse.instructor_name,
        instructor_bio: newCourse.instructor_bio,
        language: newCourse.language,
        rating: 0,
        enrollment_count: 0,
        completion_rate: 0,
        modules: [], // Empty modules array - can be added later
        documents: [], // Will be populated with document URLs after upload
        youtubeLinks: newCourse.youtubeLinks, // YouTube links for course content
        is_active: true
      };
      await createCourse(courseData);
      setNewCourse({
        title: '',
        description: '',
        category: '',
        difficulty_level: 'Beginner',
        estimated_duration: '',
        prerequisites: '',
        learning_objectives: '',
        target_audience: '',
        tags: '',
        instructor_name: '',
        instructor_bio: '',
        language: 'English',
        documents: [],
        youtubeLinks: []
      });
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
                  <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
                    <div>
                      <Label htmlFor="course-title" className="text-cyan-700 dark:text-cyan-300">Course Title</Label>
                      <Input
                        id="course-title"
                        value={newCourse.title}
                        onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                        placeholder="e.g., Introduction to React"
                        className="bg-cyan-100 dark:bg-cyan-800/50 border-cyan-300 dark:border-cyan-600 text-cyan-800 dark:text-cyan-200"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="course-category" className="text-cyan-700 dark:text-cyan-300">Category</Label>
                      <Input
                        id="course-category"
                        value={newCourse.category}
                        onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
                        placeholder="e.g., Web Development, Data Science, Mobile Development"
                        className="bg-cyan-100 dark:bg-cyan-800/50 border-cyan-300 dark:border-cyan-600 text-cyan-800 dark:text-cyan-200"
                      />
                    </div>

                    <div>
                      <Label htmlFor="course-description" className="text-cyan-700 dark:text-cyan-300">Description</Label>
                      <Textarea
                        id="course-description"
                        value={newCourse.description}
                        onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                        placeholder="Describe the course content and what students will learn..."
                        className="bg-cyan-100 dark:bg-cyan-800/50 border-cyan-300 dark:border-cyan-600 text-cyan-800 dark:text-cyan-200"
                        rows={4}
                      />
                    </div>

                    <div>
                      <Label htmlFor="course-duration" className="text-cyan-700 dark:text-cyan-300">Estimated Duration</Label>
                      <Input
                        id="course-duration"
                        value={newCourse.estimated_duration}
                        onChange={(e) => setNewCourse({ ...newCourse, estimated_duration: e.target.value })}
                        placeholder="e.g., 4 weeks, 2 months"
                        className="bg-cyan-100 dark:bg-cyan-800/50 border-cyan-300 dark:border-cyan-600 text-cyan-800 dark:text-cyan-200"
                      />
                    </div>

                    <div>
                      <Label htmlFor="course-difficulty" className="text-cyan-700 dark:text-cyan-300">Difficulty Level</Label>
                      <Select
                        value={newCourse.difficulty_level}
                        onValueChange={(value: 'Beginner' | 'Intermediate' | 'Advanced') => {
                          setNewCourse({ ...newCourse, difficulty_level: value });
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

                    <div>
                      <Label htmlFor="course-prerequisites" className="text-cyan-700 dark:text-cyan-300">Prerequisites</Label>
                      <Textarea
                        id="course-prerequisites"
                        value={newCourse.prerequisites}
                        onChange={(e) => setNewCourse({ ...newCourse, prerequisites: e.target.value })}
                        placeholder="Enter prerequisites separated by commas (e.g., Basic HTML, CSS, JavaScript)"
                        className="bg-cyan-100 dark:bg-cyan-800/50 border-cyan-300 dark:border-cyan-600 text-cyan-800 dark:text-cyan-200"
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label htmlFor="course-objectives" className="text-cyan-700 dark:text-cyan-300">Learning Objectives</Label>
                      <Textarea
                        id="course-objectives"
                        value={newCourse.learning_objectives}
                        onChange={(e) => setNewCourse({ ...newCourse, learning_objectives: e.target.value })}
                        placeholder="Enter learning objectives (one per line)"
                        className="bg-cyan-100 dark:bg-cyan-800/50 border-cyan-300 dark:border-cyan-600 text-cyan-800 dark:text-cyan-200"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="course-audience" className="text-cyan-700 dark:text-cyan-300">Target Audience</Label>
                      <Textarea
                        id="course-audience"
                        value={newCourse.target_audience}
                        onChange={(e) => setNewCourse({ ...newCourse, target_audience: e.target.value })}
                        placeholder="Enter target audience separated by commas (e.g., Beginners, Web Developers, Students)"
                        className="bg-cyan-100 dark:bg-cyan-800/50 border-cyan-300 dark:border-cyan-600 text-cyan-800 dark:text-cyan-200"
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label htmlFor="course-tags" className="text-cyan-700 dark:text-cyan-300">Tags</Label>
                      <Input
                        id="course-tags"
                        value={newCourse.tags}
                        onChange={(e) => setNewCourse({ ...newCourse, tags: e.target.value })}
                        placeholder="Enter tags separated by commas (e.g., React, JavaScript, Frontend)"
                        className="bg-cyan-100 dark:bg-cyan-800/50 border-cyan-300 dark:border-cyan-600 text-cyan-800 dark:text-cyan-200"
                      />
                    </div>

                    <div>
                      <Label htmlFor="course-instructor" className="text-cyan-700 dark:text-cyan-300">Instructor Name</Label>
                      <Input
                        id="course-instructor"
                        value={newCourse.instructor_name}
                        onChange={(e) => setNewCourse({ ...newCourse, instructor_name: e.target.value })}
                        placeholder="Enter instructor name"
                        className="bg-cyan-100 dark:bg-cyan-800/50 border-cyan-300 dark:border-cyan-600 text-cyan-800 dark:text-cyan-200"
                      />
                    </div>

                    <div>
                      <Label htmlFor="course-instructor-bio" className="text-cyan-700 dark:text-cyan-300">Instructor Bio</Label>
                      <Textarea
                        id="course-instructor-bio"
                        value={newCourse.instructor_bio}
                        onChange={(e) => setNewCourse({ ...newCourse, instructor_bio: e.target.value })}
                        placeholder="Enter instructor bio and qualifications"
                        className="bg-cyan-100 dark:bg-cyan-800/50 border-cyan-300 dark:border-cyan-600 text-cyan-800 dark:text-cyan-200"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="course-language" className="text-cyan-700 dark:text-cyan-300">Language</Label>
                      <Select
                        value={newCourse.language}
                        onValueChange={(value) => {
                          setNewCourse({ ...newCourse, language: value });
                        }}
                      >
                        <SelectTrigger className="w-full bg-cyan-100 dark:bg-cyan-800/50 border-cyan-300 dark:border-cyan-600 text-cyan-800 dark:text-cyan-200">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent className="bg-cyan-50 dark:bg-cyan-900 border-cyan-300 dark:border-cyan-600">
                          <SelectItem value="English" className="text-cyan-800 dark:text-cyan-200">English</SelectItem>
                          <SelectItem value="Spanish" className="text-cyan-800 dark:text-cyan-200">Spanish</SelectItem>
                          <SelectItem value="French" className="text-cyan-800 dark:text-cyan-200">French</SelectItem>
                          <SelectItem value="German" className="text-cyan-800 dark:text-cyan-200">German</SelectItem>
                          <SelectItem value="Chinese" className="text-cyan-800 dark:text-cyan-200">Chinese</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Document Upload */}
                    <div>
                      <Label className="text-cyan-700 dark:text-cyan-300">Course Documents</Label>
                      <div className="border-2 border-dashed border-cyan-300 dark:border-cyan-600 rounded-lg p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-cyan-600 dark:text-cyan-400">Upload PDF, DOC, or other documents</span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => document.getElementById('document-upload')?.click()}
                              className="border-cyan-300 text-cyan-600 hover:bg-cyan-50"
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Upload
                            </Button>
                          </div>
                          <input
                            id="document-upload"
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              setNewCourse({ ...newCourse, documents: [...newCourse.documents, ...files] });
                            }}
                            className="hidden"
                          />
                          {newCourse.documents.length > 0 && (
                            <div className="space-y-1">
                              {newCourse.documents.map((file, index) => (
                                <div key={index} className="flex items-center justify-between bg-cyan-50 dark:bg-cyan-900/20 p-2 rounded">
                                  <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-cyan-500" />
                                    <span className="text-sm text-cyan-700 dark:text-cyan-300">{file.name}</span>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setNewCourse({
                                        ...newCourse,
                                        documents: newCourse.documents.filter((_, i) => i !== index)
                                      });
                                    }}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* YouTube Links */}
                    <div>
                      <Label className="text-cyan-700 dark:text-cyan-300">Course Videos (YouTube Links)</Label>
                      <div className="border-2 border-dashed border-cyan-300 dark:border-cyan-600 rounded-lg p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-cyan-600 dark:text-cyan-400">Add YouTube video links for course content</span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newLink = prompt('Enter YouTube URL (e.g., https://www.youtube.com/watch?v=VIDEO_ID)');
                                if (newLink && newLink.includes('youtube.com/watch?v=')) {
                                  setNewCourse({ ...newCourse, youtubeLinks: [...newCourse.youtubeLinks, newLink] });
                                }
                              }}
                              className="border-cyan-300 text-cyan-600 hover:bg-cyan-50"
                            >
                              <Link className="w-4 h-4 mr-2" />
                              Add Link
                            </Button>
                          </div>
                          {newCourse.youtubeLinks.length > 0 && (
                            <div className="space-y-1">
                              {newCourse.youtubeLinks.map((link, index) => (
                                <div key={index} className="flex items-center justify-between bg-cyan-50 dark:bg-cyan-900/20 p-2 rounded">
                                  <div className="flex items-center gap-2">
                                    <Video className="w-4 h-4 text-cyan-500" />
                                    <span className="text-sm text-cyan-700 dark:text-cyan-300 truncate max-w-xs">
                                      {link}
                                    </span>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setNewCourse({
                                        ...newCourse,
                                        youtubeLinks: newCourse.youtubeLinks.filter((_, i) => i !== index)
                                      });
                                    }}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
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
                        <div className="flex justify-between text-xs text-cyan-600 dark:text-cyan-400">
                          <span>Course ID: {course.id}</span>
                          <span>Difficulty: {course.difficulty_level}</span>
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
