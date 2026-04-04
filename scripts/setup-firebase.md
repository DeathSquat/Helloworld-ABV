# Firebase Setup Instructions

## Prerequisites
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login to Firebase: `firebase login`

## Setup Steps

### 1. Initialize Firebase Project
```bash
firebase init
```

When prompted:
- Select "Firestore" and "Hosting" (optional)
- Choose "Use an existing project" and select "helloworld-2756c"
- Select "firestore.rules" for rules file location
- Select "firestore.indexes.json" for indexes file location

### 2. Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

### 3. Deploy Database Indexes (if needed)
```bash
firebase deploy --only firestore:indexes
```

### 4. Verify Configuration
Check that your `firebase.json` looks like this:
```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
}
```

## Role-Based Access Control

The system now supports three roles:
- **Student**: Default role, can access learning content
- **Teacher**: Can monitor student progress and create content
- **Admin**: Full system access, can manage users and settings

## Security Rules Summary

- Users can only read/write their own data
- Admins can read/write all user data
- Role changes can only be made by admins
- Proper authentication required for all operations

## Testing the Setup

1. Create a test account with each role
2. Verify role-based routing works correctly
3. Test admin dashboard functionality
4. Confirm Firestore rules are working

## Environment Variables

Make sure your `.env.local` contains:
```
VITE_FIREBASE_API_KEY=AIzaSyBV5kBeO0yJvYvBw7T8uqrAufqXEDUqduc
VITE_FIREBASE_AUTH_DOMAIN=helloworld-2756c.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=helloworld-2756c
VITE_FIREBASE_STORAGE_BUCKET=helloworld-2756c.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=48391307034
VITE_FIREBASE_APP_ID=1:48391307034:web:f2568326156cd4520176a3
VITE_FIREBASE_MEASUREMENT_ID=G-GYCDJEHYCT
```

Note: The Firebase config in `src/utils/firebase.ts` is already updated with the new credentials.
