import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getAllRoadmaps, createRoadmap, deleteRoadmap, Roadmap } from '@/integrations/firebase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Plus, Edit, Trash2, Shield } from 'lucide-react';
import Navbar from '@/components/Navbar';

const RoadmapsPage = () => {
  const { userProfile } = useAuth();
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateRoadmapOpen, setIsCreateRoadmapOpen] = useState(false);
  const [newRoadmap, setNewRoadmap] = useState({ 
    title: '', 
    description: '', 
    phases: [] as any[]
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
      const roadmapsData = await getAllRoadmaps();
      setRoadmaps(roadmapsData);
    } catch (error) {
      console.error('Failed to load roadmaps:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userProfile?.role === 'admin') {
      loadData();
    }
  }, [userProfile]);

  const handleCreateRoadmap = async () => {
    try {
      const roadmapData = {
        title: newRoadmap.title,
        description: newRoadmap.description,
        phases: newRoadmap.phases,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true
      };
      await createRoadmap(roadmapData);
      setNewRoadmap({ title: '', description: '', phases: [] });
      setNewPhase({ 
        title: '', 
        description: '', 
        estimated_duration: '',
        youtube_videos: [],
        coursera_links: [],
        ide_projects: []
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
          </div>

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
                ))}
              </div>
            )}
          </div>
        </div>
      </>
    );
};

export default RoadmapsPage;
