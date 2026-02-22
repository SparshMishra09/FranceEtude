import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Users, Trash2, Search, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface Student {
  id: string;
  name: string;
  email: string;
  semester?: string;
  createdAt?: any;
}

interface Score {
  id: string;
  studentId: string;
  studentName: string;
  assignmentTitle: string;
  score: number;
  totalQuestions: number;
  timestamp: any;
}

export function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all students
      const studentsSnapshot = await getDocs(collection(db, 'users'));
      const studentsData = studentsSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Student))
        .filter(user => user.role === 'student');
      setStudents(studentsData);

      // Fetch all scores
      const scoresSnapshot = await getDocs(collection(db, 'scores'));
      const scoresData = scoresSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Score));
      setScores(scoresData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (student: Student) => {
    const confirmDelete = window.confirm(
      `⚠️ WARNING: This action cannot be undone!\n\n` +
      `Are you sure you want to remove "${student.name}"?\n\n` +
      `This will permanently delete:\n` +
      `• The student account\n` +
      `• All submissions and scores\n` +
      `• All progress data`
    );

    if (!confirmDelete) return;

    setDeletingId(student.id);

    try {
      // Step 1: Get all scores for this student
      const studentScores = scores.filter(s => s.studentId === student.id);
      
      // Step 2: Delete all scores sequentially
      for (const score of studentScores) {
        await deleteDoc(doc(db, 'scores', score.id));
      }

      // Step 3: Delete the student document
      await deleteDoc(doc(db, 'users', student.id));

      // Step 4: Update local state
      setStudents(prev => prev.filter(s => s.id !== student.id));
      setScores(prev => prev.filter(s => s.studentId !== student.id));

      toast.success(`Student "${student.name}" removed successfully`);
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(`Failed to delete: ${error.message || 'Unknown error'}`);
    } finally {
      setDeletingId(null);
    }
  };

  const getStudentScoreCount = (studentId: string) => {
    return scores.filter(s => s.studentId === studentId).length;
  };

  const getStudentAverageScore = (studentId: string) => {
    const studentScores = scores.filter(s => s.studentId === studentId);
    if (studentScores.length === 0) return '0';
    
    const avg = studentScores.reduce((acc, s) => acc + (s.score / s.totalQuestions) * 100, 0) / studentScores.length;
    return avg.toFixed(1);
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading students...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0055A4] to-[#EF4135] rounded-2xl p-8 text-white">
        <div className="relative z-10">
          <motion.h1
            className="text-4xl mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Manage Students
          </motion.h1>
          <p className="text-blue-100">Gérer les Étudiants - {students.length} total students</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Students Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 text-gray-600 font-medium">Student</th>
                <th className="text-left py-4 px-6 text-gray-600 font-medium">Email</th>
                <th className="text-left py-4 px-6 text-gray-600 font-medium">Semester</th>
                <th className="text-left py-4 px-6 text-gray-600 font-medium">Submissions</th>
                <th className="text-left py-4 px-6 text-gray-600 font-medium">Avg Score</th>
                <th className="text-left py-4 px-6 text-gray-600 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => {
                  const scoreCount = getStudentScoreCount(student.id);
                  const avgScore = getStudentAverageScore(student.id);
                  const isDeleting = deletingId === student.id;
                  
                  return (
                    <tr
                      key={student.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#0055A4] to-[#EF4135] rounded-full flex items-center justify-center text-white font-medium">
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-800">{student.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-600">{student.email}</td>
                      <td className="py-4 px-6">
                        <span className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                          {student.semester?.replace('sem-', 'Semester ') || 'N/A'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{scoreCount}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {scoreCount > 0 ? (
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            parseFloat(avgScore) >= 80 ? 'bg-green-100 text-green-700' :
                            parseFloat(avgScore) >= 60 ? 'bg-blue-100 text-blue-700' :
                            parseFloat(avgScore) >= 40 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {avgScore}%
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">No submissions</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteStudent(student)}
                          disabled={isDeleting}
                          className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          {isDeleting ? 'Removing...' : 'Remove'}
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    {searchTerm ? 'No students found matching your search' : 'No students yet'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
