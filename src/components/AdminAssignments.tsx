import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { collection, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { FileText, ClipboardList, Trash2, Search, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface Assignment {
  id: string;
  title: string;
  type: 'assignment' | 'quiz';
  semester?: string;
  questions: any[];
  createdAt: any;
}

export function AdminAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSemester, setSelectedSemester] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const assignmentsSnapshot = await getDocs(collection(db, 'assignments'));
      const assignmentsData = assignmentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Assignment[];
      
      // Sort by creation date, newest first
      assignmentsData.sort((a, b) => {
        const dateA = a.createdAt?.toMillis?.() || 0;
        const dateB = b.createdAt?.toMillis?.() || 0;
        return dateB - dateA;
      });
      
      setAssignments(assignmentsData);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAssignment = async (assignment: Assignment) => {
    const confirmDelete = window.confirm(
      `⚠️ WARNING: This action cannot be undone!\n\n` +
      `Are you sure you want to completely remove "${assignment.title}"?\n\n` +
      `This will permanently delete:\n` +
      `• The assignment itself\n` +
      `• All student scores and submissions for this assignment`
    );

    if (!confirmDelete) return;

    setDeletingId(assignment.id);

    try {
      // Step 1: Query and get all scores for this particular assignment
      const scoresQuery = query(collection(db, 'scores'), where('assignmentId', '==', assignment.id));
      const scoresSnapshot = await getDocs(scoresQuery);
      
      // Step 2: Delete all those scores sequentially
      for (const scoreDoc of scoresSnapshot.docs) {
        await deleteDoc(doc(db, 'scores', scoreDoc.id));
      }

      // Step 3: Delete the assignment document itself
      await deleteDoc(doc(db, 'assignments', assignment.id));

      // Step 4: Update local state to remove the assignment visually
      setAssignments(prev => prev.filter(a => a.id !== assignment.id));

      toast.success(`"${assignment.title}" and ${scoresSnapshot.docs.length} associated scores removed successfully`);
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(`Failed to delete: ${error.message || 'Unknown error'}`);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSemester = selectedSemester === 'all' || (assignment.semester || 'sem-1') === selectedSemester;
    return matchesSearch && matchesSemester;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading assignments...</div>
      </div>
    );
  }

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
            Manage Assignments
          </motion.h1>
          <p className="text-blue-100">Gérer les Devoirs - {assignments.length} total assignments</p>
        </div>
      </div>

      {/* Filtering Options */}
      <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 flex flex-col sm:flex-row gap-4">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Semester Filter */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <BookOpen className="w-5 h-5 text-[#0055A4] hidden sm:block" />
          <Select value={selectedSemester} onValueChange={setSelectedSemester}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by semester" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Semesters</SelectItem>
              <SelectItem value="sem-1">Semester 1</SelectItem>
              <SelectItem value="sem-2">Semester 2</SelectItem>
              <SelectItem value="sem-3">Semester 3</SelectItem>
              <SelectItem value="sem-4">Semester 4</SelectItem>
              <SelectItem value="sem-5">Semester 5</SelectItem>
              <SelectItem value="sem-6">Semester 6</SelectItem>
              <SelectItem value="sem-7">Semester 7</SelectItem>
              <SelectItem value="sem-8">Semester 8</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Assignments List grid */}
      {filteredAssignments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAssignments.map((assignment, index) => {
            const isDeleting = deletingId === assignment.id;
            const isQuiz = assignment.type === 'quiz';
            
            return (
              <motion.div
                key={assignment.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all flex flex-col"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
                    isQuiz ? 'bg-red-100' : 'bg-blue-100'
                  }`}>
                    {isQuiz ? (
                      <ClipboardList className="w-6 h-6 text-[#EF4135]" />
                    ) : (
                      <FileText className="w-6 h-6 text-[#0055A4]" />
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ml-3 ${
                    isQuiz ? 'bg-red-100 text-[#EF4135]' : 'bg-blue-100 text-[#0055A4]'
                  }`}>
                    {isQuiz ? 'Quiz' : 'Assignment'}
                  </span>
                </div>
                
                <h3 className="text-xl font-semibold mb-2 text-gray-800 line-clamp-2" title={assignment.title}>
                  {assignment.title}
                </h3>
                
                <div className="text-sm text-gray-500 mb-6 flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-700">Questions:</span> 
                    {assignment.questions ? assignment.questions.length : 0}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-700">Semester:</span> 
                    <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">
                      {(assignment.semester || 'sem-1').replace('sem-', 'Sem ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-700">Created:</span> 
                    {assignment.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-100 mt-auto">
                  <Button
                    variant="outline"
                    onClick={() => handleDeleteAssignment(assignment)}
                    disabled={isDeleting}
                    className="w-full flex items-center justify-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    {isDeleting ? 'Removing...' : 'Delete Permanently'}
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-12 text-center shadow-lg border border-gray-100 flex flex-col items-center">
          <FileText className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-xl mb-2 text-gray-800">
            {searchTerm ? 'No matching assignments found' : 'No assignments created yet'}
          </h3>
          <p className="text-gray-500">
            {searchTerm 
              ? 'Try adjusting your search or semester filter.' 
              : 'Head over to "Create Assignment" or "Create Quiz" to get started.'}
          </p>
        </div>
      )}
    </div>
  );
}
