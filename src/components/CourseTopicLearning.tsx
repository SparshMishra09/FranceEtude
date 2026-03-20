import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { BookOpen, Youtube, FileText, ArrowRight, CheckCircle, Clock, AlertCircle, Info } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { AssignmentAttempt } from './AssignmentAttempt';
import { QuizAttempt } from './QuizAttempt';

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
}

interface CourseTopicLearningProps {
  topic: CourseTopic;
  userId: string;
  onComplete: () => void;
  onBack: () => void;
  allTopics: CourseTopic[];
}

export function CourseTopicLearning({ topic, userId, onComplete, onBack, allTopics }: CourseTopicLearningProps) {
  const [timeSpent, setTimeSpent] = useState(0);
  const [canProceed, setCanProceed] = useState(false);
  const [showAssignment, setShowAssignment] = useState(false);
  const [assignmentComplete, setAssignmentComplete] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const MIN_TIME_SECONDS = 60; // 1 minute minimum

  useEffect(() => {
    // Start timer when component mounts
    timerRef.current = setInterval(() => {
      setTimeSpent(prev => {
        const newTime = prev + 1;
        if (newTime >= MIN_TIME_SECONDS) {
          setCanProceed(true);
        }
        return newTime;
      });
    }, 1000);

    // Show info dialog on first visit
    const checkFirstVisit = async () => {
      try {
        const progressDoc = await getDoc(doc(db, 'courseProgress', userId));
        if (progressDoc.exists()) {
          const progress = progressDoc.data();
          const hasVisitedTopic = progress.visitedTopics?.includes(topic.id);
          
          if (!hasVisitedTopic) {
            setShowInfoDialog(true);
            // Mark as visited
            const visitedTopics = progress.visitedTopics || [];
            await updateDoc(doc(db, 'courseProgress', userId), {
              visitedTopics: [...visitedTopics, topic.id]
            });
          }
        } else {
          setShowInfoDialog(true);
          // Create progress doc with visited topic
          await setDoc(doc(db, 'courseProgress', userId), {
            userId,
            completedTopics: [],
            currentTopicId: topic.id,
            visitedTopics: [topic.id],
            startedAt: new Date()
          });
        }
      } catch (error) {
        console.error('Error checking progress:', error);
      }
    };

    checkFirstVisit();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [topic.id, userId]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getYoutubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (videoId && videoId[1]) {
      return `https://www.youtube.com/embed/${videoId[1]}`;
    }
    return null;
  };

  const handleProceedToAssignment = () => {
    if (timeSpent >= MIN_TIME_SECONDS) {
      setShowAssignment(true);
    } else {
      toast.error(`Please spend at least ${MIN_TIME_SECONDS / 60} minute studying the material`);
    }
  };

  const handleAssignmentComplete = async () => {
    setIsCompleting(true);

    try {
      // Get current progress
      const progressDoc = await getDoc(doc(db, 'courseProgress', userId));
      let completedTopics: string[] = [];
      
      if (progressDoc.exists()) {
        completedTopics = progressDoc.data().completedTopics || [];
      }

      // Add this topic to completed topics
      if (!completedTopics.includes(topic.id)) {
        completedTopics.push(topic.id);
      }

      // Find next topic
      const currentTopicIndex = allTopics.findIndex(t => t.id === topic.id);
      const nextTopic = allTopics[currentTopicIndex + 1];

      // Update progress
      await updateDoc(doc(db, 'courseProgress', userId), {
        completedTopics,
        currentTopicId: nextTopic ? nextTopic.id : null,
        completedAt: nextTopic ? undefined : new Date()
      });

      setAssignmentComplete(true);
      toast.success('Topic completed! Bien joué!');
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress');
    } finally {
      setIsCompleting(false);
    }
  };

  if (assignmentComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto"
      >
        <Card className="overflow-hidden">
          <CardContent className="p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-10 h-10 text-green-600" />
            </motion.div>

            <h2 className="text-3xl mb-2 text-gray-800">Topic Completed!</h2>
            <p className="text-gray-600 mb-8">Félicitations! You've mastered this topic.</p>

            <div className="bg-gradient-to-r from-[#0055A4] to-purple-600 rounded-xl p-6 text-white mb-8">
              <p className="text-lg mb-2">Time Spent</p>
              <p className="text-4xl font-bold">{formatTime(timeSpent)}</p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={onComplete}
                className="w-full bg-gradient-to-r from-[#0055A4] to-purple-600 hover:shadow-lg"
              >
                Continue to Next Topic
              </Button>
              <Button
                onClick={onBack}
                variant="outline"
                className="w-full"
              >
                Back to Course Overview
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (showAssignment) {
    return (
      <div>
        <Button
          onClick={() => setShowAssignment(false)}
          variant="outline"
          className="mb-4"
        >
          ← Back to Topic
        </Button>
        <CourseAssignmentAttempt
          topic={topic}
          userId={userId}
          onComplete={handleAssignmentComplete}
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Info Dialog */}
      <Dialog open={showInfoDialog} onOpenChange={setShowInfoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>How to Complete This Topic</DialogTitle>
            <DialogDescription>
              Follow these steps to complete the topic and earn progress
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-[#0055A4] mt-0.5" />
              <div>
                <p className="font-medium">Study the Material</p>
                <p className="text-sm text-gray-600">Spend time reading the topic information and examples</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Youtube className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <p className="font-medium">Watch the Video</p>
                <p className="text-sm text-gray-600">View the YouTube video for additional explanation</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <p className="font-medium">Review PDF Notes</p>
                <p className="text-sm text-gray-600">Download and study the PDF notes for deeper understanding</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium">Complete the Assignment</p>
                <p className="text-sm text-gray-600">Score at least 70% to unlock the next topic. You can retry if needed!</p>
              </div>
            </div>
          </div>
          <Button onClick={() => setShowInfoDialog(false)}>
            Got it!
          </Button>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex items-center gap-4">
        <Button onClick={onBack} variant="outline" size="sm">
          ← Back
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-800">{topic.title}</h1>
          <div className="flex items-center gap-4 mt-2">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
              canProceed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              <Clock className="w-4 h-4" />
              {canProceed ? 'Ready to proceed' : `Minimum study time: ${formatTime(MIN_TIME_SECONDS)}`}
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4" />
              Time spent: {formatTime(timeSpent)}
            </div>
          </div>
        </div>
      </div>

      {/* Topic Information */}
      <Card>
        <CardContent className="p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#0055A4]" />
              Topic Information
            </h2>
            <div 
              className="prose max-w-none bg-gray-50 p-6 rounded-lg border border-gray-200 topic-content"
              dangerouslySetInnerHTML={{ 
                __html: topic.topicInfo
                  .replace(/\\n/g, '\n')
                  .replace(/\n\n/g, '<br><br>')
                  .replace(/\n/g, '<br>')
                  .replace(/📌 (.*?):/g, '<span class="section-title">📌 $1:</span>')
                  .replace(/👉 (.*?):/g, '<span class="rule-tag">👉 $1:</span>')
                  .replace(/•/g, '•')
              }}
            />
          </div>

          {topic.topicExamples && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Examples
              </h2>
              <div 
                className="prose max-w-none bg-green-50 p-6 rounded-lg border border-green-200 topic-content"
                dangerouslySetInnerHTML={{ 
                  __html: topic.topicExamples
                    .replace(/\\n/g, '\n')
                    .replace(/\n\n/g, '<br><br>')
                    .replace(/\n/g, '<br>')
                    .replace(/•/g, '•')
                }}
              />
            </div>
          )}

          {topic.vocabulary && topic.vocabulary.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-600" />
                Vocabulary
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <thead className="bg-purple-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-purple-800 border-b border-purple-200">#</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-purple-800 border-b border-purple-200">French Word</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topic.vocabulary.map((word: string, index: number) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-purple-50'}>
                        <td className="px-4 py-3 text-sm text-gray-600 border-b border-gray-100">{index + 1}</td>
                        <td className="px-4 py-3 text-sm text-gray-800 font-medium border-b border-gray-100">{word}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {topic.notes && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-yellow-600" />
                Important Notes
              </h2>
              <div 
                className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg topic-content"
                dangerouslySetInnerHTML={{ 
                  __html: topic.notes
                    .replace(/\\n/g, '\n')
                    .replace(/\n\n/g, '<br><br>')
                    .replace(/\n/g, '<br>')
                    .replace(/⚠️ (.*?):/g, '<span class="warning-tag">⚠️ $1:</span>')
                    .replace(/•/g, '•')
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <style>{`
        .topic-content {
          line-height: 1.8;
        }
        .topic-content .section-title {
          display: block;
          font-size: 1.1em;
          font-weight: 700;
          color: #0055A4;
          margin: 1em 0 0.5em 0;
        }
        .topic-content .rule-tag {
          display: inline-block;
          font-weight: 600;
          color: #EF4135;
          background: #FFE5E5;
          padding: 0.2em 0.6em;
          border-radius: 4px;
          margin: 0.3em 0;
        }
        .topic-content .warning-tag {
          display: inline-block;
          font-weight: 600;
          color: #92400E;
          background: #FEF3C7;
          padding: 0.2em 0.6em;
          border-radius: 4px;
          margin: 0.3em 0;
        }
        .topic-content br + br {
          margin-bottom: 0.8em;
        }
      `}</style>

      {/* YouTube Video */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Youtube className="w-5 h-5 text-red-500" />
            Video Tutorial
          </h2>
          {getYoutubeEmbedUrl(topic.youtubeLink) ? (
            <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
              <iframe
                src={getYoutubeEmbedUrl(topic.youtubeLink)!}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          ) : (
            <div className="text-gray-500 text-sm">Invalid YouTube link</div>
          )}
        </CardContent>
      </Card>

      {/* PDF Notes */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            PDF Notes
          </h2>
          <a
            href={topic.pdfLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
          >
            <FileText className="w-5 h-5" />
            Open PDF Notes
          </a>
          <p className="text-sm text-gray-500 mt-2">
            Click to open the PDF notes in a new tab
          </p>
        </CardContent>
      </Card>

      {/* Proceed Button */}
      <div className="sticky bottom-4 bg-white rounded-xl shadow-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {canProceed ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <Clock className="w-6 h-6 text-yellow-600" />
            )}
            <div>
              <p className="font-medium text-gray-800">
                {canProceed ? "Ready for the assignment?" : "Keep studying!"}
              </p>
              <p className="text-sm text-gray-500">
                {canProceed 
                  ? "You've spent enough time studying. Proceed to test your knowledge."
                  : `You need to study for ${formatTime(MIN_TIME_SECONDS - timeSpent)} more before proceeding.`}
              </p>
            </div>
          </div>
          <Button
            onClick={handleProceedToAssignment}
            disabled={!canProceed}
            className="bg-gradient-to-r from-[#0055A4] to-purple-600 text-white px-8"
          >
            Proceed to Assignment
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Course Assignment Attempt Component - wraps existing AssignmentAttempt/QuizAttempt
function CourseAssignmentAttempt({ topic, userId, onComplete }: { topic: CourseTopic; userId: string; onComplete: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState<{ correct: number; total: number; percentage: string } | null>(null);

  const isAssignment = topic.assignmentType === 'assignment';

  const handleSubmit = async (scoreData: { correct: number; total: number; percentage: string }) => {
    setLoading(true);

    try {
      // Get current progress
      const progressDoc = await getDoc(doc(db, 'courseProgress', userId));
      let completedTopics: string[] = [];

      if (progressDoc.exists()) {
        completedTopics = progressDoc.data().completedTopics || [];
      }

      // Add this topic to completed topics ONLY if not already completed
      if (!completedTopics.includes(topic.id)) {
        completedTopics.push(topic.id);
      }

      // Find next topic using order property
      const nextTopicOrder = topic.order + 1;
      
      // Get next topic from allTopics passed from parent
      const nextTopic = allTopics.find(t => t.order === nextTopicOrder);

      // Update progress
      await updateDoc(doc(db, 'courseProgress', userId), {
        completedTopics,
        currentTopicId: nextTopic ? nextTopic.id : null,
        completedAt: nextTopic ? undefined : new Date()
      });

      setScore(scoreData);
      toast.success('Topic completed! Bien joué!');
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignmentComplete = async (passed: boolean, scoreData?: { correct: number; total: number; percentage: string }) => {
    if (passed && scoreData) {
      // Save progress and show score
      await handleSubmit(scoreData);
      setSubmitted(true);
    } else if (!passed && scoreData) {
      // Failed - show retry screen
      setSubmitted(true);
    }
  };

  if (submitted && score) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto"
      >
        <Card className="overflow-hidden">
          <CardContent className="p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-10 h-10 text-green-600" />
            </motion.div>

            <h2 className="text-3xl mb-2 text-gray-800">Topic Completed!</h2>
            <p className="text-gray-600 mb-6">Félicitations! You've mastered this topic.</p>

            <div className="bg-gradient-to-r from-[#0055A4] to-purple-600 rounded-xl p-6 text-white mb-8">
              <p className="text-lg mb-2">Your Score</p>
              <p className="text-5xl font-bold mb-1">{score.correct}/{score.total}</p>
              <p className="text-2xl">{score.percentage}%</p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={onComplete}
                className="w-full bg-gradient-to-r from-[#0055A4] to-purple-600 hover:shadow-lg"
              >
                Continue to Next Topic
              </Button>
              <Button
                onClick={onBack}
                variant="outline"
                className="w-full"
              >
                Back to Course Overview
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Create a mock assignment/quiz object for the existing components
  const mockAssignment = {
    id: topic.id,
    title: `${topic.title} - ${isAssignment ? 'Assignment' : 'Quiz'}`,
    questions: topic.assignmentQuestions,
    type: topic.assignmentType
  };

  return (
    <div>
      {isAssignment ? (
        <AssignmentAttempt
          assignment={mockAssignment}
          userId={userId}
          onComplete={handleAssignmentComplete}
          requirePass={true}
        />
      ) : (
        <QuizAttempt
          quiz={mockAssignment}
          userId={userId}
          onComplete={handleAssignmentComplete}
          requirePass={true}
        />
      )}
    </div>
  );
}
