import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Trophy, 
  Target, 
  Clock, 
  Code, 
  BookOpen, 
  CheckCircle, 
  TrendingUp,
  Calendar,
  Award,
  Zap
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getUserProgress, updateSkillProgress, addDailyActivity } from '@/integrations/firebase/client';

const ProgressDashboard = () => {
  const { user, userProfile } = useAuth();
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProgress();
    }
  }, [user]);

  const loadProgress = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userProgress = await getUserProgress(user.uid);
      setProgress(userProgress);
    } catch (error) {
      console.error('Failed to load progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const simulateProgress = async () => {
    if (!user || !progress) return;

    try {
      // Simulate completing a lesson
      const skillName = 'python';
      const currentProgress = progress.skills_progress[skillName];
      
      await updateSkillProgress(user.uid, skillName, {
        progress: Math.min(100, currentProgress.progress + 10),
        xp: currentProgress.xp + 50,
        lessons_completed: currentProgress.lessons_completed + 1,
        last_practiced: new Date().toISOString()
      });

      // Add daily activity
      await addDailyActivity(user.uid, {
        xp_earned: 50,
        time_spent: 30,
        lessons_completed: 1,
        problems_solved: 2
      });

      // Reload progress
      await loadProgress();
    } catch (error) {
      console.error('Failed to simulate progress:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-golden"></div>
          <p className="mt-4 text-muted-foreground">Loading progress...</p>
        </div>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Target className="w-6 h-6 text-golden" />
              No Progress Data
            </CardTitle>
            <CardDescription>
              Start learning to see your progress here!
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={simulateProgress} className="bg-golden hover:bg-golden/90">
              Start Learning Journey
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const calculateOverallProgress = () => {
    const skills = Object.values(progress.skills_progress);
    const totalProgress = skills.reduce((sum: number, skill: any) => {
      const progressValue = typeof skill.progress === 'number' ? skill.progress : 0;
      return sum + progressValue;
    }, 0);
    return Math.round(totalProgress / skills.length);
  };

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-green-500';
      case 'Intermediate': return 'bg-blue-500';
      case 'Advanced': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Trophy className="w-8 h-8 text-golden" />
              Your Progress
            </h1>
            <p className="text-muted-foreground mt-2">
              Track your learning journey and achievements
            </p>
          </div>
          <Button onClick={simulateProgress} className="bg-golden hover:bg-golden/90">
            <Zap className="w-4 h-4 mr-2" />
            Simulate Progress
          </Button>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-golden">{calculateOverallProgress()}%</div>
              <Progress value={calculateOverallProgress()} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total XP</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">{userProfile?.total_xp || 0}</div>
              <p className="text-xs text-muted-foreground">
                +{progress.current_week_xp} this week
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Learning Streak</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{userProfile?.learning_streak || 0}</div>
              <p className="text-xs text-muted-foreground">days in a row</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-500">{progress.completed_lessons}</div>
              <p className="text-xs text-muted-foreground">lessons finished</p>
            </CardContent>
          </Card>
        </div>

        {/* Skills Progress */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="w-5 h-5 text-golden" />
              Skills Progress
            </CardTitle>
            <CardDescription>
              Your progress in different programming languages
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(progress.skills_progress).map(([skill, data]: [string, any]) => (
              <div key={skill} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium capitalize">{skill}</span>
                    <Badge className={getSkillLevelColor(data.level)}>
                      {data.level}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {data.progress}% • {data.xp} XP
                  </div>
                </div>
                <Progress value={data.progress} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{data.lessons_completed} lessons</span>
                  <span>{data.projects_completed} projects</span>
                  <span>Last: {data.last_practiced ? new Date(data.last_practiced).toLocaleDateString() : 'Never'}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-golden" />
                Learning Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Problems Solved</span>
                <span className="font-semibold">{progress.problems_solved}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Projects Completed</span>
                <span className="font-semibold">{progress.completed_projects}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quizzes Passed</span>
                <span className="font-semibold">{progress.completed_quizzes}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Skills Mastered</span>
                <span className="font-semibold">{progress.skills_mastered}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hours Coded</span>
                <span className="font-semibold">{progress.total_hours_coded}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-golden" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Trophy className="w-8 h-8 text-golden" />
                <div>
                  <div className="font-medium">First Steps</div>
                  <div className="text-sm text-muted-foreground">Complete your first lesson</div>
                </div>
              </div>
              {progress.completed_lessons >= 5 && (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Award className="w-8 h-8 text-blue-500" />
                  <div>
                    <div className="font-medium">Dedicated Learner</div>
                    <div className="text-sm text-muted-foreground">Complete 5 lessons</div>
                  </div>
                </div>
              )}
              {progress.skills_mastered >= 1 && (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Target className="w-8 h-8 text-green-500" />
                  <div>
                    <div className="font-medium">Skill Master</div>
                    <div className="text-sm text-muted-foreground">Master your first skill</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProgressDashboard;
