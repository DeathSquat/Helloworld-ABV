import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, 
  PlayCircle, 
  ExternalLink, 
  Code, 
  Clock, 
  Star, 
  CheckCircle2,
  Circle,
  BookOpen,
  Video,
  Laptop,
  Lock,
  Unlock,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import YouTubePlayer from './YouTubePlayer';
import IDEProject from './IDEProject';
import { Roadmap, LearningPhase, YouTubeVideo, CourseraLink, IDEProject as IDEProjectType } from '@/integrations/firebase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  getUserRoadmapProgress, 
  createUserRoadmapProgress, 
  getUserPhaseProgress, 
  completePhaseContent,
  getPhaseUnlockStatus
} from '@/integrations/firebase/client';

interface StudentRoadmapViewProps {
  roadmap: Roadmap;
  onComplete?: (phaseId: string, contentType: 'video' | 'course' | 'project') => void;
  className?: string;
}

const StudentRoadmapView: React.FC<StudentRoadmapViewProps> = ({ 
  roadmap, 
  onComplete,
  className = '' 
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
  const [selectedProject, setSelectedProject] = useState<IDEProjectType | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<CourseraLink | null>(null);
  const [currentPhase, setCurrentPhase] = useState<LearningPhase | null>(null);
  const [roadmapProgress, setRoadmapProgress] = useState<any>(null);
  const [phaseProgresses, setPhaseProgresses] = useState<Record<string, any>>({});
  const [phaseUnlockStatuses, setPhaseUnlockStatuses] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  // Initialize progress tracking
  useEffect(() => {
    if (user && roadmap) {
      initializeProgress();
    }
  }, [user, roadmap]);

  const initializeProgress = async () => {
    try {
      setLoading(true);
      
      // Get or create roadmap progress
      let progress = await getUserRoadmapProgress(user!.uid, roadmap.id);
      if (!progress) {
        progress = await createUserRoadmapProgress(user!.uid, roadmap.id);
      }
      setRoadmapProgress(progress);

      // Get unlock status for all phases
      const unlockStatuses: Record<string, any> = {};
      for (const phase of roadmap.phases) {
        const status = await getPhaseUnlockStatus(user!.uid, roadmap.id, phase.id);
        unlockStatuses[phase.id] = status;
      }
      setPhaseUnlockStatuses(unlockStatuses);

      // Get progress for unlocked phases
      const phaseProgressData: Record<string, any> = {};
      for (const phase of roadmap.phases) {
        if (unlockStatuses[phase.id].isUnlocked) {
          const phaseProgress = await getUserPhaseProgress(user!.uid, roadmap.id, phase.id);
          if (phaseProgress) {
            phaseProgressData[phase.id] = phaseProgress;
          }
        }
      }
      setPhaseProgresses(phaseProgressData);

      // Set current phase (first unlocked but not completed)
      const firstUnlockedPhase = roadmap.phases.find(phase => 
        unlockStatuses[phase.id].isUnlocked && !unlockStatuses[phase.id].isCompleted
      );
      setCurrentPhase(firstUnlockedPhase || null);
      
    } catch (error) {
      console.error('Failed to initialize progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const markContentComplete = async (phaseId: string, contentType: 'video' | 'course' | 'project', contentId: string) => {
    if (!user) return;
    
    try {
      await completePhaseContent(user.uid, roadmap.id, phaseId, contentType, contentId);
      
      // Refresh progress data
      await initializeProgress();
      
      if (onComplete) {
        onComplete(phaseId, contentType);
      }
    } catch (error) {
      console.error('Failed to mark content complete:', error);
    }
  };

  const isContentCompleted = (phaseId: string, contentType: 'video' | 'course' | 'project', contentId: string) => {
    const phaseProgress = phaseProgresses[phaseId];
    if (!phaseProgress) return false;
    
    switch (contentType) {
      case 'video':
        return phaseProgress.completed_videos?.includes(contentId) || false;
      case 'course':
        return phaseProgress.completed_courses?.includes(contentId) || false;
      case 'project':
        return phaseProgress.completed_projects?.includes(contentId) || false;
      default:
        return false;
    }
  };

  const getPhaseProgress = (phase: LearningPhase) => {
    const phaseProgress = phaseProgresses[phase.id];
    if (!phaseProgress) return 0;
    
    const totalContent = phase.youtube_videos.length + phase.coursera_links.length + phase.ide_projects.length;
    const completedContent = (phaseProgress.completed_videos?.length || 0) + 
                           (phaseProgress.completed_courses?.length || 0) + 
                           (phaseProgress.completed_projects?.length || 0);
    
    return totalContent > 0 ? (completedContent / totalContent) * 100 : 0;
  };

  const getOverallProgress = () => {
    const completedPhases = roadmapProgress?.completed_phases?.length || 0;
    return roadmap.phases.length > 0 ? (completedPhases / roadmap.phases.length) * 100 : 0;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-300';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-300';
      case 'Advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-300';
    }
  };

  const startPhase = (phase: LearningPhase) => {
    if (phaseUnlockStatuses[phase.id]?.isUnlocked) {
      setCurrentPhase(phase);
      setActiveTab('content');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (selectedVideo) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Button
          variant="outline"
          onClick={() => setSelectedVideo(null)}
          className="mb-4"
        >
          ← Back to Phase
        </Button>
        <YouTubePlayer
          videoId={selectedVideo.video_id}
          title={selectedVideo.title}
          description={selectedVideo.description}
        />
        {currentPhase && (
          <div className="flex justify-center">
            <Button
              onClick={() => markContentComplete(currentPhase.id, 'video', selectedVideo.id)}
              disabled={isContentCompleted(currentPhase.id, 'video', selectedVideo.id)}
              className="flex items-center gap-2"
            >
              {isContentCompleted(currentPhase.id, 'video', selectedVideo.id) ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Video Completed
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Mark as Complete
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (selectedProject) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Button
          variant="outline"
          onClick={() => setSelectedProject(null)}
          className="mb-4"
        >
          ← Back to Phase
        </Button>
        <IDEProject project={selectedProject} />
        {currentPhase && (
          <div className="flex justify-center">
            <Button
              onClick={() => markContentComplete(currentPhase.id, 'project', selectedProject.id)}
              disabled={isContentCompleted(currentPhase.id, 'project', selectedProject.id)}
              className="flex items-center gap-2"
            >
              {isContentCompleted(currentPhase.id, 'project', selectedProject.id) ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Project Completed
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Mark as Complete
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-8 p-6 ${className}`}>
      {/* Roadmap Header */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-300 dark:border-blue-600 shadow-lg">
        <CardHeader className="pb-6">
          <div className="flex items-start justify-between">
            <div className="space-y-4">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <MapPin className="w-6 h-6 text-blue-600" />
                {roadmap.title}
              </CardTitle>
              <CardDescription className="text-base leading-relaxed">
                {roadmap.description}
              </CardDescription>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  {roadmap.phases.length} Phases
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {getOverallProgress().toFixed(0)}% Complete
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{getOverallProgress().toFixed(0)}% complete</span>
            </div>
            <Progress value={getOverallProgress()} className="h-3" />
            <div className="text-center text-sm text-muted-foreground">
              {getOverallProgress().toFixed(0)}% Complete
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-2">
          <TabsTrigger value="overview" className="data-[state=active]:bg-blue-50 data-[state=active]:border-blue-500 border-2 border-transparent">Phases Overview</TabsTrigger>
          <TabsTrigger value="content" className="data-[state=active]:bg-blue-50 data-[state=active]:border-blue-500 border-2 border-transparent">Current Phase</TabsTrigger>
          <TabsTrigger value="progress" className="data-[state=active]:bg-blue-50 data-[state=active]:border-blue-500 border-2 border-transparent">Progress Details</TabsTrigger>
        </TabsList>

        {/* Overview Tab - Enhanced Flowchart */}
        <TabsContent value="overview" className="space-y-8 border-2 border-gray-100 dark:border-gray-700 rounded-lg p-6 sm:p-8 lg:p-10 bg-white dark:bg-gray-900/50 mt-6">
          {/* Progress Timeline */}
          <div className="relative">
            {/* Connection Line */}
            <div className="absolute left-12 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-300 via-blue-400 to-blue-500 hidden md:block"></div>
            
            <div className="space-y-8 relative">
              {roadmap.phases.map((phase, index) => {
                const unlockStatus = phaseUnlockStatuses[phase.id];
                const progress = getPhaseProgress(phase);
                const isCurrentPhase = currentPhase?.id === phase.id;
                
                return (
                  <div key={phase.id} className="relative flex flex-col lg:flex-row items-start gap-6 lg:gap-8">
                    {/* Phase Node */}
                    <div className={`relative z-10 flex-shrink-0 transition-all duration-500 ${
                      isCurrentPhase ? 'scale-110' : 'hover:scale-105'
                    }`}>
                      <Card 
                        className={`
                          w-full lg:w-96 
                          transition-all 
                          duration-300 
                          border-2
                          ${isCurrentPhase 
                            ? 'ring-4 ring-blue-500 shadow-xl border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30' 
                            : unlockStatus.isCompleted 
                              ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30' 
                              : unlockStatus.isUnlocked
                                ? 'border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 hover:border-blue-500'
                                : 'border-gray-400 bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-800/30 dark:to-slate-800/30 opacity-75'
                          } 
                          ${!unlockStatus.isUnlocked ? 'opacity-60' : ''}
                        `}
                      >
                        <CardHeader className="pb-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              {/* Phase Number */}
                              <div className={`flex items-center justify-center w-14 h-14 rounded-full text-lg font-bold transition-all ${
                                isCurrentPhase 
                                  ? 'bg-blue-500 text-white shadow-lg'
                                  : unlockStatus.isCompleted
                                    ? 'bg-green-500 text-white'
                                    : unlockStatus.isUnlocked
                                      ? 'bg-blue-400 text-white'
                                      : 'bg-gray-400 text-white'
                              }`}>
                                {index + 1}
                              </div>
                              
                              {/* Phase Info */}
                              <div className="flex-1">
                                <CardTitle className="text-xl font-semibold">{phase.title}</CardTitle>
                                <CardDescription className="text-sm line-clamp-2 mt-1">{phase.description}</CardDescription>
                              </div>
                            </div>
                            
                            {/* Status Badge */}
                            <div className="flex items-center gap-2">
                              {unlockStatus.isCompleted ? (
                                <Badge className="bg-green-100 text-green-800 border-green-200">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Completed
                                </Badge>
                              ) : unlockStatus.isUnlocked ? (
                                <Badge variant="outline" className="border-blue-500 text-blue-600">
                                  <Unlock className="w-3 h-3 mr-1" />
                                  Unlocked
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="border-gray-400 text-gray-500">
                                  <Lock className="w-3 h-3 mr-1" />
                                  Locked
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {phase.estimated_duration}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="pt-0">
                          {/* Content Summary */}
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2 text-gray-600 p-2 border border-gray-200 rounded">
                              <Video className="w-4 h-4" />
                              {phase.youtube_videos.length}
                            </div>
                            <div className="flex items-center gap-2 text-gray-600 p-2 border border-gray-200 rounded">
                              <BookOpen className="w-4 h-4" />
                              {phase.coursera_links.length}
                            </div>
                            <div className="flex items-center gap-2 text-gray-600 p-2 border border-gray-200 rounded">
                              <Laptop className="w-4 h-4" />
                              {phase.ide_projects.length}
                            </div>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="mt-4">
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-medium">{progress.toFixed(0)}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    {/* Action Button */}
                    <div className="flex-1 flex items-center lg:pl-4 w-full lg:w-auto mt-4 lg:mt-0">
                      {isCurrentPhase ? (
                        <Button
                          onClick={() => setActiveTab('content')}
                          className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg px-4 py-2 text-sm sm:px-6 sm:py-3 sm:text-base w-full sm:w-auto"
                        >
                          <PlayCircle className="w-4 h-4 mr-1 sm:w-5 sm:h-5 sm:mr-2" />
                          <span className="hidden sm:inline">Continue Learning</span>
                          <span className="sm:hidden">Continue</span>
                        </Button>
                      ) : unlockStatus.isUnlocked && !unlockStatus.isCompleted ? (
                        <Button
                          onClick={() => startPhase(phase)}
                          className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg px-4 py-2 text-sm sm:px-6 sm:py-3 sm:text-base w-full sm:w-auto"
                        >
                          <ArrowRight className="w-4 h-4 mr-1 sm:w-5 sm:h-5 sm:mr-2" />
                          <span className="hidden sm:inline">Start Phase</span>
                          <span className="sm:hidden">Start</span>
                        </Button>
                      ) : !unlockStatus.isUnlocked ? (
                        <div className="text-center p-3 sm:p-4 border-2 border-amber-200 bg-amber-50 rounded-lg w-full sm:w-auto">
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-amber-700 justify-center">
                            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="hidden sm:inline">Complete previous phases to unlock</span>
                            <span className="sm:hidden">Unlock previous phases</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center p-3 sm:p-4 border-2 border-green-200 bg-green-50 rounded-lg w-full sm:w-auto">
                          <div className="text-xs sm:text-sm text-green-700 font-medium flex items-center gap-2 justify-center">
                            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="hidden sm:inline">Phase Completed</span>
                            <span className="sm:hidden">Completed</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
              );
            })}
          </div>
          </div>
        </TabsContent>

        {/* Progress Details Tab */}
        <TabsContent value="progress" className="space-y-6 border-2 border-gray-100 dark:border-gray-700 rounded-lg p-6 sm:p-8 lg:p-10 bg-white dark:bg-gray-900/50 mt-6">
        {/* Overall Progress Summary */}
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-300 dark:border-purple-600">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Star className="w-6 h-6 text-purple-600" />
              Learning Journey Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6 border-2 border-purple-200 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                <div className="text-3xl font-bold text-purple-600">{getOverallProgress().toFixed(0)}%</div>
                <div className="text-sm text-muted-foreground mt-2">Overall Progress</div>
              </div>
              <div className="text-center p-6 border-2 border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <div className="text-3xl font-bold text-blue-600">
                  {phaseUnlockStatuses ? Object.values(phaseUnlockStatuses).filter(status => status.isCompleted).length : 0}
                </div>
                <div className="text-sm text-muted-foreground mt-2">Phases Completed</div>
              </div>
              <div className="text-center p-6 border-2 border-green-200 rounded-lg bg-green-50 dark:bg-green-900/20">
                <div className="text-3xl font-bold text-green-600">
                  {phaseUnlockStatuses ? Object.values(phaseUnlockStatuses).filter(status => status.isUnlocked).length : 0}
                </div>
                <div className="text-sm text-muted-foreground mt-2">Phases Unlocked</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-6">
          {roadmap.phases.map((phase, index) => {
            const unlockStatus = phaseUnlockStatuses[phase.id];
            const phaseProgress = phaseProgresses[phase.id];
            
            return (
              <Card key={phase.id} className={`transition-all duration-300 border-2 ${
                unlockStatus.isCompleted 
                  ? 'border-green-300 bg-green-50 dark:bg-green-900/10' 
                  : unlockStatus.isUnlocked
                    ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/10'
                    : 'border-gray-300 bg-gray-50 dark:bg-gray-900/10'
              }`}>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">{phase.title}</CardTitle>
                      <CardDescription className="mt-2">{phase.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {unlockStatus.isCompleted && (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                      {currentPhase?.id === phase.id && (
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                          <PlayCircle className="w-3 h-3 mr-1" />
                          Current
                        </Badge>
                      )}
                      {!unlockStatus.isUnlocked && (
                        <Badge variant="outline" className="border-gray-400 text-gray-500">
                          <Lock className="w-3 h-3 mr-1" />
                          Locked
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                {phaseProgress && (
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-3 gap-6 text-center">
                        <div className="p-4 border-2 border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20">
                          <div className="text-2xl font-bold text-red-600">
                            {phaseProgress.completed_videos?.length || 0}/{phase.youtube_videos.length}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">Videos</div>
                        </div>
                        <div className="p-4 border-2 border-purple-200 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                          <div className="text-2xl font-bold text-purple-600">
                            {phaseProgress.completed_courses?.length || 0}/{phase.coursera_links.length}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">Courses</div>
                        </div>
                        <div className="p-4 border-2 border-green-200 rounded-lg bg-green-50 dark:bg-green-900/20">
                          <div className="text-2xl font-bold text-green-600">
                            {phaseProgress.completed_projects?.length || 0}/{phase.ide_projects.length}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">Projects</div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Phase Progress</span>
                          <span className="font-medium">{getPhaseProgress(phase).toFixed(0)}%</span>
                        </div>
                        <Progress value={getPhaseProgress(phase)} className="h-3" />
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
        </TabsContent>

        {/* Current Phase Tab */}
        <TabsContent value="content" className="space-y-8 border-2 border-gray-100 dark:border-gray-700 rounded-lg p-6 sm:p-8 xl:p-12 bg-white dark:bg-gray-900/50 mt-6">
          {currentPhase ? (
            <div className="space-y-6">
              <div className="flex flex-col xl:flex-row xl:items-center justify-between p-6 sm:p-8 xl:p-10 border-2 border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-900/20 gap-4">
                <div>
                  <h3 className="text-xl sm:text-2xl xl:text-3xl font-semibold flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 xl:w-14 xl:h-14 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center border-2 border-blue-300 flex-shrink-0">
                      {roadmap.phases.indexOf(currentPhase) + 1}
                    </div>
                    <span className="line-clamp-2">{currentPhase.title}</span>
                  </h3>
                  <p className="text-muted-foreground mt-2 text-base sm:text-lg xl:text-xl line-clamp-2">{currentPhase.description}</p>
                </div>
                <Badge variant="outline" className="text-sm sm:text-base xl:text-lg px-4 py-2 sm:px-6 sm:py-3 xl:px-8 xl:py-4 border-2 border-blue-300 whitespace-nowrap flex-shrink-0">{currentPhase.estimated_duration}</Badge>
              </div>

              {/* Phase Content */}
              <div className="space-y-8">
                {/* YouTube Videos */}
                {currentPhase.youtube_videos.length > 0 && (
                  <div>
                    <h4 className="text-xl sm:text-2xl xl:text-3xl font-medium mb-6 flex items-center gap-3 p-4 sm:p-6 border-2 border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20">
                      <Video className="w-5 h-5 sm:w-6 sm:h-6 xl:w-8 xl:h-8 text-red-500 flex-shrink-0" />
                      <span className="line-clamp-1">YouTube Videos ({currentPhase.youtube_videos.length})</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {currentPhase.youtube_videos.map((video) => (
                        <Card key={video.id} className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-gray-200 hover:border-blue-400" onClick={() => setSelectedVideo(video)}>
                          <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base sm:text-lg xl:text-xl line-clamp-2">{video.title}</CardTitle>
                              {isContentCompleted(currentPhase.id, 'video', video.id) && (
                                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 xl:w-7 xl:h-7 text-green-500 flex-shrink-0" />
                              )}
                            </div>
                            <CardDescription className="mt-2 text-sm sm:text-base xl:text-lg line-clamp-2">{video.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-2 border-2 border-gray-300 dark:border-gray-600 overflow-hidden max-h-12 sm:max-h-14 md:max-h-16 lg:max-h-18 xl:max-h-20">
                              <img 
                                src={video.thumbnail_url || `https://img.youtube.com/vi/${video.video_id}/maxresdefault.jpg`}
                                alt={video.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="flex items-center gap-2 text-sm sm:text-base">
                                <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                                {video.duration}
                              </Badge>
                              <PlayCircle className="w-5 h-5 sm:w-6 sm:h-6 xl:w-7 xl:h-7 text-blue-500 flex-shrink-0" />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Coursera Courses */}
                {currentPhase.coursera_links.length > 0 && (
                  <div>
                    <h4 className="text-xl sm:text-2xl xl:text-3xl font-medium mb-6 flex items-center gap-3 p-4 sm:p-6 border-2 border-purple-200 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                      <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 xl:w-8 xl:h-8 text-purple-500 flex-shrink-0" />
                      <span className="line-clamp-1">Coursera Courses ({currentPhase.coursera_links.length})</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {currentPhase.coursera_links.map((course) => (
                        <Card key={course.id} className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-gray-200 hover:border-purple-400" onClick={() => setSelectedCourse(course)}>
                          <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base sm:text-lg xl:text-xl line-clamp-2">{course.title}</CardTitle>
                              {isContentCompleted(currentPhase.id, 'course', course.id) && (
                                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 xl:w-7 xl:h-7 text-green-500 flex-shrink-0" />
                              )}
                            </div>
                            <CardDescription className="mt-2 text-sm sm:text-base xl:text-lg line-clamp-2">{course.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3 sm:space-y-4">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <Badge className={`${getDifficultyColor(course.difficulty)} text-sm sm:text-base`}>
                                  {course.difficulty}
                                </Badge>
                                <Badge variant="outline" className="flex items-center gap-2 text-sm sm:text-base">
                                  <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                                  {course.duration}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm sm:text-base text-muted-foreground">{course.provider}</span>
                                <ExternalLink className="w-5 h-5 sm:w-6 sm:h-6 xl:w-7 xl:h-7 text-purple-500 flex-shrink-0" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* IDE Projects */}
                {currentPhase.ide_projects.length > 0 && (
                  <div>
                    <h4 className="text-xl sm:text-2xl xl:text-3xl font-medium mb-6 flex items-center gap-3 p-4 sm:p-6 border-2 border-green-200 rounded-lg bg-green-50 dark:bg-green-900/20">
                      <Laptop className="w-5 h-5 sm:w-6 sm:h-6 xl:w-8 xl:h-8 text-green-500 flex-shrink-0" />
                      <span className="line-clamp-1">Hands-on Projects ({currentPhase.ide_projects.length})</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {currentPhase.ide_projects.map((project) => (
                        <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-gray-200 hover:border-green-400" onClick={() => setSelectedProject(project)}>
                          <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base sm:text-lg xl:text-xl line-clamp-2">{project.title}</CardTitle>
                              {isContentCompleted(currentPhase.id, 'project', project.id) && (
                                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 xl:w-7 xl:h-7 text-green-500 flex-shrink-0" />
                              )}
                            </div>
                            <CardDescription className="mt-2 text-sm sm:text-base xl:text-lg line-clamp-2">{project.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3 sm:space-y-4">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <Badge className={`${getDifficultyColor(project.difficulty)} text-sm sm:text-base`}>
                                  {project.difficulty}
                                </Badge>
                                <Badge variant="outline" className="flex items-center gap-2 text-sm sm:text-base">
                                  <Code className="w-4 h-4 sm:w-5 sm:h-5" />
                                  {project.language}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm sm:text-base text-muted-foreground">Interactive coding project</span>
                                <Laptop className="w-5 h-5 sm:w-6 sm:h-6 xl:w-7 xl:h-7 text-green-500 flex-shrink-0" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-900/50">
              <AlertCircle className="w-20 h-20 text-muted-foreground mx-auto mb-6" />
              <h3 className="text-2xl font-semibold mb-4">No Active Phase</h3>
              <p className="text-muted-foreground text-lg">Complete the current phase to unlock the next one.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentRoadmapView;
