import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { 
  Course, 
  CourseModule, 
  YouTubeVideo, 
  CourseraLink,
  getUserCourseProgress,
  enrollUserInCourse,
  completeCourseModule,
  getCourseUnlockStatus,
  UserCourseProgress
} from '@/integrations/firebase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  PlayCircle, 
  ExternalLink, 
  Clock, 
  CheckCircle2, 
  Users, 
  Star,
  Award,
  Target,
  Video,
  FileText,
  Download,
  Link
} from 'lucide-react';
import YouTubePlayer from '@/components/YouTubePlayer';

interface CourseViewProps {
  course: Course;
  onBack?: () => void;
}

const CourseView: React.FC<CourseViewProps> = ({ course, onBack }) => {
  const { userProfile } = useAuth();
  const [courseProgress, setCourseProgress] = useState<UserCourseProgress | null>(null);
  const [unlockStatus, setUnlockStatus] = useState<{isEnrolled: boolean; isCompleted: boolean; progressPercentage: number}>({
    isEnrolled: false,
    isCompleted: false,
    progressPercentage: 0
  });
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<CourseraLink | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userProfile && course) {
      loadCourseProgress();
    }
  }, [userProfile, course]);

  const loadCourseProgress = async () => {
    if (!userProfile || !course) return;
    
    try {
      const progress = await getUserCourseProgress(userProfile.id, course.id);
      const status = await getCourseUnlockStatus(userProfile.id, course.id);
      
      setCourseProgress(progress);
      setUnlockStatus(status);
    } catch (error) {
      console.error('Failed to load course progress:', error);
    }
  };

  const handleEnroll = async () => {
    if (!userProfile || !course) return;
    
    setLoading(true);
    try {
      await enrollUserInCourse(userProfile.id, course.id);
      await loadCourseProgress();
    } catch (error) {
      console.error('Failed to enroll in course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoComplete = async (moduleId: string, videoId: string) => {
    if (!userProfile || !course) return;
    
    try {
      await completeCourseModule(userProfile.id, course.id, moduleId, 'video', videoId, 5); // 5 minutes per video
      await loadCourseProgress();
    } catch (error) {
      console.error('Failed to complete video:', error);
    }
  };

  const handleCourseComplete = async (moduleId: string, courseId: string) => {
    if (!userProfile || !course) return;
    
    try {
      await completeCourseModule(userProfile.id, course.id, moduleId, 'course', courseId, 10); // 10 minutes per course
      await loadCourseProgress();
    } catch (error) {
      console.error('Failed to complete course:', error);
    }
  };

  const isModuleContentCompleted = (moduleId: string, contentType: 'video' | 'course', contentId: string) => {
    const moduleProgress = courseProgress?.module_progress[moduleId];
    if (!moduleProgress) return false;
    
    if (contentType === 'video') {
      return moduleProgress.completed_videos.includes(contentId);
    } else {
      return moduleProgress.completed_courses.includes(contentId);
    }
  };

  const getModuleProgress = (module: CourseModule) => {
    const moduleProgress = courseProgress?.module_progress[module.id];
    if (!moduleProgress) return 0;
    
    const totalContent = module.youtube_videos.length + module.coursera_links.length;
    const completedContent = moduleProgress.completed_videos.length + moduleProgress.completed_courses.length;
    
    return totalContent > 0 ? (completedContent / totalContent) * 100 : 0;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Advanced': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary"></div>
          <p className="mt-4 text-lg text-muted-foreground">Loading course...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Course Header */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-300 dark:border-blue-600 shadow-lg mb-6">
        <CardHeader className="pb-6">
          <div className="flex items-start justify-between">
            <div className="space-y-4">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                {course.title}
              </CardTitle>
              <CardDescription className="text-base leading-relaxed">
                {course.description}
              </CardDescription>
              <div className="flex items-center gap-4 flex-wrap">
                <Badge className={getDifficultyColor(course.difficulty_level)}>
                  {course.difficulty_level}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {course.estimated_duration}
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  {course.enrollment_count || 0} enrolled
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="w-4 h-4" />
                  {course.rating.toFixed(1)} rating
                </div>
              </div>
            </div>
            
            {unlockStatus.isEnrolled ? (
              <div className="text-center">
                <div className="mb-2">
                  <Progress value={unlockStatus.progressPercentage} className="w-32" />
                </div>
                <p className="text-sm text-muted-foreground mb-2">{unlockStatus.progressPercentage}% Complete</p>
                {unlockStatus.isCompleted && (
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Completed
                  </Badge>
                )}
              </div>
            ) : (
              <Button 
                onClick={handleEnroll}
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg"
              >
                {loading ? 'Enrolling...' : 'Enroll Now'}
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Course Content */}
      {unlockStatus.isEnrolled && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-50 data-[state=active]:border-blue-500 border-2 border-transparent">Overview</TabsTrigger>
            <TabsTrigger value="modules" className="data-[state=active]:bg-blue-50 data-[state=active]:border-blue-500 border-2 border-transparent">Modules</TabsTrigger>
            <TabsTrigger value="progress" className="data-[state=active]:bg-blue-50 data-[state=active]:border-blue-500 border-2 border-transparent">Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 border-2 border-gray-100 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-900/50 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-2 border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Target className="w-5 h-5 text-blue-500" />
                    Learning Objectives
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {course.learning_objectives.map((objective, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{objective}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="w-5 h-5 text-purple-500" />
                    Target Audience
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {course.target_audience.map((audience, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Award className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                        <span>{audience}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Course Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Modules:</span>
                      <span className="font-medium">{course.modules.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Total Videos:</span>
                      <span className="font-medium">
                        {course.modules.reduce((sum, m) => sum + m.youtube_videos.length, 0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Total Courses:</span>
                      <span className="font-medium">
                        {course.modules.reduce((sum, m) => sum + m.coursera_links.length, 0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Completion Rate:</span>
                      <span className="font-medium">{course.completion_rate}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Course Materials Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Documents Section */}
              {course.documents && course.documents.length > 0 && (
                <Card className="border-2 border-gray-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileText className="w-5 h-5 text-green-500" />
                      Course Documents
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {course.documents.map((docUrl, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-green-500" />
                            <span className="text-sm font-medium truncate max-w-xs">
                              {docUrl.split('/').pop() || `Document ${index + 1}`}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(docUrl, '_blank')}
                              className="border-green-300 text-green-600 hover:bg-green-50"
                            >
                              <ExternalLink className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = docUrl;
                                link.download = docUrl.split('/').pop() || `document-${index + 1}`;
                                link.click();
                              }}
                              className="border-blue-300 text-blue-600 hover:bg-blue-50"
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* YouTube Links Section */}
              {course.youtubeLinks && course.youtubeLinks.length > 0 && (
                <Card className="border-2 border-gray-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Video className="w-5 h-5 text-red-500" />
                      Course Videos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {course.youtubeLinks.map((youtubeUrl, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Video className="w-4 h-4 text-red-500" />
                            <span className="text-sm font-medium truncate max-w-xs">
                              {youtubeUrl.includes('youtube.com/watch?v=') 
                                ? `Video ${index + 1}` 
                                : youtubeUrl
                              }
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(youtubeUrl, '_blank')}
                              className="border-red-300 text-red-600 hover:bg-red-50"
                            >
                              <ExternalLink className="w-4 h-4 mr-1" />
                              Watch
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // Extract video ID from YouTube URL
                                const videoId = youtubeUrl.split('v=')[1]?.split('&')[0];
                                if (videoId) {
                                  setSelectedVideo({
                                    id: `video-${index}`,
                                    title: `Course Video ${index + 1}`,
                                    video_id: videoId,
                                    description: `Video content for ${course.title}`,
                                    duration: 'Auto',
                                    thumbnail_url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
                                    order: index
                                  });
                                }
                              }}
                              className="border-blue-300 text-blue-600 hover:bg-blue-50"
                            >
                              <PlayCircle className="w-4 h-4 mr-1" />
                              Play
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="modules" className="space-y-6 border-2 border-gray-100 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-900/50 mt-4">
            <div className="space-y-6">
              {course.modules.map((module, index) => (
                <Card key={module.id} className="border-2 border-gray-200 hover:border-blue-400 transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center border-2 border-blue-300">
                          {index + 1}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{module.title}</CardTitle>
                          <CardDescription>{module.description}</CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <Progress value={getModuleProgress(module)} className="w-24 mb-2" />
                        <p className="text-sm text-muted-foreground">{Math.round(getModuleProgress(module))}%</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* YouTube Videos */}
                      {module.youtube_videos.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <Video className="w-4 h-4 text-red-500" />
                            Videos ({module.youtube_videos.length})
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {module.youtube_videos.map((video) => (
                              <Card key={video.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedVideo(video)}>
                                <CardHeader className="pb-3">
                                  <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm line-clamp-2">{video.title}</CardTitle>
                                    {isModuleContentCompleted(module.id, 'video', video.id) && (
                                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                                    )}
                                  </div>
                                </CardHeader>
                                <CardContent>
                                  <div className="flex items-center justify-between">
                                    <Badge variant="outline" className="text-xs">
                                      <Clock className="w-3 h-3 mr-1" />
                                      {video.duration}
                                    </Badge>
                                    <PlayCircle className="w-4 h-4 text-blue-500" />
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Coursera Courses */}
                      {module.coursera_links.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-purple-500" />
                            Courses ({module.coursera_links.length})
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {module.coursera_links.map((courseraCourse) => (
                              <Card key={courseraCourse.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedCourse(courseraCourse)}>
                                <CardHeader className="pb-3">
                                  <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm line-clamp-2">{courseraCourse.title}</CardTitle>
                                    {isModuleContentCompleted(module.id, 'course', courseraCourse.id) && (
                                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                                    )}
                                  </div>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <Badge className={`${getDifficultyColor(courseraCourse.difficulty)} text-xs`}>
                                        {courseraCourse.difficulty}
                                      </Badge>
                                      <Badge variant="outline" className="text-xs">
                                        <Clock className="w-3 h-3 mr-1" />
                                        {courseraCourse.duration}
                                      </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs text-muted-foreground">{courseraCourse.provider}</span>
                                      <ExternalLink className="w-4 h-4 text-purple-500" />
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6 border-2 border-gray-100 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-900/50 mt-4">
            <div className="space-y-6">
              <Card className="border-2 border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-500" />
                    Overall Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Course Completion</span>
                        <span className="text-sm font-medium">{unlockStatus.progressPercentage}%</span>
                      </div>
                      <Progress value={unlockStatus.progressPercentage} className="h-2" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {courseProgress?.total_videos_watched || 0}
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-400">Videos Watched</div>
                      </div>
                      <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {courseProgress?.total_courses_completed || 0}
                        </div>
                        <div className="text-xs text-purple-600 dark:text-purple-400">Courses Completed</div>
                      </div>
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {courseProgress?.completed_modules?.length || 0}
                        </div>
                        <div className="text-xs text-green-600 dark:text-green-400">Modules Completed</div>
                      </div>
                      <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                          {Math.round((courseProgress?.total_time_spent || 0) / 60)}h
                        </div>
                        <div className="text-xs text-orange-600 dark:text-orange-400">Time Spent</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Video Player Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">{selectedVideo.title}</h3>
                <Button variant="ghost" onClick={() => setSelectedVideo(null)}>
                  ×
                </Button>
              </div>
              <YouTubePlayer
                videoId={selectedVideo.video_id}
                title={selectedVideo.title}
                description={selectedVideo.description}
              />
              <div className="mt-4 flex justify-end">
                <Button 
                  onClick={() => {
                    const module = course.modules.find(m => 
                      m.youtube_videos.some(v => v.id === selectedVideo.id)
                    );
                    if (module) {
                      handleVideoComplete(module.id, selectedVideo.id);
                    }
                    setSelectedVideo(null);
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  Mark as Complete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Course Link Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">{selectedCourse.title}</h3>
                <Button variant="ghost" onClick={() => setSelectedCourse(null)}>
                  ×
                </Button>
              </div>
              <p className="text-muted-foreground mb-4">{selectedCourse.description}</p>
              <div className="flex gap-4">
                <Button 
                  onClick={() => window.open(selectedCourse.url, '_blank')}
                  className="bg-purple-500 hover:bg-purple-600 text-white"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Course
                </Button>
                <Button 
                  onClick={() => {
                    const module = course.modules.find(m => 
                      m.coursera_links.some(c => c.id === selectedCourse.id)
                    );
                    if (module) {
                      handleCourseComplete(module.id, selectedCourse.id);
                    }
                    setSelectedCourse(null);
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  Mark as Complete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseView;
