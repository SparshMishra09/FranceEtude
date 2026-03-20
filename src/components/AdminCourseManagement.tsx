import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { BookOpen, Sparkles, Trash2, Plus, Youtube, FileText, Info, Copy, ClipboardList, FileCheck } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent } from './ui/card';

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

export function AdminCourseManagement() {
  const [activeTab, setActiveTab] = useState<'add' | 'remove'>('add');
  const [topics, setTopics] = useState<CourseTopic[]>([]);
  const [loading, setLoading] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [assignmentType, setAssignmentType] = useState<'assignment' | 'quiz'>('quiz');
  const [assignmentJsonInput, setAssignmentJsonInput] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const jsonTemplate = `{
  "semester": "1",
  "topic_title": "Numbers 0-100",
  "introduction": "French numbers from 0 to 100 follow specific patterns.\\n\\nNumbers 0-16 are unique and must be memorized.\\n\\nNumbers 17-19 use 'dix + number'.",
  "content": "📌 BASIC NUMBERS (0-16):\\n• zéro, un, deux, trois, quatre, cinq\\n\\n📌 TEENS (17-19):\\n• dix-sept, dix-huit, dix-neuf",
  "vocabulary": ["zéro", "un", "deux"],
  "examples": [
    {"french": "J'ai vingt-et-un ans.", "english": "I am twenty-one years old."}
  ],
  "notes": "⚠️ Important:\\n• Use 'et' with 21, 31, 41\\n• Hyphens in compound numbers",
  "youtube_link": "https://www.youtube.com/watch?v=example",
  "pdf_link": "https://drive.google.com/file/d/example/view"
}`;

  const assignmentTemplate = `{
  "questions": [
    {
      "question": "What is the French word for 'hello'?",
      "answer": "Bonjour"
    },
    {
      "question": "Translate 'thank you' to French",
      "answer": "Merci"
    },
    {
      "question": "How do you say 'goodbye' in French?",
      "answer": "Au revoir"
    }
  ]
}`;

  const quizTemplate = `{
  "questions": [
    {
      "question": "What is the capital of France?",
      "options": ["Berlin", "Madrid", "Paris", "Rome"],
      "correctAnswer": "C"
    },
    {
      "question": "How do you say 'good morning' in French?",
      "options": ["Bonsoir", "Bonjour", "Bonne nuit", "Salut"],
      "correctAnswer": "B"
    },
    {
      "question": "Which word means 'cat' in French?",
      "options": ["Chien", "Oiseau", "Chat", "Poisson"],
      "correctAnswer": "C"
    }
  ]
}`;

  const copyTemplate = (type: 'topic' | 'assignment' | 'quiz') => {
    let template = '';
    if (type === 'topic') {
      template = jsonTemplate;
    } else if (type === 'assignment') {
      template = assignmentTemplate;
    } else {
      template = quizTemplate;
    }
    navigator.clipboard.writeText(template);
    toast.success('Template copied to clipboard!');
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const topicsQuery = query(collection(db, 'courseTopics'), orderBy('order', 'asc'));
      const topicsSnapshot = await getDocs(topicsQuery);
      const topicsData = topicsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CourseTopic[];
      setTopics(topicsData);
    } catch (error) {
      console.error('Error fetching topics:', error);
      toast.error('Failed to load course topics');
    }
  };

  const handleAddTopic = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!jsonInput.trim()) {
      toast.error('Please paste your JSON content');
      return;
    }

    setLoading(true);

    try {
      const topicData = JSON.parse(jsonInput);
      const requiredFields = ['topic_title', 'introduction', 'content', 'examples', 'youtube_link', 'pdf_link'];
      const missingFields = requiredFields.filter(field => !topicData[field]);

      if (missingFields.length > 0) {
        toast.error(`Missing required fields: ${missingFields.join(', ')}`);
        setLoading(false);
        return;
      }

      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|youtube\.shorts)\/.+$/;
      if (!youtubeRegex.test(topicData.youtube_link)) {
        toast.error('Invalid YouTube link in JSON');
        setLoading(false);
        return;
      }

      const formattedExamples = Array.isArray(topicData.examples)
        ? topicData.examples.map((ex: any) => ex.french + '\n' + ex.english).join('\n\n')
        : '';

      // Parse assignment/quiz questions if provided
      let assignmentQuestions: any[] = [];
      if (assignmentJsonInput.trim()) {
        try {
          const assignmentData = JSON.parse(assignmentJsonInput);
          if (assignmentData.questions && Array.isArray(assignmentData.questions)) {
            // Validate questions based on type
            if (assignmentType === 'quiz') {
              const validQuestions = assignmentData.questions.every((q: any) => 
                q.question && Array.isArray(q.options) && q.options.length === 4 && q.correctAnswer
              );
              if (!validQuestions) {
                toast.error('Invalid quiz questions format. Each question must have: question, options (4), and correctAnswer');
                setLoading(false);
                return;
              }
            } else {
              const validQuestions = assignmentData.questions.every((q: any) => 
                q.question && q.answer
              );
              if (!validQuestions) {
                toast.error('Invalid assignment questions format. Each question must have: question and answer');
                setLoading(false);
                return;
              }
            }
            assignmentQuestions = assignmentData.questions;
          }
        } catch (error: any) {
          toast.error(`Invalid assignment/quiz JSON: ${error.message}`);
          setLoading(false);
          return;
        }
      }

      const nextOrder = topics.length > 0 ? Math.max(...topics.map(t => t.order)) + 1 : 0;

      await addDoc(collection(db, 'courseTopics'), {
        title: topicData.topic_title,
        topicInfo: topicData.introduction + '\n\n' + topicData.content,
        topicExamples: formattedExamples,
        youtubeLink: topicData.youtube_link,
        pdfLink: topicData.pdf_link,
        assignmentType,
        assignmentQuestions,
        vocabulary: topicData.vocabulary || [],
        notes: topicData.notes || '',
        order: nextOrder,
        createdAt: new Date()
      });

      toast.success(`Topic "${topicData.topic_title}" added successfully with ${assignmentQuestions.length} ${assignmentType} questions!`);
      setJsonInput('');
      setAssignmentJsonInput('');
      fetchTopics();
    } catch (error: any) {
      console.error('Error parsing JSON:', error);
      toast.error(`Invalid JSON: ${error.message}. Please check the format.`);
    } finally {
      setLoading(false);
    }
  };

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
            French Course Management
          </motion.h1>
          <p className="text-blue-100">Gérer le Cours de Français - Add and manage course topics</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <Button
          onClick={() => setActiveTab('add')}
          className={`flex items-center gap-2 ${
            activeTab === 'add'
              ? 'bg-gradient-to-r from-[#0055A4] to-purple-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Plus className="w-4 h-4" />
          Add Topic
        </Button>
        <Button
          onClick={() => setActiveTab('remove')}
          className={`flex items-center gap-2 ${
            activeTab === 'remove'
              ? 'bg-gradient-to-r from-[#EF4135] to-pink-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Trash2 className="w-4 h-4" />
          Remove Topic ({topics.length})
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'add' && (
          <motion.div
            key="add"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <Card className="border-2 border-[#0055A4]/20">
              <CardContent className="p-6 space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Info className="w-5 h-5 text-[#0055A4]" />
                    How to Create a Topic
                  </h3>
                  <div className="space-y-3 text-sm text-gray-700">
                    <p><strong>Step 1:</strong> Copy the topic template below</p>
                    <p><strong>Step 2:</strong> Paste into ChatGPT with your textbook content</p>
                    <p><strong>Step 3:</strong> Copy the JSON output from ChatGPT</p>
                    <p><strong>Step 4:</strong> Paste it in the "Topic JSON" box below</p>
                    <p><strong>Step 5:</strong> Choose Assignment or Quiz and copy that template</p>
                    <p><strong>Step 6:</strong> Paste the template into ChatGPT to generate questions</p>
                    <p><strong>Step 7:</strong> Paste the assignment/quiz JSON in the respective box</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-gray-700 font-medium">
                      Topic Template (Copy This)
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => copyTemplate('topic')}
                      className="flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      Copy Template
                    </Button>
                  </div>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-xl overflow-x-auto">
                    <pre className="text-xs font-mono whitespace-pre-wrap">{jsonTemplate}</pre>
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                  <p className="text-sm text-gray-700 mb-2"><strong>Use this prompt with ChatGPT for Topic:</strong></p>
                  <div className="bg-white p-3 rounded border border-purple-200">
                    <code className="text-xs text-purple-700">
                      Extract the topic from my textbook content and return ONLY valid JSON.
                      Use the text "\\n" (backslash + n) for line breaks in the JSON strings, NOT actual line breaks.
                      Format with bullet points (•) and section headers (📌) for readability.
                    </code>
                  </div>
                </div>

                <form onSubmit={handleAddTopic} className="space-y-6">
                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">
                      Paste Topic JSON from ChatGPT <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      value={jsonInput}
                      onChange={(e) => setJsonInput(e.target.value)}
                      placeholder='{"topic_title": "Numbers 0-100", "introduction": "...", ...}'
                      rows={16}
                      className="font-mono text-sm resize-none"
                    />
                  </div>

                  {/* Assignment/Quiz Type Selector */}
                  <div>
                    <label className="block text-gray-700 mb-3 font-medium">
                      Add Assignment or Quiz for this Topic?
                    </label>
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        onClick={() => setAssignmentType('assignment')}
                        className={`flex-1 flex items-center justify-center gap-2 py-6 ${
                          assignmentType === 'assignment'
                            ? 'bg-gradient-to-r from-[#0055A4] to-purple-600 text-white'
                            : 'bg-white text-gray-700 border-2 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <FileCheck className="w-6 h-6" />
                        <div className="text-left">
                          <div className="font-semibold">Assignment</div>
                          <div className="text-xs opacity-75">Short answer questions</div>
                        </div>
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setAssignmentType('quiz')}
                        className={`flex-1 flex items-center justify-center gap-2 py-6 ${
                          assignmentType === 'quiz'
                            ? 'bg-gradient-to-r from-[#EF4135] to-pink-600 text-white'
                            : 'bg-white text-gray-700 border-2 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <ClipboardList className="w-6 h-6" />
                        <div className="text-left">
                          <div className="font-semibold">Quiz</div>
                          <div className="text-xs opacity-75">Multiple choice questions</div>
                        </div>
                      </Button>
                    </div>
                  </div>

                  {/* Assignment/Quiz Template */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-gray-700 font-medium">
                        {assignmentType === 'assignment' ? 'Assignment' : 'Quiz'} Template (Copy This)
                      </label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => copyTemplate(assignmentType)}
                        className="flex items-center gap-2"
                      >
                        <Copy className="w-4 h-4" />
                        Copy Template
                      </Button>
                    </div>
                    <div className={`p-4 rounded-xl overflow-x-auto ${
                      assignmentType === 'assignment' 
                        ? 'bg-gray-900 text-green-400' 
                        : 'bg-gray-900 text-pink-400'
                    }`}>
                      <pre className="text-xs font-mono whitespace-pre-wrap">
                        {assignmentType === 'assignment' ? assignmentTemplate : quizTemplate}
                      </pre>
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl border-2 ${
                    assignmentType === 'assignment'
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Use this prompt with ChatGPT for {assignmentType === 'assignment' ? 'Assignment' : 'Quiz'}:</strong>
                    </p>
                    <div className="bg-white p-3 rounded border border-gray-200">
                      <code className="text-xs text-gray-700">
                        {assignmentType === 'assignment'
                          ? 'Create short-answer questions from my textbook content. Return ONLY valid JSON with questions and answers.'
                          : 'Create multiple-choice questions from my textbook content. Each question must have 4 options (A, B, C, D) and specify the correct answer. Return ONLY valid JSON.'}
                      </code>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">
                      Paste {assignmentType === 'assignment' ? 'Assignment' : 'Quiz'} JSON (Optional)
                    </label>
                    <Textarea
                      value={assignmentJsonInput}
                      onChange={(e) => setAssignmentJsonInput(e.target.value)}
                      placeholder={`{"questions": [{"question": "...", "${assignmentType === 'assignment' ? 'answer' : 'options'}": ...}]}`}
                      rows={12}
                      className="font-mono text-sm resize-none"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      {assignmentJsonInput ? '✓ Assignment/Quiz JSON provided' : 'Leave empty if no assignment/quiz for this topic'}
                    </p>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-[#0055A4] to-purple-600 text-white py-4 rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {loading ? (
                      'Adding Topic...'
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Add Topic with {assignmentType === 'assignment' ? 'Assignment' : 'Quiz'}
                      </>
                    )}
                  </motion.button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === 'remove' && (
          <motion.div
            key="remove"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {topics.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl mb-2 text-gray-800">No Topics Yet</h3>
                  <p className="text-gray-500">Add your first course topic using the "Add Topic" tab</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {topics.map((topic, index) => (
                  <motion.div
                    key={topic.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#0055A4] to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-800">{topic.title}</h3>
                              <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Youtube className="w-4 h-4" />
                                  Video included
                                </span>
                                <span className="flex items-center gap-1">
                                  <FileText className="w-4 h-4" />
                                  PDF notes
                                </span>
                                <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs">
                                  {topic.assignmentQuestions.length} questions
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              const confirmDelete = window.confirm(
                                `⚠️ Delete "${topic.title}"?\n\nThis will also remove this topic from all students' progress!\n\nThis cannot be undone!`
                              );
                              if (!confirmDelete) return;

                              setDeletingId(topic.id);
                              try {
                                // Delete the topic
                                await deleteDoc(doc(db, 'courseTopics', topic.id));
                                
                                // Remove topic from all students' progress
                                const progressQuery = query(collection(db, 'courseProgress'));
                                const progressSnapshot = await getDocs(progressQuery);
                                
                                const batch = writeBatch(db);
                                progressSnapshot.docs.forEach(progressDoc => {
                                  const progressData = progressDoc.data();
                                  const completedTopics = progressData.completedTopics || [];
                                  const visitedTopics = progressData.visitedTopics || [];
                                  
                                  // Remove deleted topic from completed topics
                                  const updatedCompleted = completedTopics.filter((id: string) => id !== topic.id);
                                  // Remove deleted topic from visited topics
                                  const updatedVisited = visitedTopics.filter((id: string) => id !== topic.id);
                                  
                                  // Update currentTopicId if it was pointing to deleted topic
                                  let updatedCurrentTopic = progressData.currentTopicId;
                                  if (progressData.currentTopicId === topic.id) {
                                    // Set to next available topic or null
                                    const nextTopic = topics.find(t => t.order === topic.order + 1);
                                    updatedCurrentTopic = nextTopic ? nextTopic.id : null;
                                  }
                                  
                                  batch.update(doc(db, 'courseProgress', progressDoc.id), {
                                    completedTopics: updatedCompleted,
                                    visitedTopics: updatedVisited,
                                    currentTopicId: updatedCurrentTopic
                                  });
                                });
                                
                                await batch.commit();
                                
                                setTopics(prev => prev.filter(t => t.id !== topic.id));
                                toast.success('Topic removed successfully from course and student progress');
                              } catch (error: any) {
                                console.error('Error deleting topic:', error);
                                toast.error(`Failed to delete: ${error.message}`);
                              } finally {
                                setDeletingId(null);
                              }
                            }}
                            disabled={deletingId === topic.id}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50"
                          >
                            {deletingId === topic.id ? (
                              <span className="animate-spin">⏳</span>
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
