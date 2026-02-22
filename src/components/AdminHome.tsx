import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Users, FileText, ClipboardCheck, TrendingUp, Award, Eye, BookOpen } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface Score {
  studentId: string;
  studentName: string;
  assignmentTitle: string;
  score: number;
  totalQuestions: number;
  timestamp: any;
  semester?: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
  role: string;
  semester?: string;
}

export function AdminHome() {
  const [scores, setScores] = useState<Score[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState<string>('all');

  // Modal states for "View More" feature
  const [showStudentPerformanceModal, setShowStudentPerformanceModal] = useState(false);
  const [showScoreDistributionModal, setShowScoreDistributionModal] = useState(false);
  const [showRecentSubmissionsModal, setShowRecentSubmissionsModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch scores
        const scoresQuery = query(collection(db, 'scores'), orderBy('timestamp', 'desc'));
        const scoresSnapshot = await getDocs(scoresQuery);
        const scoresData = scoresSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Score[];
        setScores(scoresData);

        // Fetch students
        const studentsSnapshot = await getDocs(collection(db, 'users'));
        const studentsData = studentsSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Student))
          .filter(user => user.role === 'student');
        setStudents(studentsData);

        // Fetch assignments
        const assignmentsSnapshot = await getDocs(collection(db, 'assignments'));
        const assignmentsData = assignmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAssignments(assignmentsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter students and scores by selected semester
  const filteredStudents = selectedSemester === 'all'
    ? students
    : students.filter(s => s.semester === selectedSemester);

  const filteredScores = selectedSemester === 'all'
    ? scores
    : scores.filter(s => {
        const student = students.find(st => st.name === s.studentName);
        return student?.semester === selectedSemester;
      });

  // Calculate statistics
  const totalStudents = filteredStudents.length;
  const totalAssignments = assignments.filter(a => a.type === 'assignment' && (selectedSemester === 'all' || a.semester === selectedSemester)).length;
  const totalQuizzes = assignments.filter(a => a.type === 'quiz' && (selectedSemester === 'all' || a.semester === selectedSemester)).length;
  const averageScore = filteredScores.length > 0
    ? (filteredScores.reduce((acc, score) => acc + (score.score / score.totalQuestions) * 100, 0) / filteredScores.length).toFixed(1)
    : 0;

  // Prepare chart data - Student Performance
  const studentPerformance = filteredStudents.map(student => {
    const studentScores = filteredScores.filter(s => s.studentName === student.name);
    const avgScore = studentScores.length > 0
      ? (studentScores.reduce((acc, s) => acc + (s.score / s.totalQuestions) * 100, 0) / studentScores.length)
      : 0;

    return {
      name: student.name.split(' ')[0], // First name only
      score: Math.round(avgScore),
      attempts: studentScores.length,
      semester: student.semester
    };
  });

  // Prepare chart data - Student Performance (Top 10 for dashboard)
  const studentPerformanceLimited = studentPerformance.slice(0, 10);

  // Prepare assignment completion data
  const assignmentCompletion = assignments.slice(0, 5).map(assignment => {
    const completionCount = scores.filter(s => s.assignmentTitle === assignment.title).length;
    return {
      name: assignment.title.length > 15 ? assignment.title.substring(0, 15) + '...' : assignment.title,
      completed: completionCount,
      total: totalStudents
    };
  });

  // Score distribution
  const scoreDistribution = [
    { range: '0-20%', count: filteredScores.filter(s => (s.score / s.totalQuestions) * 100 <= 20).length },
    { range: '21-40%', count: filteredScores.filter(s => (s.score / s.totalQuestions) * 100 > 20 && (s.score / s.totalQuestions) * 100 <= 40).length },
    { range: '41-60%', count: filteredScores.filter(s => (s.score / s.totalQuestions) * 100 > 40 && (s.score / s.totalQuestions) * 100 <= 60).length },
    { range: '61-80%', count: filteredScores.filter(s => (s.score / s.totalQuestions) * 100 > 60 && (s.score / s.totalQuestions) * 100 <= 80).length },
    { range: '81-100%', count: filteredScores.filter(s => (s.score / s.totalQuestions) * 100 > 80).length },
  ];

  const COLORS = ['#EF4135', '#FF6B6B', '#4ECDC4', '#45B7D1', '#0055A4'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
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
            Tableau de Bord
          </motion.h1>
          <p className="text-blue-100">Welcome back, Administrator</p>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-20">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1570097703229-b195d6dd291f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlaWZmZWwlMjB0b3dlciUyMHBhcmlzfGVufDF8fHx8MTc2NDA2MjI1Nnww&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Paris"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Semester Filter */}
      <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#0055A4]" />
            <span className="text-gray-700 font-medium">Filter by Semester:</span>
          </div>
          <Select value={selectedSemester} onValueChange={setSelectedSemester}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select semester" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Semesters</SelectItem>
              <SelectItem value="sem-1">Semester 1</SelectItem>
              <SelectItem value="sem-2">Semester 2</SelectItem>
              <SelectItem value="sem-3">Semester 3</SelectItem>
              <SelectItem value="sem-4">Semester 4</SelectItem>
              <SelectItem value="sem-5">Semester 5</SelectItem>
              <SelectItem value="sem-6">Semester 6</SelectItem>
              <SelectItem value="sem-7">Semester 7</SelectItem>
              <SelectItem value="sem-8">Semester 8</SelectItem>
            </SelectContent>
          </Select>
          {selectedSemester !== 'all' && (
            <span className="text-sm text-gray-500">
              Showing data for {selectedSemester.replace('sem-', 'Semester ')}
            </span>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-[#0055A4]" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-gray-500 text-sm">Total Students</p>
          <p className="text-3xl mt-1 text-[#0055A4]">{totalStudents}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-gray-500 text-sm">Assignments</p>
          <p className="text-3xl mt-1 text-purple-600">{totalAssignments}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <ClipboardCheck className="w-6 h-6 text-[#EF4135]" />
            </div>
          </div>
          <p className="text-gray-500 text-sm">Quizzes</p>
          <p className="text-3xl mt-1 text-[#EF4135]">{totalQuizzes}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-gray-500 text-sm">Average Score</p>
          <p className="text-3xl mt-1 text-green-600">{averageScore}%</p>
        </motion.div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Performance Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl text-gray-800">Student Performance</h3>
            {studentPerformance.length > 10 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowStudentPerformanceModal(true)}
                className="flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                View More
              </Button>
            )}
          </div>
          {studentPerformanceLimited.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={studentPerformanceLimited}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="score" fill="#0055A4" name="Average Score %" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              No student data available
            </div>
          )}
        </motion.div>

        {/* Score Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl text-gray-800">Score Distribution</h3>
            {scores.length > 20 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowScoreDistributionModal(true)}
                className="flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                View More
              </Button>
            )}
          </div>
          {scores.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={scoreDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ range, count }) => `${range}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {scoreDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              No score data available
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Submissions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl text-gray-800">Recent Submissions</h3>
          {filteredScores.length > 10 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRecentSubmissionsModal(true)}
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              View More
            </Button>
          )}
        </div>
        <div className="overflow-x-auto">
          {filteredScores.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-gray-600">Student</th>
                  <th className="text-left py-3 px-4 text-gray-600">Assignment</th>
                  <th className="text-left py-3 px-4 text-gray-600">Score</th>
                  <th className="text-left py-3 px-4 text-gray-600">Percentage</th>
                  <th className="text-left py-3 px-4 text-gray-600">Semester</th>
                  <th className="text-left py-3 px-4 text-gray-600">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredScores.slice(0, 10).map((score, index) => {
                  const percentage = ((score.score / score.totalQuestions) * 100).toFixed(1);
                  const student = students.find(s => s.name === score.studentName);
                  return (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">{score.studentName}</td>
                      <td className="py-3 px-4">{score.assignmentTitle}</td>
                      <td className="py-3 px-4">{score.score}/{score.totalQuestions}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          parseFloat(percentage) >= 80 ? 'bg-green-100 text-green-700' :
                          parseFloat(percentage) >= 60 ? 'bg-blue-100 text-blue-700' :
                          parseFloat(percentage) >= 40 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {percentage}%
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                          {student?.semester?.replace('sem-', 'Sem ') || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-sm">
                        {score.timestamp?.toDate?.()?.toLocaleDateString() || 'N/A'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8 text-gray-400">
              No submissions yet
            </div>
          )}
        </div>
      </motion.div>

      {/* Student Performance Modal */}
      <Dialog open={showStudentPerformanceModal} onOpenChange={setShowStudentPerformanceModal}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>All Students Performance</DialogTitle>
            <DialogDescription>
              Viewing performance data for all {studentPerformance.length} students
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            {studentPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height={500}>
                <BarChart data={studentPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="score" fill="#0055A4" name="Average Score %" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400">
                No student data available
              </div>
            )}
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Detailed Student Data</h4>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 text-gray-600 text-sm">Student Name</th>
                    <th className="text-left py-2 px-3 text-gray-600 text-sm">Average Score</th>
                    <th className="text-left py-2 px-3 text-gray-600 text-sm">Attempts</th>
                  </tr>
                </thead>
                <tbody>
                  {studentPerformance.map((student, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-3">{student.name}</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-1 rounded text-sm ${
                          student.score >= 80 ? 'bg-green-100 text-green-700' :
                          student.score >= 60 ? 'bg-blue-100 text-blue-700' :
                          student.score >= 40 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {student.score}%
                        </span>
                      </td>
                      <td className="py-2 px-3 text-gray-500">{student.attempts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Score Distribution Modal */}
      <Dialog open={showScoreDistributionModal} onOpenChange={setShowScoreDistributionModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Score Distribution Details</DialogTitle>
            <DialogDescription>
              Distribution of {filteredScores.length} total submissions{selectedSemester !== 'all' ? ` for ${selectedSemester.replace('sem-', 'Semester ')}` : ''} by score range
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={scoreDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ range, count }) => `${range}: ${count} submissions`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {scoreDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-6 grid grid-cols-5 gap-2">
              {scoreDistribution.map((item, index) => (
                <div key={index} className="text-center p-3 rounded-lg bg-gray-50">
                  <div className="text-xs text-gray-500">{item.range}</div>
                  <div className="text-xl font-bold" style={{ color: COLORS[index] }}>{item.count}</div>
                  <div className="text-xs text-gray-400">submissions</div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Recent Submissions Modal */}
      <Dialog open={showRecentSubmissionsModal} onOpenChange={setShowRecentSubmissionsModal}>
        <DialogContent className="max-w-5xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>All Submissions</DialogTitle>
            <DialogDescription>
              Viewing all {filteredScores.length} submissions{selectedSemester !== 'all' ? ` for ${selectedSemester.replace('sem-', 'Semester ')}` : ''}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            <table className="w-full">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-gray-600">Student</th>
                  <th className="text-left py-3 px-4 text-gray-600">Assignment</th>
                  <th className="text-left py-3 px-4 text-gray-600">Score</th>
                  <th className="text-left py-3 px-4 text-gray-600">Percentage</th>
                  <th className="text-left py-3 px-4 text-gray-600">Semester</th>
                  <th className="text-left py-3 px-4 text-gray-600">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredScores.map((score, index) => {
                  const percentage = ((score.score / score.totalQuestions) * 100).toFixed(1);
                  const student = students.find(s => s.name === score.studentName);
                  return (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">{score.studentName}</td>
                      <td className="py-3 px-4">{score.assignmentTitle}</td>
                      <td className="py-3 px-4">{score.score}/{score.totalQuestions}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          parseFloat(percentage) >= 80 ? 'bg-green-100 text-green-700' :
                          parseFloat(percentage) >= 60 ? 'bg-blue-100 text-blue-700' :
                          parseFloat(percentage) >= 40 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {percentage}%
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                          {student?.semester?.replace('sem-', 'Sem ') || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-sm">
                        {score.timestamp?.toDate?.()?.toLocaleDateString() || 'N/A'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
