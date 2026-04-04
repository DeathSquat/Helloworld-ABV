import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Code,
  Users,
  Trophy,
  Target,
  Sparkles,
  ArrowRight,
  Clock,
  Star,
  Zap
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';

const DivisionSelection = () => {
  const [selectedDivision, setSelectedDivision] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const userName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'Developer';

  useEffect(() => {
    // Check if user is a teacher and redirect accordingly
    const checkUserRole = async () => {
      if (user) {
        const userRoleDoc = await getDoc(doc(db, 'user_roles', user.uid));
        const userRole = userRoleDoc.exists() ? userRoleDoc.data() : null;

        if (userRole?.role === 'teacher') {
          navigate('/teacher/dashboard');
        }
      }
    };

    checkUserRole();
  }, [user, navigate]);

  const divisions = [
    {
      id: '6-12',
      title: '6-12 Academic Section',
      description: 'Comprehensive learning for middle and high school students',
      icon: BookOpen,
      color: 'from-blue-500 to-purple-600',
      features: ['Interactive Lessons', 'Progress Tracking', 'Gamified Learning', 'Live Classes'],
      path: '/academic/dashboard'
    },
    {
      id: 'coding',
      title: 'Coding & Development',
      description: 'Master programming languages and build real projects',
      icon: Code,
      color: 'from-green-500 to-teal-600',
      features: ['Hands-on Coding', 'Project-Based Learning', 'Code Reviews', 'Career Guidance'],
      path: '/coding/dashboard'
    }
  ];

  const handleDivisionSelect = async (divisionId: string) => {
    setSelectedDivision(divisionId);
    setLoading(true);

    try {
      const selectedDivision = divisions.find(d => d.id === divisionId);
      
      if (selectedDivision) {
        toast({
          title: "Welcome to Hello World!",
          description: `Entering ${selectedDivision.title}...`,
        });

        // Simulate loading delay for better UX
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        navigate(selectedDivision.path);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load division. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setSelectedDivision(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Choose Your Learning Path
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            Welcome back, <span className="text-golden font-semibold">{userName}</span>!
          </p>
          <p className="text-gray-400">
            Select your educational journey and unlock your potential
          </p>
        </div>

        {/* Division Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {divisions.map((division) => {
            const Icon = division.icon;
            const isSelected = selectedDivision === division.id;
            
            return (
              <Card
                key={division.id}
                className={`relative overflow-hidden border-2 transition-all duration-300 cursor-pointer ${
                  isSelected 
                    ? 'border-golden shadow-2xl shadow-golden/20 scale-105' 
                    : 'border-gray-700 hover:border-gray-600 hover:shadow-xl'
                } bg-gray-800/50 backdrop-blur-sm`}
                onClick={() => !loading && handleDivisionSelect(division.id)}
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${division.color} opacity-10`} />
                
                <CardHeader className="relative z-10">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${division.color} flex items-center justify-center`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-2xl font-bold text-white">
                        {division.title}
                      </CardTitle>
                      <CardDescription className="text-gray-300 mt-1">
                        {division.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="relative z-10">
                  {/* Features */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-400 mb-3">What you'll get:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {division.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-golden" />
                          <span className="text-sm text-gray-300">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    className={`w-full py-3 text-lg font-semibold transition-all duration-300 ${
                      isSelected
                        ? 'bg-golden hover:bg-golden/90 text-gray-900'
                        : `bg-gradient-to-r ${division.color} hover:opacity-90 text-white`
                    }`}
                    disabled={loading}
                  >
                    {loading && isSelected ? (
                      <>
                        <Clock className="w-5 h-5 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        {isSelected ? (
                          <>
                            <Zap className="w-5 h-5 mr-2" />
                            Entering...
                          </>
                        ) : (
                          <>
                            Start Learning
                            <ArrowRight className="w-5 h-5 ml-2" />
                          </>
                        )}
                      </>
                    )}
                  </Button>
                </CardContent>

                {/* Decorative Elements */}
                <div className="absolute top-2 right-2">
                  <Badge variant="outline" className="bg-gray-900/50 border-gray-600 text-gray-300">
                    Popular
                  </Badge>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <div className="flex items-center justify-center gap-8 text-gray-400">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-golden" />
              <span className="text-sm">10,000+ Active Learners</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-golden" />
              <span className="text-sm">Expert-Led Courses</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-golden" />
              <span className="text-sm">Goal-Oriented Learning</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Not sure where to start? Try our <span className="text-golden font-semibold">Free Assessment</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DivisionSelection;