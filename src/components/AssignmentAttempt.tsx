import { useState } from 'react';
import { motion } from 'motion/react';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { FileText, Send, CheckCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface AssignmentAttemptProps {
  assignment: any;
  userId: string;
  onComplete: () => void;
}

export function AssignmentAttempt({ assignment, userId, onComplete }: AssignmentAttemptProps) {
  const [answers, setAnswers] = useState<string[]>(new Array(assignment.questions.length).fill(''));
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Check if all answers are filled
    if (answers.some(answer => !answer.trim())) {
      toast.error('Please answer all questions');
      return;
    }

    setLoading(true);

    try {
      // Calculate score
      let correctCount = 0;
      assignment.questions.forEach((q: any, index: number) => {
        const studentAnswer = answers[index].trim().toLowerCase();
        const correctAnswer = q.answer.trim().toLowerCase();
        if (studentAnswer === correctAnswer) {
          correctCount++;
        }
      });

      // Get student name
      const userDoc = await getDoc(doc(db, 'users', userId));
      const studentName = userDoc.exists() ? userDoc.data().name : 'Unknown Student';

      // Save score to Firestore
      await addDoc(collection(db, 'scores'), {
        studentId: userId,
        studentName,
        assignmentId: assignment.id,
        assignmentTitle: assignment.title,
        score: correctCount,
        totalQuestions: assignment.questions.length,
        timestamp: new Date()
      });

      setScore(correctCount);
      setSubmitted(true);
      toast.success('Assignment submitted successfully!');
    } catch (error) {
      console.error('Error submitting assignment:', error);
      toast.error('Failed to submit assignment');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    const percentage = ((score / assignment.questions.length) * 100).toFixed(1);
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto"
      >
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-10 h-10 text-green-600" />
          </motion.div>
          
          <h2 className="text-3xl mb-2 text-gray-800">Assignment Completed!</h2>
          <p className="text-gray-600 mb-8">Félicitations!</p>
          
          <div className="bg-gradient-to-r from-[#0055A4] to-[#EF4135] rounded-xl p-6 text-white mb-8">
            <p className="text-lg mb-2">Your Score</p>
            <p className="text-5xl mb-2">{score}/{assignment.questions.length}</p>
            <p className="text-xl">{percentage}%</p>
          </div>

          <div className="space-y-3 mb-8">
            {assignment.questions.map((q: any, index: number) => {
              const isCorrect = answers[index].trim().toLowerCase() === q.answer.trim().toLowerCase();
              return (
                <div key={index} className={`p-4 rounded-lg border-2 text-left ${
                  isCorrect ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
                }`}>
                  <p className="mb-2 text-gray-800">
                    <span className="text-[#0055A4] mr-2">Q{index + 1}:</span>
                    {q.question}
                  </p>
                  <p className="text-sm mb-1">
                    <span className="font-medium">Your answer:</span> {answers[index]}
                  </p>
                  {!isCorrect && (
                    <p className="text-sm">
                      <span className="font-medium text-green-700">Correct answer:</span> {q.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={onComplete}
            className="bg-gradient-to-r from-[#0055A4] to-[#EF4135] text-white px-8 py-3 rounded-xl hover:shadow-lg transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto"
    >
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0055A4] to-purple-600 p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-8 h-8" />
            <h2 className="text-3xl">{assignment.title}</h2>
          </div>
          <p className="text-blue-100">{assignment.questions.length} questions</p>
        </div>

        {/* Questions */}
        <div className="p-6 space-y-6">
          {assignment.questions.map((q: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 bg-gray-50 rounded-xl border border-gray-200"
            >
              <label className="block mb-3">
                <span className="text-gray-800">
                  <span className="text-[#0055A4] mr-2">Question {index + 1}:</span>
                  {q.question}
                </span>
              </label>
              <input
                type="text"
                value={answers[index]}
                onChange={(e) => {
                  const newAnswers = [...answers];
                  newAnswers[index] = e.target.value;
                  setAnswers(newAnswers);
                }}
                placeholder="Type your answer here..."
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0055A4] focus:border-transparent transition-all outline-none"
              />
            </motion.div>
          ))}

          {/* Submit Button */}
          <motion.button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#0055A4] to-purple-600 text-white py-4 rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            {loading ? (
              'Submitting...'
            ) : (
              <>
                <Send className="w-5 h-5" />
                Submit Assignment
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
