// import '@n8n/chat/style.css';
// import { createChat } from '@n8n/chat';
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { ThemeProvider } from "@/components/ThemeProvider";
import LoadingScreen from "./components/LoadingScreen";
import { GuestLoginPrompt } from "./components/GuestLoginPrompt";
import Navbar from "./components/Navbar";
import AcademicNavbar from "./sections/academic/components/AcademicNavbar";
import CodingNavbar from "./sections/coding/components/CodingNavbar";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Languages from "./pages/Languages";
import CreateRoadmap from "./pages/CreateRoadmap";
import CodeIDE from "./pages/CodeIDE";
import Pricing from "./pages/Pricing";
import Leaderboard from "./pages/Leaderboard";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import DivisionSelection from "./pages/DivisionSelection";
import TeacherDashboard from "./pages/TeacherDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import UsersPage from "./pages/admin/UsersPage";
import RoadmapsPage from "./pages/admin/RoadmapsPage";
import CoursesPage from "./pages/admin/CoursesPage";
import LeaderboardPage from "./pages/admin/LeaderboardPage";
import AcademicGames from "./sections/academic/pages/AcademicGames";
import FirebaseTest from "./components/FirebaseTest";
import UserCreationTest from "./components/UserCreationTest";
import ProgressDashboard from "./components/ProgressDashboard";

// Academic Section Imports
import AcademicDashboard from "./sections/academic/pages/AcademicDashboard";
import AcademicLearning from "./sections/academic/pages/AcademicLearning";
import AcademicChallenges from "./sections/academic/pages/AcademicChallenges";
// Coding Section Imports
import CodingDashboard from "./sections/coding/pages/CodingDashboard";
import CodingLanguages from "./sections/coding/pages/CodingLanguages";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, requireDivision = true }: { children: React.ReactNode; requireDivision?: boolean }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingScreen onComplete={() => {}} />;
  }
  
  // Allow guest access - they'll see the login prompt after some time
  return (
    <>
      {!user && <GuestLoginPrompt delayMinutes={5} />}
      {children}
    </>
  );
};

const AppContent = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showMainApp, setShowMainApp] = useState(false);

  const handleLoadingComplete = () => {
    setIsLoading(false);
    setTimeout(() => setShowMainApp(true), 300);
  };

  if (isLoading) {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  if (!showMainApp) {
    return null;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/division-selection" element={
          <DivisionSelection />
        } />
        
        {/* Academic Section Routes */}
        <Route path="/academic/dashboard" element={
          <ProtectedRoute>
            <AcademicNavbar />
            <AcademicDashboard />
          </ProtectedRoute>
        } />
        <Route path="/academic/learning" element={
          <ProtectedRoute>
            <AcademicNavbar />
            <AcademicLearning />
          </ProtectedRoute>
        } />
        <Route path="/academic/challenges" element={
          <ProtectedRoute>
            <AcademicNavbar />
            <AcademicChallenges />
          </ProtectedRoute>
        } />
        <Route path="/academic/games" element={
          <ProtectedRoute>
            <AcademicNavbar />
            <AcademicGames />
          </ProtectedRoute>
        } />
        <Route path="/teacher/dashboard" element={
          <ProtectedRoute>
            <TeacherDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/dashboard" element={
          <ProtectedRoute>
            <AdminDashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute>
            <UsersPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/roadmaps" element={
          <ProtectedRoute>
            <RoadmapsPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/courses" element={
          <ProtectedRoute>
            <CoursesPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/leaderboard" element={
          <ProtectedRoute>
            <LeaderboardPage />
          </ProtectedRoute>
        } />
        <Route path="/test/firebase" element={<FirebaseTest />} />
        <Route path="/test/user-creation" element={<UserCreationTest />} />
        <Route path="/progress" element={
          <ProtectedRoute>
            <ProgressDashboard />
          </ProtectedRoute>
        } />
        <Route path="/academic/progress" element={
          <ProtectedRoute>
            <ProgressDashboard />
          </ProtectedRoute>
        } />
        <Route path="/academic/achievements" element={
          <ProtectedRoute>
            <AcademicNavbar />
            <div className="min-h-screen bg-background flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-foreground mb-4">Achievements Coming Soon!</h1>
                <p className="text-muted-foreground">Achievement system is being developed.</p>
              </div>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/academic/social" element={
          <ProtectedRoute>
            <AcademicNavbar />
            <div className="min-h-screen bg-background flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-foreground mb-4">Social Learning Coming Soon!</h1>
                <p className="text-muted-foreground">Social learning features are being developed.</p>
              </div>
            </div>
          </ProtectedRoute>
        } />
        
        {/* Coding Section Routes */}
        <Route path="/coding/dashboard" element={
          <ProtectedRoute>
            <CodingNavbar />
            <CodingDashboard />
          </ProtectedRoute>
        } />
        <Route path="/coding/languages" element={
          <ProtectedRoute>
            <CodingNavbar />
            <CodingLanguages />
          </ProtectedRoute>
        } />
        <Route path="/coding/roadmaps" element={
          <ProtectedRoute>
            <CodingNavbar />
            <CreateRoadmap />
          </ProtectedRoute>
        } />
        <Route path="/coding/leaderboard" element={
          <ProtectedRoute>
            <CodingNavbar />
            <Leaderboard />
          </ProtectedRoute>
        } />
        <Route path="/coding/pricing" element={
          <ProtectedRoute>
            <CodingNavbar />
            <Pricing />
          </ProtectedRoute>
        } />
        
        {/* Legacy Routes for Backward Compatibility */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Navbar />
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/languages" element={
          <ProtectedRoute>
            <Navbar />
            <Languages />
          </ProtectedRoute>
        } />
        <Route path="/create-roadmap" element={
          <ProtectedRoute>
            <Navbar />
            <CreateRoadmap />
          </ProtectedRoute>
        } />
        <Route path="/roadmaps/create" element={
          <ProtectedRoute>
            <Navbar />
            <CreateRoadmap />
          </ProtectedRoute>
        } />
        <Route path="/ide" element={
          <ProtectedRoute>
            <CodeIDE />
          </ProtectedRoute>
        } />
        <Route path="/pricing" element={
          <ProtectedRoute>
            <Navbar />
            <Pricing />
          </ProtectedRoute>
        } />
        <Route path="/leaderboard" element={
          <ProtectedRoute>
            <Navbar />
            <Leaderboard />
          </ProtectedRoute>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="hw-ui-theme">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AppContent />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;