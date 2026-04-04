import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MapPin, 
  Search, 
  Filter, 
  Clock, 
  Star, 
  Users, 
  BookOpen,
  Video,
  Laptop,
  TrendingUp,
  Eye,
  PlayCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getAllRoadmaps, Roadmap } from '@/integrations/firebase/client';
import StudentRoadmapView from '@/components/StudentRoadmapView';

const Roadmaps: React.FC = () => {
  const { user } = useAuth();
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoadmap, setSelectedRoadmap] = useState<Roadmap | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  useEffect(() => {
    loadRoadmaps();
  }, []);

  const loadRoadmaps = async () => {
    try {
      const roadmapsData = await getAllRoadmaps();
      // Only show active roadmaps
      const activeRoadmaps = roadmapsData.filter(roadmap => roadmap.is_active !== false);
      setRoadmaps(activeRoadmaps);
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
    
    const totalPhases = roadmap.phases.length;
    const avgWeeksPerPhase = 2;
    const totalWeeks = totalPhases * avgWeeksPerPhase;
    
    if (totalWeeks < 4) return `${totalWeeks} weeks`;
    if (totalWeeks < 12) return `${Math.round(totalWeeks / 4)} months`;
    return `${Math.round(totalWeeks / 4)}+ months`;
  };

  const filteredAndSortedRoadmaps = roadmaps
    .filter(roadmap => 
      roadmap.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      roadmap.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        case 'oldest':
          return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'phases':
          return (b.phases?.length || 0) - (a.phases?.length || 0);
        default:
          return 0;
      }
    });

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
            <h1 className="text-4xl font-bold text-foreground">Learning Roadmaps</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Explore our comprehensive learning paths and master new skills with structured, 
            expert-designed curricula.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search roadmaps..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-accent/50 border-border text-foreground placeholder-muted-foreground"
              />
            </div>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48 bg-accent/50 border-border text-foreground">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="title">Title A-Z</SelectItem>
                <SelectItem value="phases">Most Phases</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Roadmap Grid */}
        {filteredAndSortedRoadmaps.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-muted/50 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <MapPin className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-semibold text-foreground mb-4">
              {searchTerm ? 'No Matching Roadmaps Found' : 'No Learning Paths Available'}
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              {searchTerm 
                ? 'Try adjusting your search terms or browse all available roadmaps.'
                : 'We\'re currently preparing amazing learning roadmaps for you. Check back soon!'
              }
            </p>
            {searchTerm && (
              <Button 
                onClick={() => setSearchTerm('')}
                variant="outline"
                className="border-border text-foreground hover:bg-accent"
              >
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-muted-foreground">
                Found {filteredAndSortedRoadmaps.length} learning path{filteredAndSortedRoadmaps.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredAndSortedRoadmaps.map((roadmap) => (
                <Card 
                  key={roadmap.id} 
                  className="group cursor-pointer border-border/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:scale-105 overflow-hidden"
                  onClick={() => selectRoadmap(roadmap)}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <CardHeader className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                        {roadmap.phases?.length || 0} Phases
                      </Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 mr-1" />
                        {getEstimatedDuration(roadmap)}
                      </div>
                    </div>
                    
                    <CardTitle className="text-xl font-bold text-foreground group-hover:text-blue-600 transition-colors line-clamp-2">
                      {roadmap.title}
                    </CardTitle>
                    
                    <CardDescription className="text-muted-foreground line-clamp-3">
                      {roadmap.description}
                    </CardDescription>
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

                      {/* Action Button */}
                      <div className="flex items-center justify-between pt-2 border-t border-border/50">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <TrendingUp className="w-4 h-4" />
                          <span>Beginner to Advanced</span>
                        </div>
                        <Button variant="outline" size="sm" className="group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Stats Section */}
        {roadmaps.length > 0 && (
          <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-accent/50 border-border/50">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {roadmaps.length}
                </div>
                <div className="text-sm text-muted-foreground">Total Roadmaps</div>
              </CardContent>
            </Card>
            
            <Card className="bg-accent/50 border-border/50">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {roadmaps.reduce((total, roadmap) => total + (roadmap.phases?.length || 0), 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Phases</div>
              </CardContent>
            </Card>
            
            <Card className="bg-accent/50 border-border/50">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">
                  {roadmaps.reduce((total, roadmap) => 
                    total + roadmap.phases?.reduce((phaseTotal, phase) => 
                      phaseTotal + (phase.youtube_videos?.length || 0), 0) || 0, 0)
                  }
                </div>
                <div className="text-sm text-muted-foreground">Video Resources</div>
              </CardContent>
            </Card>
            
            <Card className="bg-accent/50 border-border/50">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                  {roadmaps.reduce((total, roadmap) => 
                    total + roadmap.phases?.reduce((phaseTotal, phase) => 
                      phaseTotal + (phase.ide_projects?.length || 0), 0) || 0, 0)
                  }
                </div>
                <div className="text-sm text-muted-foreground">Hands-on Projects</div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Roadmaps;
