# FrancÉtude 🇫🇷

A beautiful, French-themed educational web application for creating and managing assignments and quizzes. Built with React, TypeScript, Firebase, and styled with French flag colors.

![FrancÉtude](https://images.unsplash.com/photo-1570097703229-b195d6dd291f?w=800)

## ✨ Features

### 👨‍🏫 Teacher/Admin Features
- **Dashboard with Analytics**: View comprehensive statistics including:
  - Student performance charts
  - Score distribution graphs
  - Recent submissions table
  - Overall class metrics
- **Create Assignments**: Text-based questions with specific answers
- **Create Quizzes**: Multiple choice questions with 4 options
- **Student Performance Tracking**: Monitor all student scores and progress

### 👨‍🎓 Student Features
- **Dashboard**: View all available and completed assignments/quizzes
- **Attempt Assignments/Quizzes**: Each can only be attempted once
- **Automatic Scoring**: Instant feedback with detailed results
- **Profile with Scores**: View personal information and grade history
- **Performance Statistics**: Track average score, best score, and total attempts

## 🎨 Design

The application features a stunning French-inspired design with:
- **Color Scheme**: French flag colors (Blue #0055A4, White #FFFFFF, Red #EF4135)
- **Animations**: Smooth transitions and Motion animations throughout
- **Responsive**: Works beautifully on desktop, tablet, and mobile
- **French Elements**: Bilingual interface with French accents for authenticity

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ installed
- A Firebase project set up
- Firebase Authentication enabled (Email/Password)
- Cloud Firestore enabled

### Installation

1. **Clone or download this repository**

2. **Install dependencies** (if running locally):
   ```bash
   npm install
   ```

3. **Configure Firebase**:
   - Open `/firebase.ts`
   - Replace the placeholder values with your Firebase config:
   ```typescript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

4. **Set up Firestore Security Rules**:
   - See `FIRESTORE_RULES.md` for detailed instructions
   - Copy the rules from that file to your Firestore Rules tab

5. **Create the Admin Account**:
   - Go to Firebase Console > Authentication
   - Manually create a user with:
     - Email: `franceetude@gmail.com`
     - Password: `Password@09`
   - This account will automatically have admin privileges

## 📖 How to Use

### For Teachers/Administrators

1. **Login** with `franceetude@gmail.com` / `Password@09`

2. **Create an Assignment**:
   - Click "Create Assignment"
   - Enter a title
   - Paste questions in this format:
   ```
   Q1: What is the French word for "hello"?
   A1: Bonjour
   Q2: Translate "thank you" to French
   A2: Merci
   ```
   - Click "Create Assignment"

3. **Create a Quiz**:
   - Click "Create Quiz"
   - Enter a title
   - Paste questions in this format:
   ```
   Q1: What is the capital of France?
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
   Correct: B
   ```
   - Click "Create Quiz"

4. **View Dashboard**:
   - See student performance charts
   - Monitor recent submissions
   - Track overall statistics

### For Students

1. **Sign Up**:
   - Click "Sign up"
   - Enter your name, email, and password
   - Account is automatically created as a student

2. **View Available Assignments**:
   - See all assignments and quizzes on your dashboard
   - View which ones are pending or completed

3. **Attempt an Assignment/Quiz**:
   - Click on any available assignment or quiz
   - Answer all questions
   - Submit to see your score immediately
   - Each assignment/quiz can only be attempted once

4. **View Your Profile**:
   - See your personal information
   - View all your scores and grades
   - Track your progress with statistics

## 🗂️ Project Structure

```
/
├── App.tsx                          # Main application component
├── firebase.ts                      # Firebase configuration
├── components/
│   ├── AuthScreen.tsx              # Login/Signup/Forgot Password
│   ├── LoadingScreen.tsx           # Loading animation
│   ├── ToasterProvider.tsx         # Toast notifications
│   ├── AdminDashboard.tsx          # Admin layout and navigation
│   ├── AdminHome.tsx               # Admin dashboard with charts
│   ├── AdminProfile.tsx            # Admin profile page
│   ├── CreateAssignment.tsx        # Assignment creation form
│   ├── CreateQuiz.tsx              # Quiz creation form
│   ├── StudentDashboard.tsx        # Student layout and navigation
│   ├── StudentHome.tsx             # Student dashboard
│   ├── StudentProfile.tsx          # Student profile with scores
│   ├── AssignmentAttempt.tsx       # Assignment attempt interface
│   └── QuizAttempt.tsx             # Quiz attempt interface
├── styles/
│   └── globals.css                 # Global styles and Tailwind config
├── FIRESTORE_RULES.md              # Firestore security rules
└── README.md                       # This file
```

## 🔐 Security

The application implements comprehensive Firestore security rules:
- Students can only view and create their own scores
- Only the admin can create, update, or delete assignments
- Scores are immutable once submitted (prevents cheating)
- Users can only access their own profile data

See `FIRESTORE_RULES.md` for complete security rule details.

## 🛠️ Technologies Used

- **React** - UI framework
- **TypeScript** - Type safety
- **Firebase Authentication** - User management
- **Cloud Firestore** - Database
- **Tailwind CSS** - Styling
- **Motion (Framer Motion)** - Animations
- **Recharts** - Data visualization
- **Lucide React** - Icons
- **Sonner** - Toast notifications

## 📊 Database Collections

### users
```typescript
{
  email: string;
  name: string;
  role: 'admin' | 'student';
  createdAt: Timestamp;
}
```

### assignments
```typescript
{
  title: string;
  type: 'assignment' | 'quiz';
  questions: Array<{
    question: string;
    answer?: string;           // For assignments
    options?: string[];        // For quizzes
    correctAnswer?: string;    // For quizzes (A, B, C, or D)
  }>;
  createdAt: Timestamp;
}
```

### scores
```typescript
{
  studentId: string;
  studentName: string;
  assignmentId: string;
  assignmentTitle: string;
  score: number;
  totalQuestions: number;
  timestamp: Timestamp;
}
```

## 🎯 Key Features Explained

### Automatic Scoring
- **Assignments**: Compares student answers with correct answers (case-insensitive)
- **Quizzes**: Compares selected option with correct answer
- **Instant Feedback**: Shows which questions were correct/incorrect
- **Immutable Scores**: Once submitted, scores cannot be changed

### One Attempt Policy
- Students can only attempt each assignment/quiz once
- System tracks completed assignments per student
- Completed items show with a checkmark and cannot be re-attempted

### Admin Dashboard
- Real-time analytics with interactive charts
- Student performance visualization
- Score distribution insights
- Recent submissions tracking

## 🌍 Bilingual Design

The app features a beautiful blend of English and French:
- Main interface: English (for clarity)
- Design elements: French accents (Administrateur, Étudiant, Tableau de Bord, etc.)
- Notifications: Bilingual messages
- Creates an authentic French educational atmosphere

## 🎨 Color Palette

```css
Blue:   #0055A4  /* French flag blue */
White:  #FFFFFF  /* French flag white */
Red:    #EF4135  /* French flag red */
```

## 📱 Responsive Design

- **Desktop**: Full sidebar navigation with expansive charts
- **Tablet**: Optimized layout with responsive grids
- **Mobile**: Bottom navigation bar with touch-optimized interface

## 🚀 Deployment

This application can be deployed to:
- **Vercel** (recommended for React apps)
- **Netlify**
- **Firebase Hosting**
- **Any static hosting service**

Make sure to:
1. Set up environment variables for Firebase config
2. Build the application: `npm run build`
3. Deploy the build folder

## 📝 Admin Credentials

**Email**: franceetude@gmail.com  
**Password**: Password@09

**Important**: Change these credentials in production!

## 🤝 Support

For issues or questions:
1. Check Firebase console for errors
2. Verify Firestore rules are correctly applied
3. Ensure Firebase config is properly set
4. Check browser console for error messages

## 📄 License

This project is provided as-is for educational purposes.

## 🎓 Educational Use

Perfect for:
- French language schools
- Online education platforms
- Tutoring services
- Classroom management
- Student assessment

---

**Bienvenue à FrancÉtude!** 🇫🇷✨

Built with ❤️ for French education
