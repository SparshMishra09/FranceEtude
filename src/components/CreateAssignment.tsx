import { useState } from 'react';
import { motion } from 'motion/react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { FileText, Sparkles, Info } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function CreateAssignment() {
  const [title, setTitle] = useState('');
  const [questionsText, setQuestionsText] = useState('');
  const [loading, setLoading] = useState(false);

  const parseQuestionsAndAnswers = (text: string) => {
    // Expected format:
    // Q1: Question text?
    // A1: Answer text
    // Q2: Question text?
    // A2: Answer text
    
    const lines = text.split('\n').filter(line => line.trim() !== '');
    const questions = [];
    
    for (let i = 0; i < lines.length; i += 2) {
      const questionLine = lines[i];
      const answerLine = lines[i + 1];
      
      if (questionLine && answerLine) {
        // Remove Q1:, Q2:, etc. and A1:, A2:, etc.
        const question = questionLine.replace(/^Q\d+:\s*/i, '').trim();
        const answer = answerLine.replace(/^A\d+:\s*/i, '').trim();
        
        if (question && answer) {
          questions.push({ question, answer });
        }
      }
    }
    
    return questions;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !questionsText.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const questions = parseQuestionsAndAnswers(questionsText);
      
      if (questions.length === 0) {
        toast.error('No valid questions found. Please check the format.');
        setLoading(false);
        return;
      }

      await addDoc(collection(db, 'assignments'), {
        title,
        type: 'assignment',
        questions,
        createdAt: new Date()
      });

      toast.success(`Assignment created with ${questions.length} questions!`);
      setTitle('');
      setQuestionsText('');
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast.error('Failed to create assignment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0055A4] to-purple-600 p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-8 h-8" />
            <h2 className="text-3xl">Create Assignment</h2>
          </div>
          <p className="text-blue-100">Créer un Devoir</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-gray-700 mb-2">
              Assignment Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., French Grammar Exercise 1"
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0055A4] focus:border-transparent transition-all outline-none"
            />
          </div>

          {/* Instructions Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-[#0055A4] mt-0.5 flex-shrink-0" />
              <div className="text-sm text-gray-700">
                <p className="mb-2">
                  <strong>Format Instructions:</strong>
                </p>
                <p className="mb-1">Paste your questions and answers in the following format:</p>
                <pre className="bg-white p-3 rounded mt-2 text-xs overflow-x-auto">
{`Q1: What is the French word for "hello"?
A1: Bonjour
Q2: Translate "thank you" to French
A2: Merci`}
                </pre>
              </div>
            </div>
          </div>

          {/* Questions Text Area */}
          <div>
            <label className="block text-gray-700 mb-2">
              Questions and Answers
            </label>
            <textarea
              value={questionsText}
              onChange={(e) => setQuestionsText(e.target.value)}
              placeholder="Paste your questions and answers here..."
              required
              rows={15}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0055A4] focus:border-transparent transition-all outline-none font-mono text-sm resize-none"
            />
            <p className="text-sm text-gray-500 mt-2">
              {questionsText.split('\n').filter(line => line.trim().startsWith('Q')).length} questions detected
            </p>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#0055A4] to-purple-600 text-white py-4 rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            {loading ? (
              'Creating Assignment...'
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Create Assignment
              </>
            )}
          </motion.button>
        </form>
      </motion.div>

      {/* Preview Section */}
      {questionsText && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
        >
          <h3 className="text-xl mb-4 text-gray-800">Preview</h3>
          <div className="space-y-4">
            {parseQuestionsAndAnswers(questionsText).map((q, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-800 mb-2">
                  <span className="text-[#0055A4] mr-2">Q{index + 1}:</span>
                  {q.question}
                </p>
                <p className="text-gray-600 text-sm">
                  <span className="text-green-600 mr-2">Answer:</span>
                  {q.answer}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
