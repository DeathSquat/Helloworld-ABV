import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { testFirebaseConnection, createTestUserProfile } from '@/utils/testFirebase';
import { getCurrentUser } from '@/integrations/firebase/client';
import { Database, CheckCircle, XCircle } from 'lucide-react';

const FirebaseTest = () => {
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
  }, []);

  const runConnectionTest = async () => {
    setLoading(true);
    setTestResult(null);
    
    try {
      const result = await testFirebaseConnection();
      setTestResult(result);
    } catch (error) {
      setTestResult({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  const createTestProfile = async () => {
    if (!currentUser) {
      setTestResult({ success: false, error: 'No user logged in' });
      return;
    }
    
    setLoading(true);
    setTestResult(null);
    
    try {
      const result = await createTestUserProfile(currentUser, 'student');
      setTestResult(result);
    } catch (error) {
      setTestResult({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Database className="w-6 h-6 text-golden" />
            <CardTitle>Firebase Connection Test</CardTitle>
          </div>
          <CardDescription>
            Test Firebase connectivity and permissions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">Current User:</span>
              <span className={currentUser ? "text-green-500" : "text-red-500"}>
                {currentUser?.email || 'Not logged in'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Project:</span>
              <span className="text-muted-foreground">helloworld-2756c</span>
            </div>
          </div>

          <div className="space-y-2">
            <Button 
              onClick={runConnectionTest} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Testing...' : 'Test Connection'}
            </Button>
            
            {currentUser && (
              <Button 
                onClick={createTestProfile} 
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                {loading ? 'Creating...' : 'Create Test Profile'}
              </Button>
            )}
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
                    ? '✅ Connection test passed!' 
                    : `❌ Error: ${testResult.error}`
                  }
                </AlertDescription>
              </div>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FirebaseTest;
