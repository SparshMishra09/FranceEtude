import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { AuthScreen } from './components/AuthScreen';
import { AdminDashboard } from './components/AdminDashboard';
import { StudentDashboard } from './components/StudentDashboard';
import { LoadingScreen } from './components/LoadingScreen';
import { ToasterProvider } from './components/ToasterProvider';

export type UserRole = 'admin' | 'student' | null;

export interface UserData {
  email: string;
  name: string;
  role: UserRole;
  createdAt?: any;
}

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);

        // Check if user is the hardcoded admin
        if (firebaseUser.email === 'franceetude@gmail.com') {
          setUserRole('admin');
          // Ensure admin has a Firestore document with admin role
          try {
            const adminDocRef = doc(db, 'users', firebaseUser.uid);
            const adminDoc = await getDoc(adminDocRef);
            if (!adminDoc.exists()) {
              await setDoc(adminDocRef, {
                email: firebaseUser.email,
                name: 'Administrator',
                role: 'admin',
                createdAt: new Date()
              });
            }
          } catch (error) {
            console.error('Error creating admin document:', error);
          }
        } else {
          // Get user role from Firestore
          try {
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data() as UserData;
              setUserRole(userData.role || 'student');
            } else {
              setUserRole('student');
            }
          } catch (error) {
            console.error('Error fetching user role:', error);
            setUserRole('student');
          }
        }
      } else {
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <>
        <LoadingScreen />
        <ToasterProvider />
      </>
    );
  }

  if (!user) {
    return (
      <>
        <AuthScreen />
        <ToasterProvider />
      </>
    );
  }

  if (userRole === 'admin') {
    return (
      <>
        <AdminDashboard user={user} />
        <ToasterProvider />
      </>
    );
  }

  return (
    <>
      <StudentDashboard user={user} />
      <ToasterProvider />
    </>
  );
}