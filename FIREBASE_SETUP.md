# FrancÉtude - Firebase Setup Guide

## Critical Firebase Configuration Steps

### 1. Enable Email/Password Authentication

1. Go to **Firebase Console** → Your project → **Authentication**
2. Click on **Sign-in method** tab
3. Enable **Email/Password**:
   - Click on "Email/Password"
   - Toggle "Enable" to ON
   - Click "Save"

### 2. Password Reset Emails

For password reset emails to work, you need to ensure:

1. **Email provider is verified**:
   - Go to **Authentication** → **Templates**
   - Check if "Password reset" template is enabled
   - Customize the email template if desired (optional)

2. **Important Note about Password Reset**:
   - Password reset emails will ONLY be sent if the email address exists in Firebase Authentication
   - If you're testing with an email that doesn't have an account, you'll get an error
   - This is a security feature to prevent email enumeration attacks

3. **Check Spam Folder**:
   - Firebase emails sometimes go to spam
   - Tell users to check their spam folder

### 3. Create Admin Account

To create the admin account (`franceetude@gmail.com`):

**Option A: Using Firebase Console (Recommended)**
1. Go to **Authentication** → **Users**
2. Click "Add user"
3. Enter email: `franceetude@gmail.com`
4. Enter password: (your chosen password)
5. Click "Add user"
6. **Important**: Now you need to create the admin document in Firestore:
   - Go to **Firestore Database**
   - Create a collection called `users` (if it doesn't exist)
   - Add a document with ID = the user's UID (copied from Authentication)
   - Add fields:
     - `email`: "franceetude@gmail.com"
     - `name`: "Administrator"
     - `role`: "admin"
     - `createdAt`: (current date)

**Option B: Sign Up Through the App**
1. Go to your app's signup page
2. Sign up with `franceetude@gmail.com`
3. After signup, manually update the user in Firestore:
   - Go to **Firestore Database** → `users` collection
   - Find the document with the user's UID
   - Change `role` from "student" to "admin"

### 4. Firestore Rules Deployment

1. Go to **Firestore Database** → **Rules**
2. Copy the entire content from `firestore.rules` in your project
3. Paste into the Firebase Console rules editor
4. Click **Publish**

### 5. Common Issues and Solutions

#### Issue: "Invalid email or password" error
**Solution**: 
- Verify the email exists in Authentication → Users
- Reset the password if needed
- Make sure Email/Password sign-in is enabled

#### Issue: Password reset email not received
**Solutions**:
1. Check if the email exists in Firebase Authentication
2. Check spam/junk folder
3. Wait up to 5 minutes for email delivery
4. Verify your Firebase project's email quota hasn't been exceeded

#### Issue: "Firebase error" on login
**Solutions**:
1. Check browser console for specific error messages
2. Verify Firebase configuration in `src/firebase.ts` matches your project
3. Ensure Email/Password authentication is enabled
4. Clear browser cache and cookies

#### Issue: Admin features not working
**Solutions**:
1. Verify the admin user has `role: 'admin'` in Firestore
2. Check that the admin email is exactly `franceetude@gmail.com`
3. Verify Firestore rules are published correctly

### 6. Testing Checklist

- [ ] Email/Password authentication is enabled
- [ ] Admin account created in Firebase Authentication
- [ ] Admin user document exists in Firestore with `role: 'admin'`
- [ ] Firestore rules are published
- [ ] Can login as admin successfully
- [ ] Can create student account
- [ ] Student account has correct semester
- [ ] Password reset works for existing emails
- [ ] Can create assignments/quizzes as admin
- [ ] Students can see assignments for their semester
- [ ] French Course feature is accessible

### 7. Email Customization (Optional)

To customize the password reset email:

1. Go to **Authentication** → **Templates**
2. Select "Password reset"
3. Customize:
   - Subject line
   - Email body (HTML supported)
   - Sender name
4. Click "Save"

### 8. Production Checklist

Before deploying to production:

1. **Enable production mode** in Firebase
2. **Update authorized domains** in Authentication settings
3. **Set up custom email templates** for branding
4. **Test all authentication flows**
5. **Review Firestore security rules**
6. **Enable Firebase App Hosting** (if using)

## Quick Start Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Support

If you continue to experience issues:
1. Check the browser console for error messages
2. Check Firebase Console → Authentication → Users to verify accounts exist
3. Verify Firestore rules are correctly applied
4. Try clearing browser cache and cookies
