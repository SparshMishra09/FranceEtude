import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { AssignmentAttempt } from './AssignmentAttempt';
import { QuizAttempt } from './QuizAttempt';
import { FileText, ClipboardList, CheckCircle, Clock, BookOpen } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Assignment {
  id: string;
  title: string;
  type: 'assignment' | 'quiz';
  questions: any[];
  createdAt: any;
  semester?: string;
}

interface StudentHomeProps {
  userId: string;
}

export function StudentHome({ userId }: StudentHomeProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [attemptedIds, setAttemptedIds] = useState<string[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [userSemester, setUserSemester] = useState<string>('sem-1');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user's semester
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserSemester(userData.semester || 'sem-1');
        }

        // Fetch all assignments
        const assignmentsSnapshot = await getDocs(collection(db, 'assignments'));
        const assignmentsData = assignmentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Assignment[];

        // Filter assignments by user's semester
        const filteredAssignments = assignmentsData.filter(a =>
          !a.semester || a.semester === userSemester
        );
        setAssignments(filteredAssignments);

        // Fetch student's attempted assignments
        const scoresQuery = query(collection(db, 'scores'), where('studentId', '==', userId));
        const scoresSnapshot = await getDocs(scoresQuery);
        const attemptedAssignmentIds = scoresSnapshot.docs.map(doc => doc.data().assignmentId);
        setAttemptedIds(attemptedAssignmentIds);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const handleAttemptComplete = (assignmentId: string) => {
    setAttemptedIds([...attemptedIds, assignmentId]);
    setSelectedAssignment(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading assignments...</div>
      </div>
    );
  }

  if (selectedAssignment) {
    return (
      <div>
        <button
          onClick={() => setSelectedAssignment(null)}
          className="mb-4 text-[#0055A4] hover:text-[#EF4135] transition-colors"
        >
          ← Back to Dashboard
        </button>
        {selectedAssignment.type === 'assignment' ? (
          <AssignmentAttempt
            assignment={selectedAssignment}
            userId={userId}
            onComplete={() => handleAttemptComplete(selectedAssignment.id)}
          />
        ) : (
          <QuizAttempt
            quiz={selectedAssignment}
            userId={userId}
            onComplete={() => handleAttemptComplete(selectedAssignment.id)}
          />
        )}
      </div>
    );
  }

  const pendingAssignments = assignments.filter(a => !attemptedIds.includes(a.id));
  const completedAssignments = assignments.filter(a => attemptedIds.includes(a.id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#EF4135] to-[#0055A4] rounded-2xl p-8 text-white">
        <div className="relative z-10">
          <motion.h1
            className="text-4xl mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Mon Tableau de Bord
          </motion.h1>
          <div className="flex items-center gap-2">
            <p className="text-red-100">Welcome to Your Dashboard</p>
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
              {userSemester.replace('sem-', 'Semester ')}
            </span>
          </div>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-20">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1514369118554-e20d93546b30?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50JTIwc3R1ZHlpbmd8ZW58MXx8fHwxNzY0MDc4OTgzfDA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Student"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-[#0055A4]" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Available</p>
              <p className="text-2xl text-[#0055A4]">{assignments.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Pending</p>
              <p className="text-2xl text-yellow-600">{pendingAssignments.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Completed</p>
              <p className="text-2xl text-green-600">{completedAssignments.length}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Pending Assignments */}
      {pendingAssignments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl mb-4 text-gray-800">Available Assignments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingAssignments.map((assignment, index) => (
              <motion.div
                key={assignment.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all cursor-pointer group"
                onClick={() => setSelectedAssignment(assignment)}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                  assignment.type === 'assignment' 
                    ? 'bg-blue-100' 
                    : 'bg-red-100'
                }`}>
                  {assignment.type === 'assignment' ? (
                    <FileText className="w-6 h-6 text-[#0055A4]" />
                  ) : (
                    <ClipboardList className="w-6 h-6 text-[#EF4135]" />
                  )}
                </div>
                <h3 className="text-lg mb-2 text-gray-800 group-hover:text-[#0055A4] transition-colors">
                  {assignment.title}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {assignment.questions.length} questions
                </p>
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-xs ${
                    assignment.type === 'assignment'
                      ? 'bg-blue-100 text-[#0055A4]'
                      : 'bg-red-100 text-[#EF4135]'
                  }`}>
                    {assignment.type === 'assignment' ? 'Assignment' : 'Quiz'}
                  </span>
                  <motion.button
                    className="text-[#0055A4] group-hover:text-[#EF4135] transition-colors"
                    whileHover={{ x: 5 }}
                  >
                    Start →
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Completed Assignments */}
      {completedAssignments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-2xl mb-4 text-gray-800">Completed</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedAssignments.map((assignment, index) => (
              <motion.div
                key={assignment.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 opacity-75"
              >
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg mb-2 text-gray-800">
                  {assignment.title}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {assignment.questions.length} questions
                </p>
                <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-700">
                  Completed ✓
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {assignments.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-12 text-center shadow-lg border border-gray-100"
        >
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl mb-2 text-gray-800">No Assignments for Your Semester</h3>
          <p className="text-gray-500">
            Your teacher hasn't created any assignments or quizzes for {userSemester.replace('sem-', 'Semester ')} yet. Check back later!
          </p>
        </motion.div>
      )}
    </div>
  );
}
