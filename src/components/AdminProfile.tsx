import { motion } from 'motion/react';
import { User, Mail, Shield, Calendar } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface AdminProfileProps {
  user: any;
}

export function AdminProfile({ user }: AdminProfileProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
      >
        {/* Header with Background */}
        <div className="relative h-48 bg-gradient-to-r from-[#0055A4] to-[#EF4135] overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <ImageWithFallback 
              src="https://images.unsplash.com/photo-1570097703229-b195d6dd291f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlaWZmZWwlMjB0b3dlciUyMHBhcmlzfGVufDF8fHx8MTc2NDA2MjI1Nnww&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Background"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-end gap-4">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
                <User className="w-12 h-12 text-[#0055A4]" />
              </div>
              <div className="text-white mb-2">
                <h2 className="text-2xl">Administrator</h2>
                <p className="text-blue-100">Administrateur Principal</p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-6">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-[#0055A4] rounded-full">
              <Shield className="w-4 h-4" />
              <span className="text-sm">Admin Account</span>
            </div>
          </div>

          <div className="space-y-6">
            {/* Email Info */}
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
                <p className="text-sm text-gray-500">Email Address</p>
                <p className="text-gray-800">{user.email}</p>
              </div>
            </motion.div>

            {/* Role Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Role</p>
                <p className="text-gray-800">Administrator</p>
              </div>
            </motion.div>

            {/* Info Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6"
            >
              <h3 className="text-lg mb-3 text-gray-800">Administrator Access</h3>
              <p className="text-gray-600 text-sm mb-4">
                This is the main administrator account for FrancÉtude. As an administrator, you have full access to create assignments, quizzes, and view all student performance data.
              </p>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Create and manage assignments</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Create and manage quizzes</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>View student performance analytics</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Monitor all submissions and scores</span>
                </div>
              </div>
            </motion.div>

            {/* Note about account */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-yellow-50 border border-yellow-200 rounded-xl p-4"
            >
              <p className="text-sm text-gray-700">
                <strong>Note:</strong> This administrator account is authenticated directly through Firebase Auth and does not have an associated user profile in Firestore, as it was not created through the standard signup process.
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
