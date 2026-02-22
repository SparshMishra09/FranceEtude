import { useState } from 'react';
import { motion } from 'motion/react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { ClipboardList, Sparkles, Info, BookOpen } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function CreateQuiz() {
  const [title, setTitle] = useState('');
  const [semester, setSemester] = useState<string>('sem-1');
  const [questionsText, setQuestionsText] = useState('');
  const [loading, setLoading] = useState(false);

  const parseQuizQuestions = (text: string) => {
    // Expected format:
    // Q1: Question text?
    // A) Option 1
    // B) Option 2
    // C) Option 3
    // D) Option 4
    // Correct: A
    
    const lines = text.split('\n').filter(line => line.trim() !== '');
    const questions = [];
    let i = 0;
    
    while (i < lines.length) {
      const questionLine = lines[i];
      
      if (questionLine && questionLine.match(/^Q\d+:/i)) {
        const question = questionLine.replace(/^Q\d+:\s*/i, '').trim();
        const options = [];
        i++;
        
        // Parse options (A, B, C, D)
        while (i < lines.length && lines[i].match(/^[A-D]\)/i)) {
          const option = lines[i].replace(/^[A-D]\)\s*/i, '').trim();
          options.push(option);
          i++;
        }
        
        // Parse correct answer
        let correctAnswer = '';
        if (i < lines.length && lines[i].match(/^Correct:/i)) {
          correctAnswer = lines[i].replace(/^Correct:\s*/i, '').trim().toUpperCase();
          i++;
        }
        
        if (question && options.length === 4 && correctAnswer) {
          questions.push({
            question,
            options,
            correctAnswer
          });
        }
      } else {
        i++;
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
      const questions = parseQuizQuestions(questionsText);

      if (questions.length === 0) {
        toast.error('No valid questions found. Please check the format.');
        setLoading(false);
        return;
      }

      await addDoc(collection(db, 'assignments'), {
        title,
        type: 'quiz',
        semester,
        questions,
        createdAt: new Date()
      });

      toast.success(`Quiz created for Semester ${semester.replace('sem-', '')} with ${questions.length} questions!`);
      setTitle('');
      setSemester('sem-1');
      setQuestionsText('');
    } catch (error) {
      console.error('Error creating quiz:', error);
      toast.error('Failed to create quiz');
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
        <div className="bg-gradient-to-r from-[#EF4135] to-pink-600 p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <ClipboardList className="w-8 h-8" />
            <h2 className="text-3xl">Create Quiz</h2>
          </div>
          <p className="text-red-100">Créer un Quiz</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-gray-700 mb-2">
              Quiz Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., French Vocabulary Quiz"
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#EF4135] focus:border-transparent transition-all outline-none"
            />
          </div>

          {/* Semester Selector */}
          <div>
            <label className="block text-gray-700 mb-2">
              Select Semester
            </label>
            <div className="relative">
              <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#EF4135] focus:border-transparent transition-all outline-none appearance-none"
              >
                <option value="sem-1">Semester 1</option>
                <option value="sem-2">Semester 2</option>
                <option value="sem-3">Semester 3</option>
                <option value="sem-4">Semester 4</option>
                <option value="sem-5">Semester 5</option>
                <option value="sem-6">Semester 6</option>
                <option value="sem-7">Semester 7</option>
                <option value="sem-8">Semester 8</option>
              </select>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              This quiz will only be visible to students in {semester.replace('sem-', 'Semester ')}
            </p>
          </div>

          {/* Instructions Card */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-[#EF4135] mt-0.5 flex-shrink-0" />
              <div className="text-sm text-gray-700">
                <p className="mb-2">
                  <strong>Format Instructions:</strong>
                </p>
                <p className="mb-1">Paste your quiz questions with multiple choice options:</p>
                <pre className="bg-white p-3 rounded mt-2 text-xs overflow-x-auto">
{`Q1: What is the capital of France?
A) Berlin
B) Madrid
C) Paris
D) Rome
Correct: C

Q2: How do you say "goodbye" in French?
A) Bonjour
B) Au revoir
C) Merci
D) S'il vous plaît
Correct: B`}
                </pre>
              </div>
            </div>
          </div>

          {/* Questions Text Area */}
          <div>
            <label className="block text-gray-700 mb-2">
              Quiz Questions
            </label>
            <textarea
              value={questionsText}
              onChange={(e) => setQuestionsText(e.target.value)}
              placeholder="Paste your quiz questions here..."
              required
              rows={20}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#EF4135] focus:border-transparent transition-all outline-none font-mono text-sm resize-none"
            />
            <p className="text-sm text-gray-500 mt-2">
              {questionsText.split('\n').filter(line => line.trim().startsWith('Q')).length} questions detected
            </p>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#EF4135] to-pink-600 text-white py-4 rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            {loading ? (
              'Creating Quiz...'
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Create Quiz
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
          <div className="space-y-6">
            {parseQuizQuestions(questionsText).map((q, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-800 mb-3">
                  <span className="text-[#EF4135] mr-2">Q{index + 1}:</span>
                  {q.question}
                </p>
                <div className="space-y-2 mb-3">
                  {q.options.map((option, optIndex) => {
                    const letter = String.fromCharCode(65 + optIndex); // A, B, C, D
                    const isCorrect = letter === q.correctAnswer;
                    return (
                      <div
                        key={optIndex}
                        className={`p-2 rounded ${
                          isCorrect ? 'bg-green-100 border border-green-300' : 'bg-white border border-gray-200'
                        }`}
                      >
                        <span className="mr-2">{letter})</span>
                        {option}
                        {isCorrect && <span className="ml-2 text-green-600 text-sm">✓ Correct</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
