import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Code,
  BookOpen,
  PlayCircle,
  Clock,
  Star,
  Target,
  Trophy,
  Lock,
  CheckCircle,
  ArrowRight,
  Download,
  ExternalLink,
  Users,
  Award
} from 'lucide-react';
import { getFrequentCourses, Course } from '@/integrations/firebase/client';
import CourseView from '@/components/CourseView';

const CodingLanguages = () => {
  const [selectedCategory, setSelectedCategory] = useState('popular');
  const [frequentCourses, setFrequentCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 'popular', name: 'Popular Languages' },
    { id: 'beginner', name: 'Beginner Friendly' },
    { id: 'advanced', name: 'Advanced' },
    { id: 'web', name: 'Web Development' },
    { id: 'mobile', name: 'Mobile Development' }
  ];

  const languages = {
    popular: [
      // {
      //   id: 1,
      //   name: 'Python',
      //   icon: '🐍',
      //   description: 'Easy to learn, powerful programming language',
      //   difficulty: 'Beginner',
      //   progress: 75,
      //   lessons: 50,
      //   completed: 38,
      //   projects: 12,
      //   unlocked: true,
      //   features: ['Data Science', 'Web Development', 'Automation', 'AI/ML'],
      //   estimatedTime: '8-12 weeks'
      // },
      // {
      //   id: 2,
      //   name: 'JavaScript',
      //   icon: '🌐',
      //   description: 'The language of the web - frontend and backend',
      //   difficulty: 'Beginner',
      //   progress: 45,
      //   lessons: 60,
      //   completed: 27,
      //   projects: 8,
      //   unlocked: true,
      //   features: ['Web Development', 'Node.js', 'React', 'Vue.js'],
      //   estimatedTime: '10-14 weeks'
      // },
      // {
      //   id: 3,
      //   name: 'Java',
      //   icon: '☕',
      //   description: 'Object-oriented programming for enterprise applications',
      //   difficulty: 'Intermediate',
      //   progress: 30,
      //   lessons: 55,
      //   completed: 17,
      //   projects: 5,
      //   unlocked: true,
      //   features: ['Enterprise Apps', 'Android', 'Spring Framework', 'Microservices'],
      //   estimatedTime: '12-16 weeks'
      // },
      // {
      //   id: 4,
      //   name: 'C++',
      //   icon: '⚡',
      //   description: 'High-performance programming language',
      //   difficulty: 'Advanced',
      //   progress: 0,
      //   lessons: 65,
      //   completed: 0,
      //   projects: 0,
      //   unlocked: false,
      //   features: ['System Programming', 'Game Development', 'Performance Critical'],
      //   estimatedTime: '16-20 weeks'
      // }
    ],
    beginner: [
      {
        id: 1,
        name: 'Python',
        icon: '🐍',
        description: 'Perfect first programming language',
        difficulty: 'Beginner',
        progress: 75,
        lessons: 50,
        completed: 38,
        projects: 12,
        unlocked: true,
        features: ['Simple Syntax', 'Great Community', 'Versatile'],
        estimatedTime: '8-12 weeks'
      },
      {
        id: 2,
        name: 'Scratch',
        icon: '🎨',
        description: 'Visual programming for beginners',
        difficulty: 'Beginner',
        progress: 100,
        lessons: 25,
        completed: 25,
        projects: 10,
        unlocked: true,
        features: ['Visual Programming', 'No Syntax', 'Game Creation'],
        estimatedTime: '4-6 weeks'
      }
    ]
  };

  const currentLanguages = languages[selectedCategory as keyof typeof languages] || languages.popular;

  useEffect(() => {
    loadFrequentCourses();
  }, []);

  const loadFrequentCourses = async () => {
    try {
      const courses = await getFrequentCourses(6);
      setFrequentCourses(courses);
    } catch (error) {
      console.error('Failed to load frequent courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Advanced': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  if (selectedCourse) {
    return (
      <CourseView 
        course={selectedCourse} 
        onBack={() => setSelectedCourse(null)} 
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Code className="w-8 h-8 text-purple-400" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Programming Languages</h1>
            <p className="text-muted-foreground">Master the languages that power the digital world</p>
          </div>
        </div>

        {/* Category Selection */}
        {/* <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className={selectedCategory === category.id ? 'bg-purple-500 hover:bg-purple-600' : 'hover:bg-purple-500/10'}
            >
              {category.name}
            </Button>
          ))}
        </div> */}
      </div>

      {/* Languages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentLanguages.map((language) => (
          <Card 
            key={language.id} 
            className={`relative overflow-hidden transition-all duration-300 hover-scale ${
              language.unlocked 
                ? 'bg-card/50 backdrop-blur-sm border-border/50 hover:border-purple-500/30' 
                : 'bg-card/20 border-border/30 opacity-75'
            }`}
          >
            {!language.unlocked && (
              <div className="absolute top-4 right-4">
                <Lock className="w-5 h-5 text-muted-foreground" />
              </div>
            )}
            
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <CardTitle className="text-xl text-foreground mb-2 flex items-center gap-3">
                    <span className="text-2xl">{language.icon}</span>
                    <div>
                      {language.name}
                      {language.progress === 100 && <CheckCircle className="w-5 h-5 text-emerald-400 inline ml-2" />}
                    </div>
                  </CardTitle>
                  <Badge variant="outline" className={`text-xs w-fit mb-3 ${
                    language.difficulty === 'Beginner' ? 'border-emerald-500/50 text-emerald-400' :
                    language.difficulty === 'Intermediate' ? 'border-yellow-500/50 text-yellow-400' :
                    'border-red-500/50 text-red-400'
                  }`}>
                    {language.difficulty}
                  </Badge>
                  <p className="text-sm text-muted-foreground mb-3">{language.description}</p>
                  
                  {/* Features */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {language.features.slice(0, 3).map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs border-purple-500/30 text-purple-300">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Progress */}
              {language.unlocked && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-foreground font-medium">{language.progress}%</span>
                  </div>
                  <Progress 
                    value={language.progress} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{language.completed}/{language.lessons} lessons completed</span>
                    <span>{language.projects} projects</span>
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Estimated Time</div>
                  <div className="font-semibold text-purple-400">{language.estimatedTime}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Total Lessons</div>
                  <div className="font-semibold text-blue-400">{language.lessons}</div>
                </div>
              </div>

              {/* Action Button */}
              <Button 
                className={`w-full ${
                  language.unlocked 
                    ? language.progress === 0 
                      ? 'bg-purple-500 hover:bg-purple-600' 
                      : language.progress === 100
                        ? 'bg-emerald-500 hover:bg-emerald-600'
                        : 'bg-golden hover:bg-golden/90'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
                disabled={!language.unlocked}
              >
                {language.unlocked ? (
                  <>
                    {language.progress === 0 ? (
                      <>
                        <PlayCircle className="w-4 h-4 mr-2" />
                        Start Learning
                      </>
                    ) : language.progress === 100 ? (
                      <>
                        <Trophy className="w-4 h-4 mr-2" />
                        View Certificate
                      </>
                    ) : (
                      <>
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Continue Learning
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Complete Prerequisites
                  </>
                )}
              </Button>

              {/* Additional Actions */}
              {language.unlocked && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Docs
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Examples
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Frequent Courses Section */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          {/* <div className="flex items-center gap-3">
            <Award className="w-6 h-6 text-purple-400" />
            {/* <h2 className="text-2xl font-bold text-foreground">Frequent Courses</h2>
            <p className="text-muted-foreground">Popular courses selected by our community</p> */}
          {/* </div> */}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-500"></div>
          </div>
        ) : frequentCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {frequentCourses.map((course) => (
              <Card 
                key={course.id}
                className="group relative overflow-hidden border-2 border-gray-200 hover:border-purple-400 transition-all duration-300 cursor-pointer hover:shadow-xl hover:scale-105 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800"
                onClick={() => setSelectedCourse(course)}
              >
                <div className="absolute top-4 right-4 z-10">
                  <Badge 
                    variant="outline" 
                    className={`text-xs font-semibold px-2 py-1 ${getDifficultyColor(course.difficulty_level)}`}
                  >
                    {course.difficulty_level}
                  </Badge>
                </div>
                
                <CardHeader className="pb-4 pt-16">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {course.title.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 mb-2 group-hover:text-purple-600 transition-colors">
                        {course.title}
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed">
                        {course.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    {course.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                        {tag}
                      </Badge>
                    ))}
                    {course.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{course.tags.length - 3} more
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span className="text-gray-600 dark:text-gray-400">{course.estimated_duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-green-500" />
                      <span className="text-gray-600 dark:text-gray-400">{course.enrollment_count || 0} enrolled</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-gray-600 dark:text-gray-400">{course.rating.toFixed(1)} rating</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-purple-500" />
                      <span className="text-gray-600 dark:text-gray-400">{course.modules.length} modules</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {course.category} • {course.language}
                    </span>
                    <ArrowRight className="w-4 h-4 text-purple-500 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No courses available</h3>
            <p className="text-muted-foreground">Check back later for new courses!</p>
          </div>
        )}
      </div>

      {/* Learning Path Recommendation */}
      <Card className="mt-8 bg-gradient-to-r from-purple-500/10 to-pink-500/5 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-xl text-foreground flex items-center gap-2">
            <Target className="w-6 h-6 text-purple-400" />
            Recommended Learning Path
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Based on your progress and goals, here's your personalized learning path:
            </p>
            <div className="flex items-center gap-4 overflow-x-auto pb-2">
              <div className="flex items-center gap-2 min-w-fit bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-medium">1. Python Basics</span>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
              <div className="flex items-center gap-2 min-w-fit bg-golden/10 border border-golden/20 rounded-lg p-3">
                <Clock className="w-5 h-5 text-golden" />
                <span className="text-sm font-medium">2. JavaScript Fundamentals</span>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
              <div className="flex items-center gap-2 min-w-fit bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <Target className="w-5 h-5 text-blue-400" />
                <span className="text-sm font-medium">3. Web Development</span>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
              <div className="flex items-center gap-2 min-w-fit bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                <Lock className="w-5 h-5 text-purple-400" />
                <span className="text-sm font-medium">4. Advanced Topics</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CodingLanguages;