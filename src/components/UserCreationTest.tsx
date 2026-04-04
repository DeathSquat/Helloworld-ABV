import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  createUserProfile, 
  ensureUserScores, 
  getUserProfile,
  getCurrentUser,
  auth
} from '@/integrations/firebase/client';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Database, CheckCircle, XCircle, UserPlus } from 'lucide-react';

const UserCreationTest = () => {
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [testPassword, setTestPassword] = useState('test123456');

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
  }, []);

  const testUserCreation = async () => {
    setLoading(true);
    setTestResult(null);
    
    try {
      console.log('🧪 Starting user creation test...');
      
      // Step 1: Check if user is logged in
      const user = getCurrentUser();
      if (!user) {
        throw new Error('No user is currently logged in. Please sign in first.');
      }
      
      console.log('✅ Current user found:', user.email, user.uid);
      
      // Step 2: Check if profile already exists
      console.log('🔄 Checking if user profile already exists...');
      const existingProfile = await getUserProfile(user.uid);
      if (existingProfile) {
        console.log('ℹ️ User profile already exists:', existingProfile);
        setTestResult({
          success: true,
          message: 'User profile already exists',
          data: existingProfile
        });
        return;
      }
      
      // Step 3: Create user profile
      console.log('🔄 Creating user profile in Firestore...');
      const profile = await createUserProfile(user, 'student');
      console.log('✅ User profile created:', profile);
      
      // Step 4: Create user scores
      console.log('🔄 Creating user scores in Firestore...');
      const scores = await ensureUserScores(user);
      console.log('✅ User scores created:', scores);
      
      // Step 5: Verify profile was created
      console.log('🔄 Verifying profile creation...');
      const verifyProfile = await getUserProfile(user.uid);
      if (verifyProfile) {
        console.log('✅ Profile verification successful');
        setTestResult({
          success: true,
          message: 'User profile and scores created successfully!',
          data: {
            profile: verifyProfile,
            scores: scores
          }
        });
      } else {
        throw new Error('Profile verification failed - profile not found after creation');
      }
      
    } catch (error) {
      console.error('❌ User creation test failed:', error);
      setTestResult({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const testSignIn = async () => {
    setLoading(true);
    setTestResult(null);
    
    try {
      console.log('🔄 Signing in with test credentials...');
      const userCredential = await signInWithEmailAndPassword(auth, testEmail, testPassword);
      console.log('✅ Sign in successful:', userCredential.user.email);
      setCurrentUser(userCredential.user);
      
      setTestResult({
        success: true,
        message: 'Sign in successful! Now you can test user creation.',
        data: { user: userCredential.user }
      });
      
    } catch (error) {
      console.error('❌ Sign in failed:', error);
      setTestResult({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const checkCurrentProfile = async () => {
    setLoading(true);
    setTestResult(null);
    
    try {
      const user = getCurrentUser();
      if (!user) {
        throw new Error('No user is currently logged in');
      }
      
      console.log('🔄 Checking current user profile...');
      const profile = await getUserProfile(user.uid);
      
      if (profile) {
        console.log('✅ Profile found:', profile);
        setTestResult({
          success: true,
          message: 'User profile found in Firestore',
          data: profile
        });
      } else {
        console.log('ℹ️ No profile found in Firestore');
        setTestResult({
          success: false,
          error: 'No user profile found in Firestore. User exists in Auth but not in Firestore.'
        });
      }
      
    } catch (error) {
      console.error('❌ Profile check failed:', error);
      setTestResult({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <UserPlus className="w-6 h-6 text-golden" />
            <CardTitle>User Creation Test</CardTitle>
          </div>
          <CardDescription>
            Test Firebase user profile creation and Firestore integration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-sm space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">Current User:</span>
              <span className={currentUser ? "text-green-500" : "text-red-500"}>
                {currentUser?.email || 'Not logged in'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">User ID:</span>
              <span className="text-muted-foreground text-xs">
                {currentUser?.uid || 'N/A'}
              </span>
            </div>
          </div>

          {!currentUser && (
            <div className="space-y-4 p-4 border border-border/50 rounded-lg">
              <h3 className="font-medium">Sign In for Testing</h3>
              <div className="space-y-2">
                <Label htmlFor="test-email">Test Email</Label>
                <Input
                  id="test-email"
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="test@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="test-password">Test Password</Label>
                <Input
                  id="test-password"
                  type="password"
                  value={testPassword}
                  onChange={(e) => setTestPassword(e.target.value)}
                  placeholder="Enter password"
                />
              </div>
              <Button onClick={testSignIn} disabled={loading} className="w-full">
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3">
            <Button 
              onClick={testUserCreation} 
              disabled={loading || !currentUser}
              className="w-full"
            >
              {loading ? 'Testing...' : 'Test User Profile Creation'}
            </Button>
            
            <Button 
              onClick={checkCurrentProfile} 
              disabled={loading || !currentUser}
              variant="outline"
              className="w-full"
            >
              {loading ? 'Checking...' : 'Check Current Profile'}
            </Button>
          </div>

          {testResult && (
            <Alert className={testResult.success ? "border-green-500" : "border-red-500"}>
              <div className="flex items-center gap-2">
                {testResult.success ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                <AlertDescription>
                  {testResult.success 
                    ? `✅ ${testResult.message}` 
                    : `❌ Error: ${testResult.error}`
                  }
                </AlertDescription>
              </div>
              {testResult.data && (
                <div className="mt-2 p-2 bg-muted rounded text-xs">
                  <pre>{JSON.stringify(testResult.data, null, 2)}</pre>
                </div>
              )}
            </Alert>
          )}

          <div className="text-xs text-muted-foreground">
            <p><strong>Test Steps:</strong></p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Sign in with a test account (or use existing logged-in user)</li>
              <li>Click "Test User Profile Creation" to create Firestore profile</li>
              <li>Click "Check Current Profile" to verify profile exists</li>
              <li>Check browser console for detailed logs</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserCreationTest;
