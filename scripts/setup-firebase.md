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
