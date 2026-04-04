import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  signInWithEmail, 
  signUpWithEmail, 
  getCurrentUser,
  createUserProfile,
  getUserProfile,
  auth
} from '@/integrations/firebase/client';
import { LogIn, UserPlus, Code, Sparkles, GraduationCap, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'student' | 'teacher' | 'admin'>('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        navigate('/division-selection');
      }
    });
    
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔄 Starting signup process...');
      const userCredential = await signUpWithEmail(email, password);
      
      if (userCredential.user) {
        console.log('✅ User created in Firebase Auth:', userCredential.user.uid);
        
        try {
          // Create user profile in Firestore
          console.log('🔄 Creating user profile in Firestore...');
          await createUserProfile(userCredential.user, role);
          console.log('✅ User profile created successfully in Firestore');

          // Redirect based on role
          if (role === 'admin') {
            toast({
              title: "Admin account created!",
              description: "Redirecting to admin dashboard...",
            });
            navigate('/admin/dashboard');
          } else if (role === 'teacher') {
            toast({
              title: "Teacher account created!",
              description: "Redirecting to your dashboard...",
            });
            navigate('/teacher/dashboard');
          } else {
            toast({
              title: "Student account created successfully!",
              description: "Welcome to Hello World!",
            });
            navigate('/division-selection');
          }
        } catch (profileError) {
          console.error('❌ Failed to create user profile:', profileError);
          
          // Even if profile creation fails, we can still proceed
          // The user exists in Auth, so they can be redirected to complete profile
          toast({
            title: "Account created!",
            description: "Your account was created but there was an issue setting up your profile. You can complete it later.",
            variant: "default"
          });
          
          // Redirect to division selection anyway - user exists in Auth
          navigate('/division-selection');
        }
      }
    } catch (error: unknown) {
      console.error('❌ Signup error:', error);
      setError(error instanceof Error ? error.message : 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userCredential = await signInWithEmail(email, password);

      if (userCredential.user) {
        // Check user profile for role
        const profile = await getUserProfile(userCredential.user.uid);
        
        if (profile?.role === 'admin') {
          toast({
            title: "Welcome back, Admin!",
            description: "Redirecting to admin dashboard...",
          });
          navigate('/admin/dashboard');
        } else if (profile?.role === 'teacher') {
          toast({
            title: "Welcome back, Teacher!",
            description: "Redirecting to your dashboard...",
          });
          navigate('/teacher/dashboard');
        } else {
          toast({
            title: "Welcome back, Student!",
            description: "You have been logged in successfully.",
          });
          navigate('/division-selection');
        }
      }
    } catch (error: unknown) {
      console.error('Signin error:', error);
      setError(error instanceof Error ? error.message : 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Code className="w-8 h-8 text-golden" />
            <span className="text-2xl font-bold text-foreground">Hello World</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-golden" />
            Join the Learning Journey
          </h1>
          <p className="text-muted-foreground">
            Access personalized roadmaps, track progress, and level up your coding skills
          </p>
        </div>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LogIn className="w-5 h-5 text-golden" />
                  Welcome Back
                </CardTitle>
                <CardDescription>
                  Sign in to continue your learning journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="user@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>

                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-golden" />
                  Create Account
                </CardTitle>
                <CardDescription>
                  Start your personalized coding journey today
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="User"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="user@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Minimum 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="space-y-3">
                    <Label>I am a</Label>
                    <RadioGroup value={role} onValueChange={(value: 'student' | 'teacher' | 'admin') => setRole(value)}>
                      <div className="flex items-center space-x-2 bg-card/30 p-3 rounded-lg border border-border/30 hover:border-golden/30 transition-colors">
                        <RadioGroupItem value="student" id="student" />
                        <Label htmlFor="student" className="flex items-center gap-2 cursor-pointer flex-1">
                          <GraduationCap className="w-4 h-4 text-golden" />
                          <div>
                            <div className="font-medium">Student</div>
                            <div className="text-xs text-muted-foreground">Learn and track my progress</div>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 bg-card/30 p-3 rounded-lg border border-border/30 hover:border-golden/30 transition-colors">
                        <RadioGroupItem value="teacher" id="teacher" />
                        <Label htmlFor="teacher" className="flex items-center gap-2 cursor-pointer flex-1">
                          <Users className="w-4 h-4 text-golden" />
                          <div>
                            <div className="font-medium">Teacher</div>
                            <div className="text-xs text-muted-foreground">Monitor student progress</div>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 bg-card/30 p-3 rounded-lg border border-border/30 hover:border-golden/30 transition-colors">
                        <RadioGroupItem value="admin" id="admin" />
                        <Label htmlFor="admin" className="flex items-center gap-2 cursor-pointer flex-1">
                          <Sparkles className="w-4 h-4 text-golden" />
                          <div>
                            <div className="font-medium">Admin</div>
                            <div className="text-xs text-muted-foreground">Manage platform and users</div>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Creating account...' : 'Create Account'}
                  </Button>

                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="text-center mt-6 text-sm text-muted-foreground">
          <p>Join thousands of developers mastering their craft</p>
          <div className="flex items-center justify-center gap-4 mt-2">
            <span>🚀 Personalized Roadmaps</span>
            <span>📊 Progress Tracking</span>
            <span>🏆 Achievements</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
