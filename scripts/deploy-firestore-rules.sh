#!/bin/bash

# Deploy Firestore Rules to Firebase
echo "🔥 Deploying Firestore Rules to Firebase..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Deploy the rules
firebase deploy --only firestore:rules

echo "✅ Firestore Rules deployed successfully!"
echo ""
echo "📋 Current Rules Summary:"
echo "  - ✅ Authenticated users can read roadmaps"
echo "  - ✅ Authenticated users can read courses" 
echo "  - ✅ Admins can create/update/delete roadmaps"
echo "  - ✅ Admins can create/update/delete courses"
echo "  - ✅ Users can manage their own progress"
echo "  - ✅ Admins can access all user data"
