import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Mail, Lock, User, ArrowRight, BookOpen, GraduationCap } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

type AuthMode = 'login' | 'signup' | 'forgot';

export function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [semester, setSemester] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Bienvenue! Welcome back!');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email,
        name,
        role: 'student',
        semester: semester || 'sem-1', // Default to sem-1 if not selected
        createdAt: new Date()
      });

      toast.success('Compte créé! Account created successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent! Check your inbox.');
      setMode('login');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background with French flag gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0055A4] via-white to-[#EF4135] opacity-90" />
      
      {/* Decorative patterns */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-64 h-64 bg-[#0055A4] rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#EF4135] rounded-full blur-3xl" />
      </div>

      {/* Background image */}
      <div className="absolute inset-0">
        <ImageWithFallback 
          src="https://images.unsplash.com/photo-1570097703229-b195d6dd291f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlaWZmZWwlMjB0b3dlciUyMHBhcmlzfGVufDF8fHx8MTc2NDA2MjI1Nnww&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Paris"
          className="w-full h-full object-cover opacity-20"
        />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Logo and Title */}
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-2xl mb-4">
              <GraduationCap className="w-10 h-10 text-[#0055A4]" />
            </div>
            <h1 className="text-5xl mb-2 bg-gradient-to-r from-[#0055A4] to-[#EF4135] bg-clip-text text-transparent">
              FrancÉtude
            </h1>
            <p className="text-gray-700">Excellence in French Education</p>
          </motion.div>

          {/* Auth Card */}
          <motion.div
            className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <AnimatePresence mode="wait">
              {mode === 'login' && (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-3xl mb-6 text-[#0055A4]">
                    Welcome Back
                  </h2>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        required
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0055A4] focus:border-transparent transition-all outline-none"
                      />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0055A4] focus:border-transparent transition-all outline-none"
                      />
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-sm text-[#0055A4] hover:text-[#EF4135] transition-colors"
                    >
                      Forgot Password?
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-[#0055A4] to-[#0055A4]/80 text-white py-3 rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? 'Logging in...' : 'Login'}
                      <ArrowRight className="w-5 h-5" />
                    </button>

                    <div className="text-center mt-6">
                      <span className="text-gray-600">Don't have an account? </span>
                      <button
                        type="button"
                        onClick={() => setMode('signup')}
                        className="text-[#EF4135] hover:underline"
                      >
                        Sign up
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {mode === 'signup' && (
                <motion.div
                  key="signup"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-3xl mb-6 text-[#0055A4]">
                    Join FrancÉtude
                  </h2>
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Full Name"
                        required
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0055A4] focus:border-transparent transition-all outline-none"
                      />
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        required
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0055A4] focus:border-transparent transition-all outline-none"
                      />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                        minLength={6}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0055A4] focus:border-transparent transition-all outline-none"
                      />
                    </div>
                    <div className="relative">
                      <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <select
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                        required
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0055A4] focus:border-transparent transition-all outline-none appearance-none"
                      >
                        <option value="">Select Semester</option>
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

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-[#EF4135] to-[#EF4135]/80 text-white py-3 rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? 'Creating Account...' : 'Create Account'}
                      <ArrowRight className="w-5 h-5" />
                    </button>

                    <div className="text-center mt-6">
                      <span className="text-gray-600">Already have an account? </span>
                      <button
                        type="button"
                        onClick={() => setMode('login')}
                        className="text-[#0055A4] hover:underline"
                      >
                        Login
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {mode === 'forgot' && (
                <motion.div
                  key="forgot"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-3xl mb-6 text-[#0055A4]">
                    Reset Password
                  </h2>
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <p className="text-gray-600 mb-4">
                      Enter your email address and we'll send you a link to reset your password.
                    </p>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        required
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0055A4] focus:border-transparent transition-all outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-[#0055A4] to-[#0055A4]/80 text-white py-3 rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? 'Sending...' : 'Send Reset Link'}
                      <ArrowRight className="w-5 h-5" />
                    </button>

                    <div className="text-center mt-6">
                      <button
                        type="button"
                        onClick={() => setMode('login')}
                        className="text-[#0055A4] hover:underline"
                      >
                        ← Back to Login
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Footer */}
          <motion.p 
            className="text-center mt-6 text-gray-700"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <BookOpen className="inline w-4 h-4 mr-2" />
            Empowering students through French education
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
