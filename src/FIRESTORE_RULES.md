# FrancÉtude - Firestore Security Rules

## How to Apply These Rules

1. Go to your Firebase Console
2. Select your project
3. Navigate to Firestore Database
4. Click on the "Rules" tab
5. Replace the existing rules with the rules below
6. Click "Publish"

## Firestore Security Rules

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user is admin
    function isAdmin() {
      return isAuthenticated() && request.auth.token.email == 'franceetude@gmail.com';
    }
    
    // Helper function to check if user owns the document
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Users collection
    match /users/{userId} {
      // Users can read their own document
      allow read: if isAuthenticated() && (isOwner(userId) || isAdmin());
      
      // Users can create their own document during signup
      allow create: if isAuthenticated() && isOwner(userId) && 
                       request.resource.data.role == 'student';
      
      // Users can update their own document
      allow update: if isAuthenticated() && isOwner(userId);
      
      // Only admin can delete
      allow delete: if isAdmin();
    }
    
    // Assignments collection
    match /assignments/{assignmentId} {
      // Anyone authenticated can read assignments
      allow read: if isAuthenticated();
      
      // Only admin can create, update, or delete assignments
      allow create, update, delete: if isAdmin();
    }
    
    // Scores collection
    match /scores/{scoreId} {
      // Admin can read all scores
      // Students can read their own scores
      allow read: if isAuthenticated() && 
                     (isAdmin() || resource.data.studentId == request.auth.uid);
      
      // Students can create their own scores
      allow create: if isAuthenticated() && 
                       request.resource.data.studentId == request.auth.uid;
      
      // No one can update scores (they are immutable once created)
      allow update: if false;
      
      // Only admin can delete scores
      allow delete: if isAdmin();
    }
  }
}
```

## Rule Explanation

### Users Collection
- **Read**: Users can read their own profile; admin can read all profiles
- **Create**: Users can only create student accounts during signup
- **Update**: Users can update their own profile
- **Delete**: Only admin can delete user accounts

### Assignments Collection
- **Read**: All authenticated users can view assignments and quizzes
- **Create/Update/Delete**: Only the admin (franceetude@gmail.com) can manage assignments

### Scores Collection
- **Read**: Admin can view all scores; students can only view their own scores
- **Create**: Students can submit their own scores
- **Update**: Scores are immutable once created (prevents cheating)
- **Delete**: Only admin can delete scores

## Important Notes

1. The admin email is hardcoded as `franceetude@gmail.com` in both the rules and the application
2. All users who sign up through the application are automatically assigned the 'student' role
3. Scores cannot be modified after submission to maintain integrity
4. Make sure to replace the Firebase configuration in `/firebase.ts` with your actual project credentials

## Testing the Rules

After applying these rules, test them by:

1. Creating a student account and trying to access admin features (should be denied)
2. Logging in as admin and verifying you can create assignments
3. As a student, submit an assignment and verify the score is saved
4. Try to view another student's scores (should be denied)
5. Verify students can only attempt each assignment once

## Firebase Configuration

Don't forget to update your Firebase configuration in `/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

You can find these values in your Firebase Console under Project Settings > General > Your apps.
