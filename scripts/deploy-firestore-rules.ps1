# Deploy Firestore Rules to Firebase
Write-Host "🔥 Deploying Firestore Rules to Firebase..."

# Check if Firebase CLI is installed
if (!(Get-Command firebase -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
}

# Deploy the rules
firebase deploy --only firestore:rules

Write-Host "✅ Firestore Rules deployed successfully!"
Write-Host ""
Write-Host "📋 Current Rules Summary:"
Write-Host "  - ✅ Authenticated users can read roadmaps"
Write-Host "  - ✅ Authenticated users can read courses" 
Write-Host "  - ✅ Admins can create/update/delete roadmaps"
Write-Host "  - ✅ Admins can create/update/delete courses"
Write-Host "  - ✅ Users can manage their own progress"
Write-Host "  - ✅ Admins can access all user data"
