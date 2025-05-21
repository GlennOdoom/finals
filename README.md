
🌍 Twi Science LMS - An Intelligent Web-Based Science Learning Platform in Twi 🧪


Author: Glenn Bartels Odoom  
Institution: Ashesi University  
Degree Program: BSc Computer Science (2025)  

GitHub Repository:  
https://github.com/GlennOdoom/finals

📝 PROJECT DESCRIPTION

Twi Science LMS is an intelligent educational web platform designed to address 
the challenge of teaching science in English to Ghanaian primary and junior high 
school students who primarily speak Twi. By leveraging modern web technologies and 
machine learning models, this platform provides a comprehensive solution for 
translating scientific concepts into Twi and presenting them in a way that is both 
culturally relevant and pedagogically effective.

Developed as part of a final year applied project, the platform targets 
learners in Grades 4–12 and seeks to improve comprehension and retention through 
bilingual delivery, interactive learning tools, and student-teacher collaboration.


✨ FEATURES
**🔄 Real-Time Scientific Translation**
The platform automatically translates scientific terms and content from English to Twi 
using a trained neural machine translation model (Hugging Face M2M100). The system 
supports caching of frequent terms for faster translation and consistent terminology.

**📚 Curriculum-Aligned Science Lessons**
All content is carefully mapped to Ghana Education Service's science syllabus, ensuring 
educational relevance. Lessons incorporate multimedia content including text, images, 
and videos to enhance understanding through multiple learning modalities.

**📝 Interactive Quizzes**
The system features integrated quizzes with real-time feedback and automatic scoring
to facilitate self-assessment. Students can identify learning gaps while teachers 
gain insights into class performance and individual student needs.

**📊 Student Progress Dashboard**
Comprehensive analytics based on quiz scores and lesson completion rates help both 
students and teachers monitor academic progress. Visual representations of data make 
it easy to track improvement and identify areas needing additional focus.

**👨‍🏫 Teacher/Admin Tools**
The admin dashboard enables efficient management of users, lessons, and system data.
Teachers can create, update, or delete content, track student engagement, and 
customize learning paths according to classroom needs.

**🔤 Bilingual Learning Mode**
Students can seamlessly switch between Twi and English for any lesson, enhancing 
vocabulary development and bridging language barriers. This parallel presentation 
reinforces concepts in both languages simultaneously.

**💬 Community Forum**
The platform includes dedicated space for students and teachers to interact and 
discuss topics, encouraging peer learning and engagement. Moderated discussions 
ensure appropriate and helpful discourse.

**🔐 Secure Authentication**
Role-based access via Firebase Auth provides appropriate permissions for students, 
teachers, administrators, and linguists, ensuring data security and proper 
access control throughout the system.

🏗️ SYSTEM ARCHITECTURE

Twi Science LMS is structured around a modular, scalable architecture:

**🖥️ Frontend**
The user interface is built with React and TypeScript, implementing a Single Page 
Application (SPA) for fast, seamless user interaction. The interface employs Tailwind 
CSS with responsive design principles to ensure accessibility across devices of 
varying screen sizes.

**⚙️ Backend Services**
Core functionality is powered by Firebase Cloud Functions handling authentication, 
quiz scoring, translation requests, and logging. This serverless architecture 
enables efficient scaling and reduces maintenance overhead.

**🗄️ Database**
User data and educational content are stored in Firestore (NoSQL) and Firebase 
Realtime Database. The system follows a structured document-based schema designed 
for easy scaling and efficient querying as the user base grows.

**🔠 Translation Engine**
At the heart of the platform is Hugging Face's M2M100 multilingual model for 
real-time English-Twi translation. This advanced neural machine translation system 
provides accurate scientific terminology translations with context awareness.

**🚀 Deployment**
The application uses Firebase Hosting with CLI tools for primary deployment, 
with compatibility for Vercel and Netlify as alternative static site deployment options.


💻 SYSTEM REQUIREMENTS
To install and run the system locally, ensure you have the following:

Node.js (v16 or newer)
npm (Node Package Manager)
Git
Firebase CLI (npm install -g firebase-tools)
Internet connection for fetching model APIs
Modern Web Browser (e.g., Chrome, Firefox)

🔧 INSTALLATION INSTRUCTIONS (LOCAL DEVELOPMENT)

