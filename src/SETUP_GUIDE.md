# FrancÉtude Quick Setup Guide

## Step-by-Step Firebase Setup

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Enter project name: `FrancEtude` (or your preferred name)
4. Disable Google Analytics (optional)
5. Click "Create Project"

### 2. Enable Authentication

1. In Firebase Console, click "Authentication" in the left sidebar
2. Click "Get Started"
3. Click on "Email/Password" under Sign-in providers
4. Enable "Email/Password"
5. Click "Save"

### 3. Create Admin Account

1. Still in Authentication, click on the "Users" tab
2. Click "Add User"
3. Enter:
   - Email: `franceetude@gmail.com`
   - Password: `Password@09`
4. Click "Add User"

### 4. Enable Cloud Firestore

1. Click "Firestore Database" in the left sidebar
2. Click "Create Database"
3. Select "Start in test mode" (we'll add security rules later)
4. Choose your region (closest to your users)
5. Click "Enable"

### 5. Get Firebase Configuration

1. Click the gear icon next to "Project Overview"
2. Click "Project Settings"
3. Scroll down to "Your apps"
4. Click the web icon `</>`
5. Register your app with a nickname (e.g., "FrancEtude Web")
6. Copy the `firebaseConfig` object

### 6. Update Your App

1. Open `/firebase.ts` in your project
2. Replace the placeholder config with your actual config:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
};
```

### 7. Set Up Firestore Security Rules

1. In Firebase Console, go to "Firestore Database"
2. Click on the "Rules" tab
3. Copy the rules from `FIRESTORE_RULES.md`
4. Paste them into the rules editor
5. Click "Publish"

### 8. Create Firestore Indexes (Optional)

If you get index errors, Firebase will provide a link to create the required index automatically. Just click the link in the error message.

### 9. Test Your Setup

1. Start your development server
2. Try logging in with the admin credentials:
   - Email: `franceetude@gmail.com`
   - Password: `Password@09`
3. Create a test assignment
4. Sign up as a student with a different email
5. Attempt the assignment as the student
6. Check the admin dashboard to see the score

## Common Issues & Solutions

### Issue: "Firebase: Error (auth/user-not-found)"

**Solution**: Make sure you created the admin user in Firebase Authentication

### Issue: "Missing or insufficient permissions"

**Solution**: Check that you've applied the Firestore security rules correctly

### Issue: "Firebase config not found"

**Solution**: Verify you've replaced the placeholder config in `/firebase.ts` with your actual Firebase config

### Issue: Charts not showing data

**Solution**: Make sure students have submitted at least one assignment/quiz

### Issue: Can't create assignments

**Solution**: Verify you're logged in with the admin email `franceetude@gmail.com`

## Firestore Collections Structure

Your Firestore database will automatically create these collections:

```
📁 users
   └── {userId}
       ├── email: string
       ├── name: string
       ├── role: "student"
       └── createdAt: timestamp

📁 assignments
   └── {assignmentId}
       ├── title: string
       ├── type: "assignment" | "quiz"
       ├── questions: array
       └── createdAt: timestamp

📁 scores
   └── {scoreId}
       ├── studentId: string
       ├── studentName: string
       ├── assignmentId: string
       ├── assignmentTitle: string
       ├── score: number
       ├── totalQuestions: number
       └── timestamp: timestamp
```

## Testing Checklist

✅ Admin can login  
✅ Admin can create assignments  
✅ Admin can create quizzes  
✅ Admin can see dashboard with charts  
✅ Students can sign up  
✅ Students can see available assignments  
✅ Students can attempt assignments (once)  
✅ Students can attempt quizzes (once)  
✅ Students receive immediate scores  
✅ Students can view their profile and scores  
✅ Admin can see all student scores

## Production Deployment Checklist

Before deploying to production:

1. ✅ Change admin password from default
2. ✅ Update Firestore rules from test mode to production rules
3. ✅ Set up proper Firebase billing (Blaze plan for production)
4. ✅ Enable Firebase App Check for additional security
5. ✅ Set up Firebase Storage rules if using file uploads
6. ✅ Configure CORS if needed
7. ✅ Set up monitoring and alerts
8. ✅ Back up your Firestore data regularly

## Support Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules Guide](https://firebase.google.com/docs/firestore/security/get-started)
- [React Firebase Hooks](https://github.com/CSFrequency/react-firebase-hooks)

## Next Steps

1. Customize the color scheme if desired (edit Tailwind classes)
2. Add more question types if needed
3. Implement email notifications (using Firebase Cloud Functions)
4. Add assignment deadlines
5. Export student data to CSV
6. Add bulk student import
7. Create parent/guardian accounts
8. Add discussion forums
9. Implement real-time collaboration

---

**Ready to go!** 🚀 Your FrancÉtude application is now configured and ready to use.

If you encounter any issues, refer to the troubleshooting section above or check the Firebase Console for error messages.

**Bonne chance!** 🇫🇷