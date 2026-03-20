import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Trophy, Users, BookOpen, CheckCircle, Clock, Star, TrendingUp, Search } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';

interface CourseProgress {
  id: string;
  userId: string;
  completedTopics: string[];
  currentTopicId: string | null;
  visitedTopics: string[];
  startedAt: any;
  completedAt: any;
}

interface Student {
  id: string;
  name: string;
  email: string;
  semester?: string;
}

interface CourseTopic {
  id: string;
  title: string;
}

export function AdminCourseProgress() {
  const [progressData, setProgressData] = useState<CourseProgress[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [topics, setTopics] = useState<CourseTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSemester, setSelectedSemester] = useState<string>('all');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showStudentDetail, setShowStudentDetail] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch all students
      const studentsSnapshot = await getDocs(collection(db, 'users'));
      const studentsData = studentsSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Student))
        .filter(user => user.role === 'student');
      setStudents(studentsData);

      // Fetch all course progress
      const progressSnapshot = await getDocs(collection(db, 'courseProgress'));
      const progressData = progressSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CourseProgress[];
      setProgressData(progressData);

      // Fetch all topics
      const topicsSnapshot = await getDocs(collection(db, 'courseTopics'));
      const topicsData = topicsSnapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title
      })) as CourseTopic[];
      setTopics(topicsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter students by search and semester
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSemester = selectedSemester === 'all' || student.semester === selectedSemester;
    return matchesSearch && matchesSemester;
  });

  // Get progress for a specific student
  const getStudentProgress = (studentId: string) => {
    return progressData.find(p => p.userId === studentId);
  };

  // Calculate progress percentage
  const getProgressPercentage = (progress: CourseProgress) => {
    if (topics.length === 0) return 0;
    return ((progress.completedTopics?.length || 0) / topics.length) * 100;
  };

  // Calculate statistics
  const totalStudents = filteredStudents.length;
  const studentsStarted = progressData.filter(p => p.startedAt).length;
  const studentsCompleted = progressData.filter(p => p.completedAt).length;
  const averageProgress = studentsStarted > 0
    ? (progressData.reduce((acc, p) => acc + getProgressPercentage(p), 0) / studentsStarted)
    : 0;

  const getTopicTitle = (topicId: string) => {
    return topics.find(t => t.id === topicId)?.title || 'Unknown Topic';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading course progress...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0055A4] to-purple-600 rounded-2xl p-8 text-white">
        <div className="relative z-10">
          <motion.h1
            className="text-4xl mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            French Course Progress
          </motion.h1>
          <p className="text-blue-100">Suivi du Cours de Français - Monitor student progress</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
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
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-gray-500 text-sm">Started Course</p>
          <p className="text-3xl mt-1 text-purple-600">{studentsStarted}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <p className="text-gray-500 text-sm">Completed Course</p>
          <p className="text-3xl mt-1 text-yellow-600">{studentsCompleted}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-gray-500 text-sm">Average Progress</p>
          <p className="text-3xl mt-1 text-green-600">{averageProgress.toFixed(1)}%</p>
        </motion.div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search students by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <BookOpen className="w-5 h-5 text-[#0055A4] hidden sm:block" />
              <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by semester" />
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student Progress List */}
      <Card>
        <CardContent className="p-0">
          {filteredStudents.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No students found
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredStudents.map((student) => {
                const progress = getStudentProgress(student.id);
                const progressPercentage = progress ? getProgressPercentage(progress) : 0;
                const isCompleted = progress?.completedAt;

                return (
                  <motion.div
                    key={student.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedStudent(student);
                      setShowStudentDetail(true);
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#0055A4] to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-800">{student.name}</h3>
                            <p className="text-sm text-gray-500">{student.email}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                              {student.semester?.replace('sem-', 'Semester ') || 'N/A'}
                            </span>
                            {isCompleted ? (
                              <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                                <CheckCircle className="w-4 h-4" />
                                Completed
                              </span>
                            ) : progress ? (
                              <span className="text-sm text-gray-600">
                                {progress.completedTopics?.length || 0}/{topics.length} topics
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400">Not started</span>
                            )}
                          </div>
                        </div>
                        {progress && (
                          <div className="mt-2">
                            <Progress value={progressPercentage} className="h-2" />
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student Detail Dialog */}
      <Dialog open={showStudentDetail} onOpenChange={setShowStudentDetail}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Student Progress Details</DialogTitle>
            <DialogDescription>
              {selectedStudent?.name}'s French course progress
            </DialogDescription>
          </DialogHeader>

          {selectedStudent && (
            <div className="space-y-6">
              {/* Student Info */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 bg-gradient-to-br from-[#0055A4] to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {selectedStudent.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{selectedStudent.name}</h3>
                  <p className="text-sm text-gray-500">{selectedStudent.email}</p>
                  <p className="text-sm text-gray-500">
                    Semester: {selectedStudent.semester?.replace('sem-', 'Semester ') || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Progress Overview */}
              {(() => {
                const progress = getStudentProgress(selectedStudent.id);
                if (!progress) {
                  return (
                    <div className="text-center py-8 text-gray-500">
                      This student hasn't started the course yet.
                    </div>
                  );
                }

                const progressPercentage = getProgressPercentage(progress);
                const isCompleted = !!progress.completedAt;

                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 font-medium">Overall Progress</span>
                      <span className="text-[#0055A4] font-bold">{progressPercentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={progressPercentage} className="h-3" />

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-600">Topics Completed</p>
                        <p className="text-2xl font-bold text-[#0055A4]">
                          {progress.completedTopics?.length || 0} / {topics.length}
                        </p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-gray-600">Status</p>
                        <p className={`text-lg font-bold ${isCompleted ? 'text-green-600' : 'text-yellow-600'}`}>
                          {isCompleted ? 'Completed ✓' : 'In Progress'}
                        </p>
                      </div>
                    </div>

                    {progress.startedAt && (
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Started
                        </p>
                        <p className="text-gray-800 font-medium">
                          {progress.startedAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
                        </p>
                      </div>
                    )}

                    {isCompleted && progress.completedAt && (
                      <div className="p-4 bg-yellow-50 rounded-lg">
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <Trophy className="w-4 h-4" />
                          Completed
                        </p>
                        <p className="text-gray-800 font-medium">
                          {progress.completedAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
                        </p>
                      </div>
                    )}

                    {/* Topic-by-Topic Progress */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Topic Progress</h4>
                      <div className="space-y-2">
                        {topics.map((topic, index) => {
                          const isCompleted = progress.completedTopics?.includes(topic.id);
                          const isCurrent = progress.currentTopicId === topic.id;

                          return (
                            <div
                              key={topic.id}
                              className={`p-3 rounded-lg border-2 ${
                                isCompleted
                                  ? 'border-green-300 bg-green-50'
                                  : isCurrent
                                  ? 'border-[#0055A4] bg-blue-50'
                                  : 'border-gray-200 bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    isCompleted
                                      ? 'bg-green-500 text-white'
                                      : isCurrent
                                      ? 'bg-[#0055A4] text-white'
                                      : 'bg-gray-300 text-gray-500'
                                  }`}>
                                    {isCompleted ? (
                                      <CheckCircle className="w-4 h-4" />
                                    ) : isCurrent ? (
                                      <Clock className="w-4 h-4" />
                                    ) : (
                                      <span className="text-sm font-bold">{index + 1}</span>
                                    )}
                                  </div>
                                  <span className={`font-medium ${
                                    isCompleted ? 'text-green-800' : 'text-gray-800'
                                  }`}>
                                    {topic.title}
                                  </span>
                                </div>
                                <div>
                                  {isCompleted ? (
                                    <span className="text-green-600 text-sm font-medium">Completed</span>
                                  ) : isCurrent ? (
                                    <span className="text-[#0055A4] text-sm font-medium">In Progress</span>
                                  ) : (
                                    <span className="text-gray-400 text-sm">Locked</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
