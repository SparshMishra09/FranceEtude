import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, getDocs, query, orderBy, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { BookOpen, Lock, CheckCircle, Play, Trophy, Star, ArrowRight, Clock } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { CourseTopicLearning } from './CourseTopicLearning';

interface CourseTopic {
  id: string;
  title: string;
  topicInfo: string;
  topicExamples: string;
  youtubeLink: string;
  pdfLink: string;
  assignmentType: 'assignment' | 'quiz';
  assignmentQuestions: any[];
  order: number;
  createdAt: any;
}

interface CourseProgress {
  userId: string;
  completedTopics: string[];
  currentTopicId: string | null;
  visitedTopics: string[];
  startedAt: any;
  completedAt: any;
}

interface StudentCourseViewProps {
  userId: string;
}

export function StudentCourseView({ userId }: StudentCourseViewProps) {
  const [topics, setTopics] = useState<CourseTopic[]>([]);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<CourseTopic | null>(null);
  const [courseCompleted, setCourseCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCourseData();
  }, [userId]);

  const fetchCourseData = async () => {
    try {
      setError(null);
      console.log('Fetching course topics...');
      
      const topicsQuery = query(collection(db, 'courseTopics'), orderBy('order', 'asc'));
      const topicsSnapshot = await getDocs(topicsQuery);
      console.log('Topics fetched:', topicsSnapshot.size);
      
      const topicsData = topicsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CourseTopic[];
      console.log('Topics data:', topicsData);
      setTopics(topicsData);

      console.log('Fetching progress for user:', userId);
      const progressDoc = await getDoc(doc(db, 'courseProgress', userId));
      console.log('Progress doc exists:', progressDoc.exists());
      
      if (progressDoc.exists()) {
        const progressData = progressDoc.data() as CourseProgress;
        setProgress(progressData);
        if (progressData.completedAt) {
          setCourseCompleted(true);
        }
        if (progressData.currentTopicId) {
          const currentTopic = topicsData.find(t => t.id === progressData.currentTopicId);
          if (currentTopic) {
            setSelectedTopic(currentTopic);
          }
        }
      } else {
        if (topicsData.length > 0) {
          const firstTopic = topicsData[0];
          const newProgress = {
            userId,
            completedTopics: [],
            currentTopicId: firstTopic.id,
            visitedTopics: [],
            startedAt: new Date()
          };
          console.log('Creating new progress doc');
          await setDoc(doc(db, 'courseProgress', userId), newProgress);
          setProgress(newProgress);
          setSelectedTopic(firstTopic);
        }
      }
    } catch (error) {
      console.error('Error fetching course data:', error);
      setError(`Failed to load course: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTopicComplete = () => {
    fetchCourseData();
    setSelectedTopic(null);
  };

  const handleStartTopic = (topic: CourseTopic) => {
    setSelectedTopic(topic);
  };

  const handleBackToOverview = () => {
    setSelectedTopic(null);
  };

  const progressPercentage = topics.length > 0
    ? ((progress?.completedTopics?.length || 0) / topics.length) * 100
    : 0;

  const isTopicUnlocked = (topic: CourseTopic, index: number) => {
    if (!progress) return index === 0;
    const completedTopics = progress.completedTopics || [];
    if (index === 0) return true;
    for (let i = 0; i < index; i++) {
      if (!completedTopics.includes(topics[i].id)) {
        return false;
      }
    }
    return true;
  };

  const isTopicCompleted = (topicId: string) => {
    return progress?.completedTopics?.includes(topicId) || false;
  };

  const getNextIncompleteTopic = () => {
    if (!progress) return topics[0];
    const completedTopics = progress.completedTopics || [];
    return topics.find(t => !completedTopics.includes(t.id)) || null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-[#0055A4] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Loading course...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Course</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => fetchCourseData()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (selectedTopic) {
    return (
      <CourseTopicLearning
        topic={selectedTopic}
        userId={userId}
        onComplete={handleTopicComplete}
        onBack={handleBackToOverview}
        allTopics={topics}
      />
    );
  }

  const nextTopic = getNextIncompleteTopic();

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
            French Language Course
          </motion.h1>
          <p className="text-blue-100">Cours de Français - Master French step by step</p>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-10">
          <div className="w-full h-full bg-gradient-to-l from-white to-transparent" />
        </div>
      </div>

      {topics.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl mb-2 text-gray-800">No Course Topics Yet</h3>
            <p className="text-gray-500 mb-4">Your teacher hasn't added any course topics yet.</p>
            <p className="text-sm text-gray-400">Check back later or contact your teacher.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Progress Overview */}
          <Card className="border-2 border-[#0055A4]/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#0055A4] to-purple-600 rounded-xl flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">Your Progress</h2>
                    <p className="text-sm text-gray-500">
                      {progress?.completedTopics?.length || 0} of {topics.length} topics completed
                    </p>
                  </div>
                </div>
                {courseCompleted && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full">
                    <Star className="w-4 h-4" />
                    <span className="font-medium">Course Completed!</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Overall Progress</span>
                  <span className="font-medium text-[#0055A4]">{progressPercentage.toFixed(0)}%</span>
                </div>
                <Progress value={progressPercentage} className="h-3" />
              </div>
              {!courseCompleted && nextTopic && (
                <Button
                  onClick={() => handleStartTopic(nextTopic)}
                  className="mt-4 bg-gradient-to-r from-[#0055A4] to-purple-600 text-white"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Continue Learning
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Course Topics Queue */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-[#0055A4]" />
              Course Topics
            </h2>
            <div className="space-y-3">
              {topics.map((topic, index) => {
                const unlocked = isTopicUnlocked(topic, index);
                const completed = isTopicCompleted(topic.id);
                const isNext = !completed && unlocked && index > 0 ? !isTopicCompleted(topics[index - 1].id) : index === 0 && !completed;

                return (
                  <motion.div
                    key={topic.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      className={`transition-all hover:shadow-lg ${
                        completed
                          ? 'border-green-300 bg-green-50'
                          : unlocked
                          ? 'border-[#0055A4]/30 hover:border-[#0055A4]/60 cursor-pointer'
                          : 'border-gray-200 bg-gray-50 opacity-75'
                      }`}
                      onClick={() => unlocked && !completed && handleStartTopic(topic)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                              completed
                                ? 'bg-green-500 text-white'
                                : unlocked
                                ? 'bg-gradient-to-br from-[#0055A4] to-purple-600 text-white'
                                : 'bg-gray-300 text-gray-500'
                            }`}
                          >
                            {completed ? (
                              <CheckCircle className="w-6 h-6" />
                            ) : unlocked ? (
                              <Play className="w-5 h-5" />
                            ) : (
                              <Lock className="w-5 h-5" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className={`text-lg font-semibold ${
                                completed ? 'text-green-800' : 'text-gray-800'
                              }`}>
                                {topic.title}
                              </h3>
                              {isNext && !completed && (
                                <span className="px-2 py-0.5 bg-[#0055A4] text-white text-xs rounded-full">
                                  Next
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <BookOpen className="w-4 h-4" />
                                {topic.assignmentQuestions.length} questions
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                ~1 min study time
                              </span>
                              <span className={`px-2 py-0.5 rounded text-xs ${
                                topic.assignmentType === 'assignment'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {topic.assignmentType === 'assignment' ? 'Assignment' : 'Quiz'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {completed ? (
                              <span className="text-green-600 font-medium flex items-center gap-1">
                                <CheckCircle className="w-5 h-5" />
                                Completed
                              </span>
                            ) : unlocked ? (
                              <Button
                                size="sm"
                                className="bg-gradient-to-r from-[#0055A4] to-purple-600 text-white"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStartTopic(topic);
                                }}
                              >
                                Start
                                <ArrowRight className="w-4 h-4 ml-1" />
                              </Button>
                            ) : (
                              <span className="text-gray-400 text-sm flex items-center gap-1">
                                <Lock className="w-4 h-4" />
                                Locked
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Info Card */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Star className="w-5 h-5 text-[#0055A4]" />
                How to Complete the Course
              </h3>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-[#0055A4] text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                    1
                  </div>
                  <p>Study each topic's information and examples thoroughly</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-[#0055A4] text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                    2
                  </div>
                  <p>Watch the YouTube video for additional explanation</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-[#0055A4] text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                    3
                  </div>
                  <p>Review the PDF notes for deeper understanding</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-[#0055A4] text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                    4
                  </div>
                  <p>Complete the assignment with at least 70% to unlock the next topic</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-[#0055A4] text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                    5
                  </div>
                  <p>Complete all topics to earn the course completion achievement!</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
