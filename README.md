# Hello World - Learning Platform

A comprehensive learning platform designed to help students master coding skills through personalized roadmaps, progress tracking, and interactive learning experiences.

## 🚀 Tech Stack Used

### Frontend Technologies
- **React 18.3.1** - Modern React framework for building user interfaces
- **TypeScript 5.8.3** - Type-safe JavaScript development
- **Vite 5.4.19** - Fast build tool and development server
- **React Router DOM 6.30.1** - Client-side routing

### UI Components & Styling
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **shadcn/ui** - Modern, accessible component library built on Radix UI
- **Radix UI Components** - Comprehensive set of accessible UI primitives
- **Lucide React 0.462.0** - Beautiful icon library
- **next-themes 0.3.0** - Theme management (light/dark/system)

### Backend & Database
- **Firebase 12.6.0** - Backend-as-a-Service platform
  - Firebase Authentication - User authentication & authorization
  - Cloud Firestore - NoSQL document database
  - Firebase Security Rules - Database access control
- **Firebase Data Connect** - Generated type-safe client SDK

### State Management & Data Fetching
- **TanStack React Query 5.83.0** - Server state management and caching
- **React Hook Form 7.61.1** - Form state management with validation
- **Zod 3.25.76** - TypeScript-first schema validation

### Development Tools
- **ESLint 9.32.0** - Code linting and formatting
- **PostCSS 8.5.6** - CSS transformation pipeline
- **Autoprefixer 10.4.21** - CSS vendor prefixing

### Deployment
- **Vercel** - Frontend deployment platform
- **Firebase Hosting** - Static site hosting

## 🛠 How to Run the Project

### Prerequisites
- Node.js (v18 or higher)
- npm, yarn, or bun package manager
- Firebase project configuration

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Helloworld-ABV
   ```

2. **Install dependencies**
   ```bash
   # Using npm
   npm install
   
   # Using yarn
   yarn install
   
   # Using bun
   bun install
   ```

3. **Firebase Configuration**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password method)
   - Set up Cloud Firestore database
   - Create a `.env` file in the root directory with your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Firebase Security Rules**
   - Deploy the included Firestore rules from `firestore.rules`
   - Set up database indexes from `firestore.indexes.json`

5. **Start Development Server**
   ```bash
   # Using npm
   npm run dev
   
   # Using yarn
   yarn dev
   
   # Using bun
   bun dev
   ```

6. **Open in Browser**
   - Navigate to `http://localhost:8080`
   - The application will automatically reload when you make changes

### Available Scripts

- `npm run dev` - Start development server (Vite)
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality

### Project Structure

```
src/
├── components/          # Reusable UI components
│   └── ui/             # shadcn/ui components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── integrations/       # Third-party integrations
│   └── firebase/       # Firebase client configuration
├── lib/                # Utility libraries
├── utils/              # Helper functions
└── types/              # TypeScript type definitions
```

### Features

- **User Authentication**: Email/password login with role-based access (Student, Teacher, Admin)
- **Personalized Learning Roadmaps**: Structured learning paths with phases and content
- **Progress Tracking**: Comprehensive progress monitoring with XP system
- **Interactive Dashboard**: Role-specific dashboards for different user types
- **Course Management**: Video content, Coursera integration, and project-based learning
- **Achievement System**: Gamification elements with badges and rewards
- **Leaderboard**: Competitive learning environment with rankings
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Dark Mode Support**: Theme switching between light, dark, and system preferences

### Environment Variables

Create a `.env` file in the root directory:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Optional: Additional configuration
VITE_APP_NAME="Hello World Learning Platform"
VITE_APP_VERSION="1.0.0"
```

### Deployment

#### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

#### Firebase Hosting
```bash
# Build the project
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### License

This project is licensed under the MIT License - see the LICENSE file for details.

### Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team

---

**Built with ❤️ by Nishchay Chaurasia and Jagriti Kumari**