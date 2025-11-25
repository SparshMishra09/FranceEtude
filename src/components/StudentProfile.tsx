import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { User, Mail, Award, TrendingUp, Calendar, Trophy } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface StudentProfileProps {
  user: any;
}

interface Score {
  assignmentTitle: string;
  score: number;
  totalQuestions: number;
  timestamp: any;
}

export function StudentProfile({ user }: StudentProfileProps) {
  const [userData, setUserData] = useState<any>(null);
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }

        // Fetch scores
        const scoresQuery = query(collection(db, 'scores'), where('studentId', '==', user.uid));
        const scoresSnapshot = await getDocs(scoresQuery);
        const scoresData = scoresSnapshot.docs.map(doc => doc.data()) as Score[];
        // Sort by timestamp, newest first
        scoresData.sort((a, b) => b.timestamp?.toDate?.() - a.timestamp?.toDate?.() || 0);
        setScores(scoresData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.uid]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading profile...</div>
      </div>
    );
  }

  // Calculate statistics
  const totalAttempts = scores.length;
  const averageScore = totalAttempts > 0
    ? (scores.reduce((acc, s) => acc + (s.score / s.totalQuestions) * 100, 0) / totalAttempts).toFixed(1)
    : 0;
  const bestScore = totalAttempts > 0
    ? Math.max(...scores.map(s => (s.score / s.totalQuestions) * 100))
    : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
      >
        {/* Cover Image */}
        <div className="relative h-48 bg-gradient-to-r from-[#EF4135] to-[#0055A4] overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <ImageWithFallback 
              src="https://images.unsplash.com/photo-1602833334025-5019f046b8f7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVuY2glMjBjYWZlfGVufDF8fHx8MTc2NDAxMjc1OHww&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Background"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-end gap-4">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
                <User className="w-12 h-12 text-[#EF4135]" />
              </div>
              <div className="text-white mb-2">
                <h2 className="text-2xl">{userData?.name || 'Student'}</h2>
                <p className="text-red-100">Étudiant</p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-[#0055A4]" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-gray-800">{user.email}</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200"
            >
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="text-gray-800">
                  {userData?.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Attempts</p>
              <p className="text-2xl text-purple-600">{totalAttempts}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-[#0055A4]" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Average Score</p>
              <p className="text-2xl text-[#0055A4]">{averageScore}%</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Best Score</p>
              <p className="text-2xl text-yellow-600">{bestScore.toFixed(1)}%</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scores History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
      >
        <h3 className="text-2xl mb-4 text-gray-800">Mes Notes</h3>
        
        {scores.length > 0 ? (
          <div className="space-y-3">
            {scores.map((score, index) => {
              const percentage = ((score.score / score.totalQuestions) * 100).toFixed(1);
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex-1">
                    <h4 className="text-gray-800 mb-1">{score.assignmentTitle}</h4>
                    <p className="text-sm text-gray-500">
                      {score.timestamp?.toDate?.()?.toLocaleDateString() || 'N/A'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg text-gray-800 mb-1">
                      {score.score}/{score.totalQuestions}
                    </p>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      parseFloat(percentage) >= 80 ? 'bg-green-100 text-green-700' :
                      parseFloat(percentage) >= 60 ? 'bg-blue-100 text-blue-700' :
                      parseFloat(percentage) >= 40 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {percentage}%
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No scores yet. Complete assignments to see your grades here!</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
