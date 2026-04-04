import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getAllRoadmaps, createRoadmap, deleteRoadmap, updateRoadmap, Roadmap } from '@/integrations/firebase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Plus, Edit, Trash2, Shield, Video, GraduationCap, Laptop, Link, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';

const RoadmapsPage = () => {
  const { userProfile } = useAuth();
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateRoadmapOpen, setIsCreateRoadmapOpen] = useState(false);
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
  const [showVideoSection, setShowVideoSection] = useState(false);
  const [showCourseraSection, setShowCourseraSection] = useState(false);
  const [showIDESection, setShowIDESection] = useState(false);
  const [editingRoadmap, setEditingRoadmap] = useState<Roadmap | null>(null);
  const [isEditRoadmapOpen, setIsEditRoadmapOpen] = useState(false);

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
          </Card>
        </div>
      </>
    );
  }

  const loadData = async () => {
    try {
      const roadmapsData = await getAllRoadmaps();
      setRoadmaps(roadmapsData);
    } catch (error) {
      console.error('Failed to load roadmaps:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userProfile) {
      loadData();
    }
  }, [userProfile]);

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
        thumbnail_url: newRoadmap.thumbnail_url || null,
        instructor_name: newRoadmap.instructor_name || null,
        instructor_bio: newRoadmap.instructor_bio || null,
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
      setIsCreateRoadmapOpen(false);
      await loadData();
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

  const handleEditRoadmap = (roadmap: Roadmap) => {
    setEditingRoadmap(roadmap);
    setNewRoadmap({
      title: roadmap.title,
      description: roadmap.description,
      phases: roadmap.phases,
      category: roadmap.category,
      difficulty_level: roadmap.difficulty_level,
      estimated_duration: roadmap.estimated_duration,
      prerequisites: roadmap.prerequisites,
      learning_objectives: roadmap.learning_objectives,
      target_audience: roadmap.target_audience,
      tags: roadmap.tags,
      thumbnail_url: roadmap.thumbnail_url || '',
      instructor_name: roadmap.instructor_name || '',
      instructor_bio: roadmap.instructor_bio || '',
      language: roadmap.language
    });
    setIsEditRoadmapOpen(true);
  };

  const handleUpdateRoadmap = async () => {
    if (!editingRoadmap) return;
    
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
        thumbnail_url: newRoadmap.thumbnail_url || null,
        instructor_name: newRoadmap.instructor_name || null,
        instructor_bio: newRoadmap.instructor_bio || null,
        language: newRoadmap.language
      };
      await updateRoadmap(editingRoadmap.id, roadmapData);
      setIsEditRoadmapOpen(false);
      setEditingRoadmap(null);
      await loadData();
    } catch (error) {
      console.error('Failed to update roadmap:', error);
    }
  };

  const handleDeleteRoadmap = async (roadmapId: string) => {
    if (window.confirm('Are you sure you want to delete this roadmap? This action cannot be undone.')) {
      try {
        await deleteRoadmap(roadmapId);
        await loadData();
      } catch (error) {
        console.error('Failed to delete roadmap:', error);
      }
    }
  };

  const extractYouTubeVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-golden"></div>
            <div className="flex flex-col gap-2">
              <MapPin className="w-12 h-12 text-golden animate-pulse" />
              <h1 className="text-3xl font-bold text-foreground mt-4">Roadmap Management</h1>
              <p className="text-muted-foreground text-lg">Loading your roadmaps...</p>
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
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                  <MapPin className="w-8 h-8 text-blue-600" />
                  Roadmap Management
                </h1>
                <p className="text-muted-foreground mt-2">
                  Create and manage comprehensive learning roadmaps with phases, videos, courses, and projects
                </p>
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
                    <DialogTitle className="text-foreground">Create New Learning Roadmap</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      Create a comprehensive learning roadmap with phases, videos, courses, and projects
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6">
                    {/* Roadmap Basic Info */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          <Label htmlFor="roadmap-category" className="text-foreground">Category</Label>
                          <Input
                            id="roadmap-category"
                            value={newRoadmap.category}
                            onChange={(e) => setNewRoadmap({ ...newRoadmap, category: e.target.value })}
                            placeholder="e.g., Web Development"
                            className="bg-accent/50 border-border text-foreground placeholder-muted-foreground"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="roadmap-difficulty" className="text-foreground">Difficulty Level</Label>
                          <Select value={newRoadmap.difficulty_level} onValueChange={(value: 'Beginner' | 'Intermediate' | 'Advanced') => setNewRoadmap({ ...newRoadmap, difficulty_level: value })}>
                            <SelectTrigger className="bg-accent/50 border-border text-foreground">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Beginner">Beginner</SelectItem>
                              <SelectItem value="Intermediate">Intermediate</SelectItem>
                              <SelectItem value="Advanced">Advanced</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="roadmap-duration" className="text-foreground">Estimated Duration</Label>
                          <Input
                            id="roadmap-duration"
                            value={newRoadmap.estimated_duration}
                            onChange={(e) => setNewRoadmap({ ...newRoadmap, estimated_duration: e.target.value })}
                            placeholder="e.g., 3 months"
                            className="bg-accent/50 border-border text-foreground placeholder-muted-foreground"
                          />
                        </div>
                        <div>
                          <Label htmlFor="roadmap-language" className="text-foreground">Language</Label>
                          <Input
                            id="roadmap-language"
                            value={newRoadmap.language}
                            onChange={(e) => setNewRoadmap({ ...newRoadmap, language: e.target.value })}
                            placeholder="e.g., English"
                            className="bg-accent/50 border-border text-foreground placeholder-muted-foreground"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="roadmap-description" className="text-foreground">Roadmap Description</Label>
                        <Textarea
                          id="roadmap-description"
                          value={newRoadmap.description}
                          onChange={(e) => setNewRoadmap({ ...newRoadmap, description: e.target.value })}
                          placeholder="Describe what students will learn in this roadmap..."
                          className="bg-accent/50 border-border text-foreground placeholder-muted-foreground"
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="roadmap-instructor" className="text-foreground">Instructor Name</Label>
                          <Input
                            id="roadmap-instructor"
                            value={newRoadmap.instructor_name}
                            onChange={(e) => setNewRoadmap({ ...newRoadmap, instructor_name: e.target.value })}
                            placeholder="e.g., John Doe"
                            className="bg-accent/50 border-border text-foreground placeholder-muted-foreground"
                          />
                        </div>
                        <div>
                          <Label htmlFor="roadmap-thumbnail" className="text-foreground">Thumbnail URL</Label>
                          <Input
                            id="roadmap-thumbnail"
                            value={newRoadmap.thumbnail_url}
                            onChange={(e) => setNewRoadmap({ ...newRoadmap, thumbnail_url: e.target.value })}
                            placeholder="https://example.com/image.jpg"
                            className="bg-accent/50 border-border text-foreground placeholder-muted-foreground"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Phase Creation */}
                    <div className="border-2 border-blue-500 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 shadow-lg">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-white" />
                        </div>
                        <h4 className="text-xl font-bold text-blue-700 dark:text-blue-300">Add Learning Phase</h4>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="phase-title" className="text-foreground font-medium">Phase Title</Label>
                          <Input
                            id="phase-title"
                            value={newPhase.title}
                            onChange={(e) => setNewPhase({ ...newPhase, title: e.target.value })}
                            placeholder="e.g., HTML & CSS Fundamentals"
                            className="bg-white dark:bg-accent/30 border-2 border-border/50 text-foreground placeholder-muted-foreground focus:border-blue-500 transition-colors"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="phase-duration" className="text-foreground font-medium">Estimated Duration</Label>
                          <Input
                            id="phase-duration"
                            value={newPhase.estimated_duration}
                            onChange={(e) => setNewPhase({ ...newPhase, estimated_duration: e.target.value })}
                            placeholder="e.g., 2 weeks"
                            className="bg-white dark:bg-accent/30 border-2 border-border/50 text-foreground placeholder-muted-foreground focus:border-blue-500 transition-colors"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <Label htmlFor="phase-description" className="text-foreground font-medium">Phase Description</Label>
                        <Textarea
                          id="phase-description"
                          value={newPhase.description}
                          onChange={(e) => setNewPhase({ ...newPhase, description: e.target.value })}
                          placeholder="Describe what students will learn in this phase..."
                          className="bg-white dark:bg-accent/30 border-2 border-border/50 text-foreground placeholder-muted-foreground focus:border-blue-500 transition-colors"
                          rows={3}
                        />
                      </div>

                      {/* Resource Sections */}
                      <div className="mt-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <h5 className="font-semibold text-blue-700 dark:text-blue-300">Learning Resources</h5>
                          <div className="flex gap-2">
                            <Button
                              variant={showVideoSection ? "default" : "outline"}
                              size="sm"
                              onClick={() => setShowVideoSection(!showVideoSection)}
                              className={showVideoSection ? "bg-red-500 hover:bg-red-600" : "border-red-500 text-red-500 hover:bg-red-500 hover:text-white"}
                            >
                              <Video className="w-4 h-4 mr-1" />
                              Videos ({newPhase.youtube_videos.length})
                            </Button>
                            <Button
                              variant={showCourseraSection ? "default" : "outline"}
                              size="sm"
                              onClick={() => setShowCourseraSection(!showCourseraSection)}
                              className={showCourseraSection ? "bg-purple-500 hover:bg-purple-600" : "border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white"}
                            >
                              <GraduationCap className="w-4 h-4 mr-1" />
                              Courses ({newPhase.coursera_links.length})
                            </Button>
                            <Button
                              variant={showIDESection ? "default" : "outline"}
                              size="sm"
                              onClick={() => setShowIDESection(!showIDESection)}
                              className={showIDESection ? "bg-green-500 hover:bg-green-600" : "border-green-500 text-green-500 hover:bg-green-500 hover:text-white"}
                            >
                              <Laptop className="w-4 h-4 mr-1" />
                              Projects ({newPhase.ide_projects.length})
                            </Button>
                          </div>
                        </div>

                        {/* Videos Section */}
                        {showVideoSection && (
                          <div className="border-2 border-red-200 bg-red-50/50 dark:bg-red-900/20 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-4">
                              <div className="w-6 h-6 bg-red-500 rounded flex items-center justify-center">
                                <Video className="w-4 h-4 text-white" />
                              </div>
                              <h6 className="font-semibold text-red-700 dark:text-red-300">YouTube Videos</h6>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                              <div>
                                <Label className="text-sm font-medium text-foreground">Video Title</Label>
                                <Input
                                  value={newVideo.title}
                                  onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                                  placeholder="e.g., Introduction to React Hooks"
                                  className="bg-white dark:bg-accent/30 border-2 border-red-200 focus:border-red-500 transition-colors"
                                />
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-foreground">YouTube URL</Label>
                                <Input
                                  value={newVideo.video_id}
                                  onChange={(e) => setNewVideo({ ...newVideo, video_id: e.target.value })}
                                  placeholder="https://youtube.com/watch?v=..."
                                  className="bg-white dark:bg-accent/30 border-2 border-red-200 focus:border-red-500 transition-colors"
                                />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                              <div>
                                <Label className="text-sm font-medium text-foreground">Duration</Label>
                                <Input
                                  value={newVideo.duration}
                                  onChange={(e) => setNewVideo({ ...newVideo, duration: e.target.value })}
                                  placeholder="e.g., 15:30"
                                  className="bg-white dark:bg-accent/30 border-2 border-red-200 focus:border-red-500 transition-colors"
                                />
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-foreground">Thumbnail URL (optional)</Label>
                                <Input
                                  value={newVideo.thumbnail_url}
                                  onChange={(e) => setNewVideo({ ...newVideo, thumbnail_url: e.target.value })}
                                  placeholder="https://..."
                                  className="bg-white dark:bg-accent/30 border-2 border-red-200 focus:border-red-500 transition-colors"
                                />
                              </div>
                              <div className="flex items-end">
                                <Button
                                  onClick={addYouTubeVideoToPhase}
                                  className="bg-red-500 hover:bg-red-600 text-white w-full"
                                  disabled={!newVideo.video_id.trim()}
                                >
                                  <Plus className="w-4 h-4 mr-1" />
                                  Add Video
                                </Button>
                              </div>
                            </div>
                            
                            <div>
                              <Label className="text-sm font-medium text-foreground">Description</Label>
                              <Textarea
                                value={newVideo.description}
                                onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
                                placeholder="Describe what this video covers..."
                                className="bg-white dark:bg-accent/30 border-2 border-red-200 focus:border-red-500 transition-colors"
                                rows={2}
                              />
                            </div>

                            {newPhase.youtube_videos.length > 0 && (
                              <div className="mt-3 space-y-2">
                                <div className="text-sm font-medium text-red-700 dark:text-red-300">Added Videos:</div>
                                {newPhase.youtube_videos.map((video, index) => (
                                  <div key={index} className="flex items-center justify-between p-2 bg-white dark:bg-accent/50 rounded border border-red-200">
                                    <div className="flex items-center gap-2">
                                      <Video className="w-4 h-4 text-red-500" />
                                      <div>
                                        <div className="text-sm font-medium">{video.title || 'Untitled Video'}</div>
                                        <div className="text-xs text-muted-foreground">{video.duration || 'No duration'}</div>
                                      </div>
                                    </div>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setNewPhase({
                                          ...newPhase,
                                          youtube_videos: newPhase.youtube_videos.filter((_, i) => i !== index)
                                        });
                                      }}
                                      className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Coursera Section */}
                        {showCourseraSection && (
                          <div className="border-2 border-purple-200 bg-purple-50/50 dark:bg-purple-900/20 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-4">
                              <div className="w-6 h-6 bg-purple-500 rounded flex items-center justify-center">
                                <GraduationCap className="w-4 h-4 text-white" />
                              </div>
                              <h6 className="font-semibold text-purple-700 dark:text-purple-300">Coursera Courses & Certifications</h6>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                              <div>
                                <Label className="text-sm font-medium text-foreground">Course Title</Label>
                                <Input
                                  value={newCoursera.title}
                                  onChange={(e) => setNewCoursera({ ...newCoursera, title: e.target.value })}
                                  placeholder="e.g., Python for Data Science"
                                  className="bg-white dark:bg-accent/30 border-2 border-purple-200 focus:border-purple-500 transition-colors"
                                />
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-foreground">Course URL</Label>
                                <Input
                                  value={newCoursera.url}
                                  onChange={(e) => setNewCoursera({ ...newCoursera, url: e.target.value })}
                                  placeholder="https://coursera.org/learn/..."
                                  className="bg-white dark:bg-accent/30 border-2 border-purple-200 focus:border-purple-500 transition-colors"
                                />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                              <div>
                                <Label className="text-sm font-medium text-foreground">Provider</Label>
                                <Input
                                  value={newCoursera.provider}
                                  onChange={(e) => setNewCoursera({ ...newCoursera, provider: e.target.value })}
                                  placeholder="e.g., Coursera"
                                  className="bg-white dark:bg-accent/30 border-2 border-purple-200 focus:border-purple-500 transition-colors"
                                />
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-foreground">Duration</Label>
                                <Input
                                  value={newCoursera.duration}
                                  onChange={(e) => setNewCoursera({ ...newCoursera, duration: e.target.value })}
                                  placeholder="e.g., 6 weeks"
                                  className="bg-white dark:bg-accent/30 border-2 border-purple-200 focus:border-purple-500 transition-colors"
                                />
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-foreground">Difficulty</Label>
                                <Select value={newCoursera.difficulty} onValueChange={(value: 'Beginner' | 'Intermediate' | 'Advanced') => setNewCoursera({ ...newCoursera, difficulty: value })}>
                                  <SelectTrigger className="bg-white dark:bg-accent/30 border-2 border-purple-200 focus:border-purple-500 text-sm">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Beginner">Beginner</SelectItem>
                                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                                    <SelectItem value="Advanced">Advanced</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex items-end">
                                <Button
                                  onClick={addCourseraLinkToPhase}
                                  className="bg-purple-500 hover:bg-purple-600 text-white w-full"
                                  disabled={!newCoursera.url.trim()}
                                >
                                  <Plus className="w-4 h-4 mr-1" />
                                  Add Course
                                </Button>
                              </div>
                            </div>
                            
                            <div>
                              <Label className="text-sm font-medium text-foreground">Description</Label>
                              <Textarea
                                value={newCoursera.description}
                                onChange={(e) => setNewCoursera({ ...newCoursera, description: e.target.value })}
                                placeholder="Describe what this course covers..."
                                className="bg-white dark:bg-accent/30 border-2 border-purple-200 focus:border-purple-500 transition-colors"
                                rows={2}
                              />
                            </div>

                            {newPhase.coursera_links.length > 0 && (
                              <div className="mt-3 space-y-2">
                                <div className="text-sm font-medium text-purple-700 dark:text-purple-300">Added Courses:</div>
                                {newPhase.coursera_links.map((course, index) => (
                                  <div key={index} className="flex items-center justify-between p-2 bg-white dark:bg-accent/50 rounded border border-purple-200">
                                    <div className="flex items-center gap-2">
                                      <GraduationCap className="w-4 h-4 text-purple-500" />
                                      <div>
                                        <div className="text-sm font-medium">{course.title || 'Untitled Course'}</div>
                                        <div className="text-xs text-muted-foreground">{course.provider} • {course.difficulty} • {course.duration}</div>
                                      </div>
                                    </div>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setNewPhase({
                                          ...newPhase,
                                          coursera_links: newPhase.coursera_links.filter((_, i) => i !== index)
                                        });
                                      }}
                                      className="border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* IDE Projects Section */}
                        {showIDESection && (
                          <div className="border-2 border-green-200 bg-green-50/50 dark:bg-green-900/20 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-4">
                              <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center">
                                <Laptop className="w-4 h-4 text-white" />
                              </div>
                              <h6 className="font-semibold text-green-700 dark:text-green-300">IDE Projects & Coding Exercises</h6>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                              <div>
                                <Label className="text-sm font-medium text-foreground">Project Title</Label>
                                <Input
                                  value={newIDEProject.title}
                                  onChange={(e) => setNewIDEProject({ ...newIDEProject, title: e.target.value })}
                                  placeholder="e.g., Build a Todo App"
                                  className="bg-white dark:bg-accent/30 border-2 border-green-200 focus:border-green-500 transition-colors"
                                />
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-foreground">Programming Language</Label>
                                <Input
                                  value={newIDEProject.language}
                                  onChange={(e) => setNewIDEProject({ ...newIDEProject, language: e.target.value })}
                                  placeholder="e.g., JavaScript, Python"
                                  className="bg-white dark:bg-accent/30 border-2 border-green-200 focus:border-green-500 transition-colors"
                                />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                              <div>
                                <Label className="text-sm font-medium text-foreground">Difficulty</Label>
                                <Select value={newIDEProject.difficulty} onValueChange={(value: 'Beginner' | 'Intermediate' | 'Advanced') => setNewIDEProject({ ...newIDEProject, difficulty: value })}>
                                  <SelectTrigger className="bg-white dark:bg-accent/30 border-2 border-green-200 focus:border-green-500 text-sm">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Beginner">Beginner</SelectItem>
                                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                                    <SelectItem value="Advanced">Advanced</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="md:col-span-2">
                                <Label className="text-sm font-medium text-foreground">Project Description</Label>
                                <Textarea
                                  value={newIDEProject.description}
                                  onChange={(e) => setNewIDEProject({ ...newIDEProject, description: e.target.value })}
                                  placeholder="Describe what students will build..."
                                  className="bg-white dark:bg-accent/30 border-2 border-green-200 focus:border-green-500 transition-colors"
                                  rows={2}
                                />
                              </div>
                            </div>

                            <div className="mb-3">
                              <Label className="text-sm font-medium text-foreground">Instructions & Requirements</Label>
                              <Textarea
                                value={newIDEProject.instructions}
                                onChange={(e) => setNewIDEProject({ ...newIDEProject, instructions: e.target.value })}
                                placeholder="Detailed instructions for completing the project..."
                                className="bg-white dark:bg-accent/30 border-2 border-green-200 focus:border-green-500 transition-colors"
                                rows={3}
                              />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                              <div>
                                <Label className="text-sm font-medium text-foreground">Starter Code (optional)</Label>
                                <Textarea
                                  value={newIDEProject.starter_code}
                                  onChange={(e) => setNewIDEProject({ ...newIDEProject, starter_code: e.target.value })}
                                  placeholder="Initial code to help students get started..."
                                  className="bg-white dark:bg-accent/30 border-2 border-green-200 focus:border-green-500 text-sm font-mono text-xs"
                                  rows={4}
                                />
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-foreground">Solution Code (optional)</Label>
                                <Textarea
                                  value={newIDEProject.solution_code}
                                  onChange={(e) => setNewIDEProject({ ...newIDEProject, solution_code: e.target.value })}
                                  placeholder="Reference solution for instructors..."
                                  className="bg-white dark:bg-accent/30 border-2 border-green-200 focus:border-green-500 text-sm font-mono text-xs"
                                  rows={4}
                                />
                              </div>
                            </div>
                            
                            <Button
                              onClick={addIDEProjectToPhase}
                              className="bg-green-500 hover:bg-green-600 text-white w-full"
                              disabled={!newIDEProject.title.trim() || !newIDEProject.language.trim()}
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Add Project
                            </Button>

                            {newPhase.ide_projects.length > 0 && (
                              <div className="mt-3 space-y-2">
                                <div className="text-sm font-medium text-green-700 dark:text-green-300">Added Projects:</div>
                                {newPhase.ide_projects.map((project, index) => (
                                  <div key={index} className="flex items-center justify-between p-2 bg-white dark:bg-accent/50 rounded border border-green-200">
                                    <div className="flex items-center gap-2">
                                      <Laptop className="w-4 h-4 text-green-500" />
                                      <div>
                                        <div className="text-sm font-medium">{project.title}</div>
                                        <div className="text-xs text-muted-foreground">{project.language} • {project.difficulty}</div>
                                      </div>
                                    </div>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setNewPhase({
                                          ...newPhase,
                                          ide_projects: newPhase.ide_projects.filter((_, i) => i !== index)
                                        });
                                      }}
                                      className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <Button 
                        onClick={addPhase}
                        className="bg-blue-500 hover:bg-blue-600 text-white w-full mt-4"
                        disabled={!newPhase.title.trim()}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Phase to Roadmap
                      </Button>

                      {/* Phase Preview */}
                      {newRoadmap.phases.length > 0 && (
                        <div className="mt-6 border-2 border-blue-200 bg-gradient-to-br from-blue-50/30 to-purple-50/30 dark:from-blue-900/10 dark:to-purple-900/10 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                              <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                            <h5 className="font-semibold text-blue-700 dark:text-blue-300">Roadmap Phases ({newRoadmap.phases.length})</h5>
                          </div>
                          <div className="space-y-3">
                            {newRoadmap.phases.map((phase, index) => (
                              <div key={index} className="border border-blue-200 bg-white dark:bg-accent/50 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                                        <span className="text-xs font-bold text-blue-600 dark:text-blue-300">{index + 1}</span>
                                      </div>
                                      <div className="font-semibold text-blue-800 dark:text-blue-200">{phase.title}</div>
                                      {phase.estimated_duration && (
                                        <Badge variant="secondary" className="text-xs">
                                          {phase.estimated_duration}
                                        </Badge>
                                      )}
                                    </div>
                                    {phase.description && (
                                      <p className="text-sm text-muted-foreground mb-2 ml-8">{phase.description}</p>
                                    )}
                                    <div className="flex items-center gap-4 ml-8 text-xs text-muted-foreground">
                                      <div className="flex items-center gap-1">
                                        <Video className="w-3 h-3 text-red-500" />
                                        <span>{phase.youtube_videos.length} videos</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <GraduationCap className="w-3 h-3 text-purple-500" />
                                        <span>{phase.coursera_links.length} courses</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Laptop className="w-3 h-3 text-green-500" />
                                        <span>{phase.ide_projects.length} projects</span>
                                      </div>
                                    </div>
                                  </div>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => removePhase(index)}
                                    className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white ml-4"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
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
          </div>

          {/* Edit Roadmap Dialog */}
          <Dialog open={isEditRoadmapOpen} onOpenChange={setIsEditRoadmapOpen}>
            <DialogContent className="bg-card border-border max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-foreground">Edit Learning Roadmap</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Update the roadmap details and learning content
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                {/* Roadmap Basic Info */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-roadmap-title" className="text-foreground">Roadmap Title</Label>
                      <Input
                        id="edit-roadmap-title"
                        value={newRoadmap.title}
                        onChange={(e) => setNewRoadmap({ ...newRoadmap, title: e.target.value })}
                        placeholder="e.g., Full Stack Web Development"
                        className="bg-accent/50 border-border text-foreground placeholder-muted-foreground"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-roadmap-category" className="text-foreground">Category</Label>
                      <Input
                        id="edit-roadmap-category"
                        value={newRoadmap.category}
                        onChange={(e) => setNewRoadmap({ ...newRoadmap, category: e.target.value })}
                        placeholder="e.g., Web Development"
                        className="bg-accent/50 border-border text-foreground placeholder-muted-foreground"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="edit-roadmap-difficulty" className="text-foreground">Difficulty Level</Label>
                      <Select value={newRoadmap.difficulty_level} onValueChange={(value: 'Beginner' | 'Intermediate' | 'Advanced') => setNewRoadmap({ ...newRoadmap, difficulty_level: value })}>
                        <SelectTrigger className="bg-accent/50 border-border text-foreground">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Beginner">Beginner</SelectItem>
                          <SelectItem value="Intermediate">Intermediate</SelectItem>
                          <SelectItem value="Advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="edit-roadmap-duration" className="text-foreground">Estimated Duration</Label>
                      <Input
                        id="edit-roadmap-duration"
                        value={newRoadmap.estimated_duration}
                        onChange={(e) => setNewRoadmap({ ...newRoadmap, estimated_duration: e.target.value })}
                        placeholder="e.g., 3 months"
                        className="bg-accent/50 border-border text-foreground placeholder-muted-foreground"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-roadmap-language" className="text-foreground">Language</Label>
                      <Input
                        id="edit-roadmap-language"
                        value={newRoadmap.language}
                        onChange={(e) => setNewRoadmap({ ...newRoadmap, language: e.target.value })}
                        placeholder="e.g., English"
                        className="bg-accent/50 border-border text-foreground placeholder-muted-foreground"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="edit-roadmap-description" className="text-foreground">Roadmap Description</Label>
                    <Textarea
                      id="edit-roadmap-description"
                      value={newRoadmap.description}
                      onChange={(e) => setNewRoadmap({ ...newRoadmap, description: e.target.value })}
                      placeholder="Describe what students will learn in this roadmap..."
                      className="bg-accent/50 border-border text-foreground placeholder-muted-foreground"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-roadmap-instructor" className="text-foreground">Instructor Name</Label>
                      <Input
                        id="edit-roadmap-instructor"
                        value={newRoadmap.instructor_name}
                        onChange={(e) => setNewRoadmap({ ...newRoadmap, instructor_name: e.target.value })}
                        placeholder="e.g., John Doe"
                        className="bg-accent/50 border-border text-foreground placeholder-muted-foreground"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-roadmap-thumbnail" className="text-foreground">Thumbnail URL</Label>
                      <Input
                        id="edit-roadmap-thumbnail"
                        value={newRoadmap.thumbnail_url}
                        onChange={(e) => setNewRoadmap({ ...newRoadmap, thumbnail_url: e.target.value })}
                        placeholder="https://example.com/image.jpg"
                        className="bg-accent/50 border-border text-foreground placeholder-muted-foreground"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditRoadmapOpen(false)} className="bg-accent text-foreground hover:bg-accent/80">
                  Cancel
                </Button>
                <Button onClick={handleUpdateRoadmap} className="bg-blue-500 hover:bg-blue-600 text-white" disabled={!newRoadmap.title}>
                  Update Roadmap
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Roadmaps List */}
          <div className="space-y-6">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roadmaps.map((roadmap) => (
                  <Card key={roadmap.id} className="group hover:shadow-lg transition-all duration-300 hover:scale-105 border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between text-lg font-semibold text-foreground">
                        <span className="flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-blue-400" />
                          {roadmap.title}
                        </span>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
                            onClick={() => handleEditRoadmap(roadmap)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                            onClick={() => handleDeleteRoadmap(roadmap.id)}
                          >
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
                          {roadmap.phases?.reduce((total: number, phase: any) => {
                            const videos = phase.youtube_videos?.length || 0;
                            const courses = phase.coursera_links?.length || 0;
                            const projects = phase.ide_projects?.length || 0;
                            return total + videos + courses + projects;
                          }, 0)} total resources
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

export default RoadmapsPage;
