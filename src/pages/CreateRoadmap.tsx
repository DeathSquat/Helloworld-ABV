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
  Laptop,
  TrendingUp
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

  const goBack = () => {
    setSelectedRoadmap(null);
  };

  const getEstimatedDuration = (roadmap: Roadmap) => {
    if (!roadmap.phases || roadmap.phases.length === 0) return 'Duration not specified';
    
    // Try to extract duration from phases or return a default
    const totalPhases = roadmap.phases.length;
    const avgWeeksPerPhase = 2; // Average 2 weeks per phase
    const totalWeeks = totalPhases * avgWeeksPerPhase;
    
    if (totalWeeks < 4) return `${totalWeeks} weeks`;
    if (totalWeeks < 12) return `${Math.round(totalWeeks / 4)} months`;
    return `${Math.round(totalWeeks / 4)}+ months`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mb-4"></div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Loading Learning Paths</h2>
          <p className="text-muted-foreground">Discover your perfect learning journey...</p>
        </div>
      </div>
    );
  }

  if (selectedRoadmap) {
    return (
      <div className="min-h-screen bg-background">
        <StudentRoadmapView 
          roadmap={selectedRoadmap}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <MapPin className="w-12 h-12 text-blue-500 mr-3" />
            <h1 className="text-4xl font-bold text-foreground">Choose Your Learning Path</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Select from our carefully crafted roadmaps and start your journey to mastering new skills. 
            Each path is designed by experts to take you from beginner to advanced level.
          </p>
        </div>

        {/* Roadmap Grid */}
        {availableRoadmaps.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-muted/50 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <MapPin className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-semibold text-foreground mb-4">No Learning Paths Available</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              We're currently preparing amazing learning roadmaps for you. Check back soon to start your learning journey!
            </p>
            <Button 
              onClick={loadAvailableRoadmaps}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {availableRoadmaps.map((roadmap) => (
              <Card 
                key={roadmap.id} 
                className="group cursor-pointer border-border/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:scale-105 overflow-hidden"
                onClick={() => selectRoadmap(roadmap)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Thumbnail or Placeholder */}
                <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 relative overflow-hidden">
                  {roadmap.thumbnail_url ? (
                    <img 
                      src={roadmap.thumbnail_url} 
                      alt={roadmap.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <MapPin className="w-16 h-16 text-blue-500/30" />
                    </div>
                  )}
                  
                  {/* Difficulty Badge */}
                  <div className="absolute top-3 right-3">
                    <Badge className={
                      roadmap.difficulty_level === 'Beginner' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                      roadmap.difficulty_level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                      'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    }>
                      {roadmap.difficulty_level}
                    </Badge>
                  </div>
                  
                  {/* Category Badge */}
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      {roadmap.category || 'General'}
                    </Badge>
                  </div>
                </div>
                
                <CardHeader className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800">
                      {roadmap.phases?.length || 0} Phases
                    </Badge>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 mr-1" />
                      {roadmap.estimated_duration || getEstimatedDuration(roadmap)}
                    </div>
                  </div>
                  
                  <CardTitle className="text-xl font-bold text-foreground group-hover:text-blue-600 transition-colors line-clamp-2">
                    {roadmap.title}
                  </CardTitle>
                  
                  <CardDescription className="text-muted-foreground line-clamp-3">
                    {roadmap.description}
                  </CardDescription>
                  
                  {/* Instructor Info */}
                  {roadmap.instructor_name && (
                    <div className="flex items-center mt-2 text-sm text-muted-foreground">
                      <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mr-2">
                        <span className="text-xs font-bold">{roadmap.instructor_name.charAt(0).toUpperCase()}</span>
                      </div>
                      <span>{roadmap.instructor_name}</span>
                    </div>
                  )}
                </CardHeader>

                <CardContent className="relative">
                  <div className="space-y-4">
                    {/* Resources Overview */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-red-50 dark:bg-red-900/20 rounded p-2">
                        <div className="text-lg font-bold text-red-600 dark:text-red-400">
                          {roadmap.phases?.reduce((total, phase) => total + (phase.youtube_videos?.length || 0), 0) || 0}
                        </div>
                        <div className="text-xs text-red-800 dark:text-red-200">Videos</div>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded p-2">
                        <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                          {roadmap.phases?.reduce((total, phase) => total + (phase.coursera_links?.length || 0), 0) || 0}
                        </div>
                        <div className="text-xs text-purple-800 dark:text-purple-200">Courses</div>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 rounded p-2">
                        <div className="text-lg font-bold text-green-600 dark:text-green-400">
                          {roadmap.phases?.reduce((total, phase) => total + (phase.ide_projects?.length || 0), 0) || 0}
                        </div>
                        <div className="text-xs text-green-800 dark:text-green-200">Projects</div>
                      </div>
                    </div>

                    {/* Tags */}
                    {roadmap.tags && roadmap.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {roadmap.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {roadmap.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{roadmap.tags.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Difficulty & Progress */}
                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <TrendingUp className="w-4 h-4" />
                        <span>{roadmap.difficulty_level} to Advanced</span>
                      </div>
                      <Button variant="outline" size="sm" className="group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <PlayCircle className="w-4 h-4 mr-1" />
                        Start Learning
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Footer CTA */}
        {availableRoadmaps.length > 0 && (
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl p-8 border border-border/50">
              <h3 className="text-2xl font-bold text-foreground mb-4">Ready to Start Learning?</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
                Choose any learning path above and begin your journey. Each roadmap is carefully designed 
                to help you master new skills with hands-on projects, expert videos, and interactive content.
              </p>
              <div className="flex items-center justify-center gap-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  Expert-designed curriculum
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  Hands-on projects
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  Progress tracking
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateRoadmap;