1. Clone the GitHub repository:

git clone https://github.com/GlennOdoom/finals.git
cd finals

2. Install the required dependencies:

npm install

3. Create a .env file in the root folder and add your Firebase credentials:

VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

4. Start the development server:

npm run dev

Visit http://localhost:5173 in your browser to begin using the application.


👩‍💻 USAGE

**👨‍🎓 Student Experience**
Students log in to access lessons in Twi and English, take quizzes, and track their 
progress through the curriculum. The intuitive dashboard presents upcoming lessons, 
completed work, and performance metrics in a clear, engaging format.

**👩‍🏫 Teacher Functions**
Teachers can upload and edit lessons, view student analytics, and manage class 
discussions. The content management system allows for customization of materials 
to suit specific classroom needs while maintaining curriculum alignment.

**👨‍💼 Administrator Controls**
System administrators manage user accounts, oversee content integrity, and monitor 
platform usage statistics. The admin panel provides comprehensive tools for 
maintaining the educational ecosystem and ensuring quality standards.

**🗣️ Linguist Support**
Language specialists can review and moderate Twi translations for accuracy, 
cultural relevance, and educational clarity. This oversight ensures that scientific 
concepts are correctly represented in both languages.

🧮 ALGORITHMS

**🔄 Translation Algorithm**
Text is tokenized and passed to the Hugging Face API (facebook/m2m100_418M). The 
model processes the input considering context and scientific terminology. Translated 
output is returned in Twi and cached to avoid repetitive processing of common terms.

**📊 Quiz Scoring & Analytics**
The system evaluates multiple-choice responses in real-time using comparison algorithms. 
Firebase logs each attempt and aggregates scores to show performance trends over time. 
Statistical analysis highlights strengths and weaknesses in student understanding.

**📈 Student Performance Tracking**
The platform implements client-side chart libraries to visualize student progress 
through multidimensional metrics. The tracking system monitors scores, participation 
frequency, and quiz success rates to generate comprehensive learning profiles.

🛠️ TECHNOLOGIES USED

**⚛️ Frontend Development**
React.js and TypeScript form the foundation of the user interface, with Vite providing 
optimized build processes. Tailwind CSS handles styling with consistent design patterns, 
while Chart.js creates data visualizations for student analytics.

**🔥 Backend Infrastructure**
Firebase Authentication secures user access across different permission levels. Firestore 
Database stores and retrieves educational content and user information. Firebase Functions 
implement API layers for server-side operations without dedicated server management.

**🌐 Translation & NLP**
Hugging Face Transformers API (M2M100 model) powers the multilingual capabilities of 
the platform. Axios facilitates HTTP requests between the frontend and translation services 
with efficient error handling and response processing.

**🚀 Development & Deployment**
Git and GitHub enable version control and collaborative development. Firebase Hosting, 
Vercel, and Netlify provide flexible deployment options. Firebase CLI streamlines 
project configuration and updates across environments.

**🧪 Testing Infrastructure**
Jest handles unit testing of individual components and functions. React Testing Library 
verifies user interface behavior and rendering. Cypress conducts end-to-end testing to 
ensure complete system functionality.


🚀 DEPLOYMENT INSTRUCTIONS

To deploy to Firebase Hosting:

1. Build the production version of the app:

npm run build

2. Install Firebase CLI and login:

npm install -g firebase-tools
firebase login

3. Initialize Firebase:

firebase init

# Choose "Hosting"
# Set public directory to "dist"
# Configure as a single-page app (yes)

4. Deploy:

firebase deploy

Alternative: Upload the dist/ folder to Netlify or Vercel for static hosting.


🔒 FIREBASE SECURITY RULES (RECOMMENDED)

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /courses/{courseId} {
      allow read: if true;
      allow write: if request.auth.token.role == "admin";
    }

    match /lessons/{lessonId} {
      allow read: if true;
      allow write: if request.auth.token.role == "admin";
    }

    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}

📚 INCLUDED DOCUMENTATION

README.txt               : This file with setup and deployment instructions
lessonService.ts         : Manages lesson creation and updates
TranslationService.ts    : Integrates Hugging Face model API
LessonView.tsx           : UI component for displaying lesson content
CourseManagement.tsx     : Teacher/admin interface for lesson control
Forum.tsx                : Community discussion interface

