import { useState } from 'react';
import { motion } from 'motion/react';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { ClipboardList, Send, CheckCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface QuizAttemptProps {
  quiz: any;
  userId: string;
  onComplete: () => void;
}

export function QuizAttempt({ quiz, userId, onComplete }: QuizAttemptProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>(new Array(quiz.questions.length).fill(''));
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Check if all questions are answered
    if (selectedAnswers.some(answer => !answer)) {
      toast.error('Please answer all questions');
      return;
    }

    setLoading(true);

    try {
      // Calculate score
      let correctCount = 0;
      quiz.questions.forEach((q: any, index: number) => {
        if (selectedAnswers[index] === q.correctAnswer) {
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
        assignmentId: quiz.id,
        assignmentTitle: quiz.title,
        score: correctCount,
        totalQuestions: quiz.questions.length,
        timestamp: new Date()
      });

      setScore(correctCount);
      setSubmitted(true);
      toast.success('Quiz submitted successfully!');
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error('Failed to submit quiz');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    const percentage = ((score / quiz.questions.length) * 100).toFixed(1);
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-3xl mx-auto"
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
          
          <h2 className="text-3xl mb-2 text-gray-800">Quiz Completed!</h2>
          <p className="text-gray-600 mb-8">Bien joué!</p>
          
          <div className="bg-gradient-to-r from-[#EF4135] to-pink-600 rounded-xl p-6 text-white mb-8">
            <p className="text-lg mb-2">Your Score</p>
            <p className="text-5xl mb-2">{score}/{quiz.questions.length}</p>
            <p className="text-xl">{percentage}%</p>
          </div>

          <div className="space-y-4 mb-8">
            {quiz.questions.map((q: any, index: number) => {
              const isCorrect = selectedAnswers[index] === q.correctAnswer;
              const selectedOption = q.options[['A', 'B', 'C', 'D'].indexOf(selectedAnswers[index])];
              const correctOption = q.options[['A', 'B', 'C', 'D'].indexOf(q.correctAnswer)];
              
              return (
                <div key={index} className={`p-4 rounded-lg border-2 text-left ${
                  isCorrect ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
                }`}>
                  <p className="mb-3 text-gray-800">
                    <span className="text-[#EF4135] mr-2">Q{index + 1}:</span>
                    {q.question}
                  </p>
                  <div className="space-y-2 text-sm">
                    {q.options.map((option: string, optIndex: number) => {
                      const letter = String.fromCharCode(65 + optIndex);
                      const isSelected = selectedAnswers[index] === letter;
                      const isCorrectOption = q.correctAnswer === letter;
                      
                      return (
                        <div
                          key={optIndex}
                          className={`p-2 rounded ${
                            isCorrectOption ? 'bg-green-200 font-medium' :
                            isSelected && !isCorrect ? 'bg-red-200' :
                            'bg-white'
                          }`}
                        >
                          {letter}) {option}
                          {isCorrectOption && <span className="ml-2 text-green-700">✓ Correct</span>}
                          {isSelected && !isCorrect && <span className="ml-2 text-red-700">✗ Your answer</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={onComplete}
            className="bg-gradient-to-r from-[#EF4135] to-pink-600 text-white px-8 py-3 rounded-xl hover:shadow-lg transition-all"
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
        <div className="bg-gradient-to-r from-[#EF4135] to-pink-600 p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <ClipboardList className="w-8 h-8" />
            <h2 className="text-3xl">{quiz.title}</h2>
          </div>
          <p className="text-red-100">{quiz.questions.length} questions</p>
        </div>

        {/* Questions */}
        <div className="p-6 space-y-6">
          {quiz.questions.map((q: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 bg-gray-50 rounded-xl border border-gray-200"
            >
              <p className="mb-4 text-gray-800">
                <span className="text-[#EF4135] mr-2">Question {index + 1}:</span>
                {q.question}
              </p>
              <div className="space-y-2">
                {q.options.map((option: string, optIndex: number) => {
                  const letter = String.fromCharCode(65 + optIndex); // A, B, C, D
                  const isSelected = selectedAnswers[index] === letter;
                  
                  return (
                    <motion.button
                      key={optIndex}
                      type="button"
                      onClick={() => {
                        const newAnswers = [...selectedAnswers];
                        newAnswers[index] = letter;
                        setSelectedAnswers(newAnswers);
                      }}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'border-[#EF4135] bg-red-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <span className={`mr-3 px-2 py-1 rounded ${
                        isSelected ? 'bg-[#EF4135] text-white' : 'bg-gray-200 text-gray-700'
                      }`}>
                        {letter}
                      </span>
                      {option}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          ))}

          {/* Submit Button */}
          <motion.button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#EF4135] to-pink-600 text-white py-4 rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            {loading ? (
              'Submitting...'
            ) : (
              <>
                <Send className="w-5 h-5" />
                Submit Quiz
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
