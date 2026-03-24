# 🇫🇷 FrancÉtude – French Learning Platform

## 📖 Overview
**FrancÉtude** is a modern web application designed to help French teachers manage students, assignments, and quizzes while delivering an interactive and structured French learning experience.

Built using **React, TypeScript, Vite, and Firebase**, the platform combines education with smart progress tracking and engaging content delivery.

---

## ✨ Features

### 👩‍🏫 For Teachers (Admin)

- 📊 **Dashboard**
  - Student performance analytics
  - Score distribution insights
  - Recent submissions overview

- 👥 **Student Management**
  - View, search, filter, and remove students

- 📝 **Assignment & Quiz Management**
  - Create, view, and delete assignments/quizzes
  - Organized by semester

- 📚 **French Course Management**
  - Add topics with:
    - Detailed explanations (French + English)
    - Examples
    - YouTube videos
    - PDF notes
  - Attach assignments/quizzes to topics
  - Remove or update topics

- 📈 **Progress Tracking**
  - Monitor individual student progress
  - Track overall course completion

---

### 🎓 For Students

- 🏠 **Dashboard**
  - View assignments and quizzes by semester

- 👤 **Profile**
  - Track scores, performance, and statistics

- 📖 **Interactive French Course**
  - Topic-by-topic structured learning
  - Includes:
    - Explanations
    - Examples
    - Videos
    - Notes

- ⏱ **Smart Progression System**
  - Minimum **1-minute study requirement**
  - **70% score required** to unlock next topic
  - Retake failed assignments

- 🏆 **Achievements**
  - Course completion recognition

---

## ⚙️ Tech Stack

- **Frontend:** React 18, TypeScript, Vite  
- **UI:** Tailwind CSS, Radix UI, Framer Motion  
- **Backend:** Firebase Authentication, Firestore  
- **Charts:** Recharts  
- **Design Theme:** French Flag Colors  
  - Blue `#0055A4`
  - White
  - Red `#EF4135`

---

## 📂 Project Structure


## Running the Application

### Development

```bash
npm install
npm run dev
```

### Production Build

```bash
npm run build
```

## Firebase Setup

### Firestore Collections

1. **users** - Student and admin user data
   - `email`, `name`, `role`, `semester`, `createdAt`

2. **assignments** - Assignments and quizzes
   - `title`, `type`, `semester`, `questions`, `createdAt`

3. **scores** - Student submission scores
   - `studentId`, `studentName`, `assignmentId`, `assignmentTitle`, `score`, `totalQuestions`, `timestamp`, `semester`

4. **courseTopics** - French course topics
   - `title`, `topicInfo`, `topicExamples`, `youtubeLink`, `pdfLink`, `assignmentType`, `assignmentQuestions`, `order`, `createdAt`

5. **courseProgress** - Student course progress
   - `userId`, `completedTopics`, `currentTopicId`, `visitedTopics`, `startedAt`, `completedAt`

### Firestore Rules

Update your Firestore rules with the contents of `firestore.rules` in your Firebase Console.

### Firebase Configuration

Update the Firebase configuration in `src/firebase.ts` with your project credentials.

## Admin Access

Login with the admin credentials:
- **Email**: franceetude@gmail.com
- **Password**: [Your admin password]

## Student Registration

Students can sign up and select their semester during registration. This determines which assignments and quizzes they can access.

## French Course Feature

### How It Works

1. **Topic Structure**: Each topic includes:
   - Topic title and detailed information
   - Examples for better understanding
   - YouTube video for visual learning
   - PDF notes for additional reference
   - Assignment or quiz to test knowledge

2. **Progression System**:
   - Students must study each topic for at least 1 minute before proceeding
   - Assignments require 70% score to unlock the next topic
   - Failed attempts can be retaken
   - Progress is tracked automatically
   - Course completion achievement upon finishing all topics

3. **Admin Course Management**:
   - Add new topics with all required materials
   - Use ChatGPT-friendly templates to generate topic content
   - Remove topics when needed
   - View individual student progress
   - Monitor overall course completion statistics

### Template Formats

#### Topic Information Template
```
Extract the following information from the provided textbook content:

TOPIC INFORMATION:
[Write a clear, detailed explanation of the topic in French and English]

TOPIC EXAMPLES:
[List 3-5 examples demonstrating the concept]
```

#### Assignment Template (Written)
```
Q1: [Your question here]?
A1: [Correct answer here]
Q2: [Your question here]?
A2: [Correct answer here]
```

#### Quiz Template (Multiple Choice)
```
Q1: [Your question here]?
A) [Option 1]
B) [Option 2]
C) [Option 3]
D) [Option 4]
Correct: [A/B/C/D]
```

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: Radix UI, Tailwind CSS, Motion (Framer Motion)
- **Backend**: Firebase Authentication, Firestore
- **Charts**: Recharts
- **Styling**: French-themed color palette (#0055A4, #EF4135)

## Project Structure

```
src/
├── components/
│   ├── AdminDashboard.tsx
│   ├── AdminHome.tsx
│   ├── AdminStudents.tsx
│   ├── AdminAssignments.tsx
│   ├── AdminCourseManagement.tsx
│   ├── AdminCourseProgress.tsx
│   ├── CreateAssignment.tsx
│   ├── CreateQuiz.tsx
│   ├── StudentDashboard.tsx
│   ├── StudentHome.tsx
│   ├── StudentProfile.tsx
│   ├── StudentCourseView.tsx
│   ├── CourseTopicLearning.tsx
│   ├── AssignmentAttempt.tsx
│   ├── QuizAttempt.tsx
│   └── AuthScreen.tsx
├── firebase.ts
├── App.tsx
└── index.css
```

## Credits

- Design inspired by Figma design bundle
- French flag color scheme: Blue (#0055A4), White, Red (#EF4135)
- Built with ❤️ for French education

## License

This project is proprietary software developed for FrancÉtude.
