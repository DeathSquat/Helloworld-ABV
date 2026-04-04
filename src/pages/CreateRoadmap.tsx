import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  BookOpen, 
  Youtube, 
  GraduationCap,
  CheckCircle,
  PlayCircle,
  ExternalLink,
  Sparkles,
  Lock,
  Unlock,
  Video,
  Laptop
} from 'lucide-react';
import { getAllRoadmaps, Roadmap } from '@/integrations/firebase/client';
import { useAuth } from '@/hooks/useAuth';
import StudentRoadmapView from '@/components/StudentRoadmapView';

const CreateRoadmap = () => {
  const { user } = useAuth();
  const [availableRoadmaps, setAvailableRoadmaps] = useState<Roadmap[]>([]);
  const [selectedRoadmap, setSelectedRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAvailableRoadmaps();
  }, []);

  const loadAvailableRoadmaps = async () => {
    try {
      setLoading(true);
      const roadmaps = await getAllRoadmaps();
      // Only show active roadmaps
      const activeRoadmaps = roadmaps.filter(roadmap => roadmap.is_active !== false);
      setAvailableRoadmaps(activeRoadmaps);
    } catch (error) {
      console.error('Failed to load roadmaps:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectRoadmap = (roadmap: Roadmap) => {
    setSelectedRoadmap(roadmap);
  };

  const getTotalContentCount = (roadmap: Roadmap) => {
    return roadmap.phases?.reduce((total, phase) => 
      total + (phase.youtube_videos?.length || 0) + 
             (phase.coursera_links?.length || 0) + 
             (phase.ide_projects?.length || 0), 0) || 0;
  };

  const getEstimatedDuration = (roadmap: Roadmap) => {
    const totalContent = getTotalContentCount(roadmap);
    if (totalContent === 0) return 'Self-paced';
    if (totalContent <= 5) return '1-2 weeks';
    if (totalContent <= 10) return '3-4 weeks';
    if (totalContent <= 20) return '1-2 months';
    return '2+ months';
  };

  if (selectedRoadmap) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => setSelectedRoadmap(null)}
              className="mb-4"
            >
              ← Back to Roadmaps
            </Button>
          </div>
          <StudentRoadmapView roadmap={selectedRoadmap} />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading available roadmaps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4 flex items-center justify-center gap-3">
              <MapPin className="w-8 h-8 text-blue-600" />
              Learning Roadmaps
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose from our curated learning paths and master new skills with structured content, 
              hands-on projects, and expert guidance.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{availableRoadmaps.length}</div>
              <div className="text-sm text-blue-800 dark:text-blue-200">Available Roadmaps</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {availableRoadmaps.reduce((sum, r) => 
                  sum + r.phases?.reduce((phaseSum, phase) => phaseSum + (phase.youtube_videos?.length || 0), 0) || 0, 0)
                }
              </div>
              <div className="text-sm text-red-800 dark:text-red-200">Video Tutorials</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {availableRoadmaps.reduce((sum, r) => 
                  sum + r.phases?.reduce((phaseSum, phase) => phaseSum + (phase.ide_projects?.length || 0), 0) || 0, 0)
                }
              </div>
              <div className="text-sm text-green-800 dark:text-green-200">Hands-on Projects</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {availableRoadmaps.reduce((sum, r) => 
                  sum + r.phases?.reduce((phaseSum, phase) => phaseSum + (phase.coursera_links?.length || 0), 0) || 0, 0)
                }
              </div>
              <div className="text-sm text-purple-800 dark:text-purple-200">Online Courses</div>
            </CardContent>
          </Card>
        </div>

        {/* Roadmaps Grid */}
        {availableRoadmaps.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No roadmaps available</h3>
            <p className="text-muted-foreground">
              Check back later for new learning roadmaps created by our instructors.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableRoadmaps.map((roadmap) => {
              const contentCount = getTotalContentCount(roadmap);
              
              return (
                <Card 
                  key={roadmap.id} 
                  className="hover:shadow-lg transition-all duration-300 cursor-pointer group hover:scale-105 border-border/50"
                  onClick={() => selectRoadmap(roadmap)}
                >
                  <CardHeader>
                    <div className="space-y-3">
                      <CardTitle className="text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {roadmap.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-3">
                        {roadmap.description}
                      </CardDescription>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          {roadmap.phases?.length || 0} Phases
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Content Stats */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-red-50 dark:bg-red-900/20 rounded p-2">
                        <div className="text-lg font-bold text-red-600 dark:text-red-400">
                          {roadmap.phases?.reduce((sum, phase) => sum + (phase.youtube_videos?.length || 0), 0) || 0}
                        </div>
                        <div className="text-xs text-red-800 dark:text-red-200">Videos</div>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded p-2">
                        <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                          {roadmap.phases?.reduce((sum, phase) => sum + (phase.coursera_links?.length || 0), 0) || 0}
                        </div>
                        <div className="text-xs text-purple-800 dark:text-purple-200">Courses</div>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 rounded p-2">
                        <div className="text-lg font-bold text-green-600 dark:text-green-400">
                          {roadmap.phases?.reduce((sum, phase) => sum + (phase.ide_projects?.length || 0), 0) || 0}
                        </div>
                        <div className="text-xs text-green-800 dark:text-green-200">Projects</div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{getEstimatedDuration(roadmap)}</span>
                      </div>
                      <Button variant="outline" size="sm" className="group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <PlayCircle className="w-4 h-4 mr-1" />
                        Start Learning
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateRoadmap;
