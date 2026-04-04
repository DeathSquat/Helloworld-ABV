import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { doc, getDoc, collection, query, where, getDocs, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, TrendingUp, Award, BookOpen, UserPlus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import TeacherNavbar from '@/components/TeacherNavbar';

interface StudentProgress {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  experience_points: number;
  learning_streak: number;
  total_study_hours: number;
  problems_solved: number;
  current_level: string;
  last_activity_at: string;
}

const TeacherDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [allStudents, setAllStudents] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTeacher, setIsTeacher] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const fetchStudents = useCallback(async () => {
    try {
      // Fetch students assigned to this teacher
      const teacherStudentsQuery = query(
        collection(db, 'teacher_students'),
        where('teacher_id', '==', user?.uid)
      );
      const assignedStudentDocs = await getDocs(teacherStudentsQuery);
      const assignedStudentIds = assignedStudentDocs.docs.map(doc => doc.data().student_id);

      const studentIds = assignedStudentIds || [];

      if (studentIds.length > 0) {
        const studentProfilesQuery = query(
          collection(db, 'user_profiles'),
          where('user_id', 'in', studentIds)
        );
        const studentDocs = await getDocs(studentProfilesQuery);
        const studentsData: StudentProgress[] = studentDocs.docs.map(doc => ({ 
          id: doc.id,
          user_id: doc.data().user_id || '',
          full_name: doc.data().full_name || '',
          email: doc.data().email || '',
          experience_points: doc.data().experience_points || 0,
          learning_streak: doc.data().learning_streak || 0,
          total_study_hours: doc.data().total_study_hours || 0,
          problems_solved: doc.data().problems_solved || 0,
          current_level: doc.data().current_level || '',
          last_activity_at: doc.data().last_activity_at || ''
        }));
        setStudents(studentsData);
      }

      // Fetch all learners for assignment dialog
      const learnersQuery = query(
        collection(db, 'user_profiles'),
        where('role', '==', 'learner')
      );
      const learnerDocs = await getDocs(learnersQuery);
      const allLearners: StudentProgress[] = learnerDocs.docs.map(doc => ({ 
        id: doc.id,
        user_id: doc.data().user_id || '',
        full_name: doc.data().full_name || '',
        email: doc.data().email || '',
        experience_points: doc.data().experience_points || 0,
        learning_streak: doc.data().learning_streak || 0,
        total_study_hours: doc.data().total_study_hours || 0,
        problems_solved: doc.data().problems_solved || 0,
        current_level: doc.data().current_level || '',
        last_activity_at: doc.data().last_activity_at || ''
      }));
      setAllStudents(allLearners);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: "Error",
        description: "Failed to load student data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    const checkTeacherStatus = async () => {
      if (!user) {
        navigate('/auth');
        return;
      }

      // Check if user is a teacher
      const userRoleDoc = await getDoc(doc(db, 'user_roles', user.uid));
      const userRole = userRoleDoc.exists() ? userRoleDoc.data() : null;

      if (userRole?.role !== 'teacher') {
        navigate('/division-selection');
        return;
      }

      setIsTeacher(true);
      fetchStudents();
    };

    checkTeacherStatus();
  }, [user, navigate, fetchStudents]);

  const assignStudent = async (studentId: string) => {
    try {
      await addDoc(collection(db, 'teacher_students'), {
        teacher_id: user?.uid,
        student_id: studentId,
      });

      toast({
        title: "Success",
        description: "Student assigned successfully",
      });
      
      fetchStudents();
      setShowAddDialog(false);
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to assign student",
        variant: "destructive",
      });
    }
  };

  const removeStudent = async (studentId: string) => {
    try {
      const teacherStudentsQuery = query(
        collection(db, 'teacher_students'),
        where('teacher_id', '==', user?.uid),
        where('student_id', '==', studentId)
      );
      const querySnapshot = await getDocs(teacherStudentsQuery);
      
      querySnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });

      toast({
        title: "Success",
        description: "Student removed from your class",
      });
      
      fetchStudents();
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove student",
        variant: "destructive",
      });
    }
  };

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      beginner: 'bg-blue-500/20 text-blue-400',
      intermediate: 'bg-green-500/20 text-green-400',
      advanced: 'bg-purple-500/20 text-purple-400',
    };
    return colors[level] || 'bg-gray-500/20 text-gray-400';
  };

  if (!isTeacher) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <TeacherNavbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Teacher Dashboard</h1>
          <p className="text-gray-300">Manage your students and track their progress</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Students</CardTitle>
              <Users className="h-4 w-4 text-golden" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{students.length}</div>
              <p className="text-xs text-gray-400">Active learners</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Avg. Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-golden" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {students.length > 0 
                  ? Math.round(students.reduce((acc, s) => acc + s.experience_points, 0) / students.length)
                  : 0}
              </div>
              <p className="text-xs text-gray-400">Experience points</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Completion Rate</CardTitle>
              <Award className="h-4 w-4 text-golden" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {students.length > 0 
                  ? Math.round((students.filter(s => s.problems_solved > 10).length / students.length) * 100)
                  : 0}%
              </div>
              <p className="text-xs text-gray-400">Students with 10+ problems solved</p>
            </CardContent>
          </Card>
        </div>

        {/* Students Table */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">Your Students</CardTitle>
                <CardDescription className="text-gray-400">
                  View and manage your assigned students
                </CardDescription>
              </div>
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-golden hover:bg-golden/90 text-gray-900">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Student
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-800 border-gray-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">Assign New Student</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Select a student to add to your class
                    </DialogDescription>
                  </DialogHeader>
                  <div className="max-h-96 overflow-y-auto">
                    {allStudents
                      .filter(student => !students.some(s => s.user_id === student.user_id))
                      .map((student) => (
                        <div
                          key={student.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-gray-700/50 mb-2"
                        >
                          <div>
                            <p className="text-white font-medium">{student.full_name}</p>
                            <p className="text-gray-400 text-sm">{student.email}</p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => assignStudent(student.user_id)}
                            className="bg-golden hover:bg-golden/90 text-gray-900"
                          >
                            Assign
                          </Button>
                        </div>
                      ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-400">Loading students...</div>
            ) : students.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <BookOpen className="mx-auto h-12 w-12 text-gray-600 mb-4" />
                <p className="text-lg font-medium mb-2">No students assigned yet</p>
                <p className="text-sm mb-4">Start by adding students to your class</p>
                <Button
                  onClick={() => setShowAddDialog(true)}
                  className="bg-golden hover:bg-golden/90 text-gray-900"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Your First Student
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">Student</TableHead>
                    <TableHead className="text-gray-300">Level</TableHead>
                    <TableHead className="text-gray-300">Experience</TableHead>
                    <TableHead className="text-gray-300">Problems Solved</TableHead>
                    <TableHead className="text-gray-300">Learning Streak</TableHead>
                    <TableHead className="text-gray-300">Last Activity</TableHead>
                    <TableHead className="text-gray-300 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id} className="border-gray-700">
                      <TableCell>
                        <div>
                          <p className="text-white font-medium">{student.full_name}</p>
                          <p className="text-gray-400 text-sm">{student.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getLevelColor(student.current_level)}>
                          {student.current_level}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white">{student.experience_points}</TableCell>
                      <TableCell className="text-white">{student.problems_solved}</TableCell>
                      <TableCell className="text-white">{student.learning_streak} days</TableCell>
                      <TableCell className="text-gray-400">
                        {student.last_activity_at 
                          ? new Date(student.last_activity_at).toLocaleDateString()
                          : 'Never'
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeStudent(student.user_id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeacherDashboard;
