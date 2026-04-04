import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  RotateCcw, 
  Copy, 
  Download, 
  Upload, 
  CheckCircle, 
  XCircle, 
  Terminal,
  Code,
  FileText,
  Lightbulb
} from 'lucide-react';

interface IDEProjectProps {
  project: {
    id: string;
    title: string;
    description: string;
    language: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    starter_code: string;
    solution_code: string;
    instructions: string;
  };
  className?: string;
}

const IDEProject: React.FC<IDEProjectProps> = ({ project, className = '' }) => {
  const [code, setCode] = useState(project.starter_code);
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [activeTab, setActiveTab] = useState('code');
  const editorRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setCode(project.starter_code);
  }, [project.starter_code]);

  const getLanguageIcon = (language: string) => {
    switch (language.toLowerCase()) {
      case 'javascript':
      case 'js':
        return '🟨';
      case 'python':
      case 'py':
        return '🐍';
      case 'java':
        return '☕';
      case 'typescript':
      case 'ts':
        return '🔷';
      case 'html':
        return '🌐';
      case 'css':
        return '🎨';
      default:
        return '💻';
    }
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

  const runCode = () => {
    setIsRunning(true);
    setOutput([]);
    
    // Simulate code execution with a delay
    setTimeout(() => {
      try {
        // Simple simulation for JavaScript
        if (project.language.toLowerCase().includes('javascript') || project.language.toLowerCase().includes('js')) {
          // Create a safe execution context
          const func = new Function(code);
          const result = func();
          
          setOutput([
            '> Running code...',
            `> Language: ${project.language}`,
            `> Result: ${result !== undefined ? result : 'Code executed successfully'}`,
            '> ✅ Execution completed'
          ]);
        } else {
          // For other languages, just show a simulated output
          setOutput([
            '> Running code...',
            `> Language: ${project.language}`,
            '> Simulating execution...',
            '> ✅ Code executed successfully (simulation mode)'
          ]);
        }
      } catch (error) {
        setOutput([
          '> ❌ Error during execution:',
          `> ${error instanceof Error ? error.message : 'Unknown error'}`,
          '> Please check your code and try again'
        ]);
      } finally {
        setIsRunning(false);
        setHasRun(true);
      }
    }, 1500);
  };

  const resetCode = () => {
    setCode(project.starter_code);
    setOutput([]);
    setHasRun(false);
    setShowSolution(false);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    // Could add a toast notification here
  };

  const loadSolution = () => {
    setCode(project.solution_code);
    setShowSolution(true);
  };

  const downloadCode = () => {
    const extension = project.language.toLowerCase().includes('javascript') ? 'js' : 
                     project.language.toLowerCase().includes('python') ? 'py' :
                     project.language.toLowerCase().includes('java') ? 'java' : 'txt';
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title.replace(/\s+/g, '_')}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Project Header */}
      <Card className="bg-background border-border shadow-lg">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="flex items-center gap-2 text-xl">
                <span className="text-2xl">{getLanguageIcon(project.language)}</span>
                {project.title}
              </CardTitle>
              <p className="text-muted-foreground">{project.description}</p>
              <div className="flex items-center gap-2">
                <Badge className={getDifficultyColor(project.difficulty)}>
                  {project.difficulty}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Code className="w-3 h-3" />
                  {project.language}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main IDE Interface */}
      <Card className="bg-background border-border shadow-lg">
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 border-b">
              <TabsTrigger value="instructions" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Instructions
              </TabsTrigger>
              <TabsTrigger value="code" className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                Code Editor
              </TabsTrigger>
              <TabsTrigger value="output" className="flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                Output
              </TabsTrigger>
              <TabsTrigger value="solution" className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Solution
              </TabsTrigger>
            </TabsList>

            {/* Instructions Tab */}
            <TabsContent value="instructions" className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Project Instructions
                </h3>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {project.instructions}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Code Editor Tab */}
            <TabsContent value="code" className="p-6">
              <div className="space-y-4">
                {/* Editor Toolbar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Code className="w-3 h-3" />
                      {project.language}
                    </Badge>
                    {showSolution && (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-300">
                        Solution Loaded
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyCode}
                      className="flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadCode}
                      className="flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetCode}
                      className="flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset
                    </Button>
                    <Button
                      onClick={runCode}
                      disabled={isRunning}
                      className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
                    >
                      {isRunning ? (
                        <>
                          <div className="w-3 h-3 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          Running...
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3" />
                          Run Code
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Code Editor */}
                <div className="relative">
                  <textarea
                    ref={editorRef}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full h-96 p-4 font-mono text-sm bg-gray-900 text-gray-100 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none resize-none"
                    placeholder="Write your code here..."
                    spellCheck={false}
                  />
                  <div className="absolute top-2 right-2 text-xs text-gray-500">
                    {code.split('\n').length} lines
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Output Tab */}
            <TabsContent value="output" className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Terminal className="w-5 h-5" />
                    Console Output
                  </h3>
                  {hasRun && (
                    <Badge variant={output.some(line => line.includes('❌')) ? 'destructive' : 'default'}>
                      {output.some(line => line.includes('❌')) ? (
                        <>
                          <XCircle className="w-3 h-3 mr-1" />
                        Error
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                        Success
                        </>
                      )}
                    </Badge>
                  )}
                </div>
                
                <div className="bg-gray-900 rounded-lg p-4 min-h-[200px]">
                  {output.length === 0 ? (
                    <div className="text-gray-500 text-sm">
                      {isRunning ? 'Running code...' : 'Run your code to see the output here'}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {output.map((line, index) => (
                        <div key={index} className="font-mono text-sm text-gray-300">
                          {line}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Solution Tab */}
            <TabsContent value="solution" className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    Solution
                  </h3>
                  <Button
                    onClick={loadSolution}
                    variant="outline"
                    className="flex items-center gap-1"
                  >
                    <Upload className="w-3 h-3" />
                    Load Solution
                  </Button>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm text-blue-800 dark:text-blue-200 mb-4">
                    Click "Load Solution" to view and run the reference solution. This will replace your current code.
                  </p>
                  
                  <div className="bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <pre className="font-mono text-sm text-gray-300 whitespace-pre-wrap">
                      {project.solution_code}
                    </pre>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default IDEProject;
