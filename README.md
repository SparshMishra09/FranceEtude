# FrancÉtude - French Learning Platform

## Overview

FrancÉtude is a comprehensive web application designed to help French teachers manage their students, assignments, quizzes, and provide an interactive French language course. Built with React, TypeScript, Vite, and Firebase.

## Features

### For Teachers (Admin)

- **Dashboard**: View student performance analytics, score distributions, and recent submissions
- **Student Management**: View, search, filter, and remove students
- **Assignment Management**: Create, view, and delete assignments organized by semester
- **Quiz Management**: Create, view, and delete quizzes organized by semester
- **French Course Management**: 
  - Add course topics with detailed information, examples, YouTube videos, and PDF notes
  - Create assignments/quizzes for each topic
  - Remove topics and manage course content
- **Course Progress Tracking**: Monitor each student's progress through the French course

### For Students

- **Dashboard**: View available assignments and quizzes filtered by semester
- **Profile**: Track personal performance, scores, and statistics
- **French Course**: 
  - Interactive topic-by-topic French learning course
  - Study materials including topic information, examples, videos, and PDF notes
  - Timer-based progress tracking (minimum 1 minute study time per topic)
  - Assignments with 70% pass requirement to unlock next topic
  - Progress tracking and course completion achievement

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
