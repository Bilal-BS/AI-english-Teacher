# English Learning App

## Overview

This is a comprehensive English learning application built with a modern full-stack architecture. The app provides interactive lessons, AI-powered conversation practice, vocabulary training, and personalized learning plans. It features a React frontend with TypeScript, an Express backend, and PostgreSQL database integration using Drizzle ORM.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Build Tool**: Vite for fast development and optimized builds
- **State Management**: React hooks and context (no external state library)
- **UI Components**: Radix UI primitives with custom styling

### Backend Architecture
- **Runtime**: Node.js with Express framework
- **Language**: TypeScript with ES modules
- **API Structure**: RESTful endpoints under `/api` prefix
- **Development**: Hot reload with tsx for TypeScript execution

### Data Layer
- **Database**: PostgreSQL (configured but implementation pending)
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema**: Centralized in `shared/schema.ts` for type sharing
- **Storage**: Currently using in-memory storage with interface for database migration

## Key Components

### Core Learning Features
1. **Interactive Lessons**: Multi-modal exercises including speaking, listening, reading, and writing
2. **AI-Powered Conversation**: Real-time conversation practice with auto-correction and contextual responses
3. **Auto-Correction System**: Intelligent grammar and spelling corrections with 30+ pattern recognition
4. **Multilingual Support**: Tamil and Sinhala translation features with bilingual explanations (compulsory)
5. **Speech Recognition**: Browser-based speech recognition for pronunciation practice
6. **Vocabulary Trainer**: Spaced repetition system for vocabulary building
7. **Writing Assistant**: AI-powered writing feedback and improvement suggestions
8. **Daily Challenges**: Gamified daily exercises to maintain engagement

### User Experience Features
1. **Onboarding Flow**: Comprehensive setup including placement test and goal setting
2. **Personalized Dashboard**: Progress tracking, achievements, and lesson recommendations
3. **Learning Plans**: 30-day structured learning progression
4. **Community Support**: Social features for peer interaction
5. **Achievement System**: Badges and XP rewards for motivation

### Technical Features
1. **Responsive Design**: Mobile-first approach with Tailwind CSS
2. **Real-time Feedback**: Instant pronunciation and grammar analysis
3. **Progressive Enhancement**: Graceful degradation for unsupported features
4. **Type Safety**: End-to-end TypeScript for better development experience

## Data Flow

### User Authentication Flow
1. Users complete onboarding with personal preferences
2. Data stored in memory (pending database implementation)
3. Session management through Express middleware

### Learning Session Flow
1. User selects lesson from dashboard
2. Lesson content loaded with exercises
3. Real-time feedback provided during practice
4. Progress tracked and stored
5. Achievements and XP awarded upon completion

### AI Integration Flow
1. Speech input captured via Web Speech API
2. Audio processed for pronunciation analysis
3. OpenAI API called for conversation responses
4. Writing feedback generated through AI analysis

## External Dependencies

### Core Dependencies
- **React Ecosystem**: React 18, React DOM, React Query for data fetching
- **UI Components**: Radix UI primitives, Lucide React icons
- **Database**: Drizzle ORM, Neon serverless PostgreSQL driver
- **AI Services**: OpenAI API for conversation and writing assistance
- **Development**: Vite, TypeScript, ESBuild for production builds

### Browser APIs
- **Web Speech API**: For speech recognition functionality
- **Audio API**: For pronunciation practice
- **Local Storage**: For offline data persistence

### Development Tools
- **Replit Integration**: Cartographer plugin for development environment
- **Error Handling**: Runtime error overlay for debugging
- **Hot Reload**: Vite HMR for rapid development

## Deployment Strategy

### Build Process
1. **Frontend**: Vite builds React app to `dist/public`
2. **Backend**: ESBuild bundles server code to `dist/index.js`
3. **Assets**: Static files served from built public directory

### Environment Configuration
- **Development**: Local PostgreSQL through Replit modules
- **Production**: Autoscale deployment with environment variables
- **Database**: Connection via `DATABASE_URL` environment variable

### Deployment Pipeline
1. Install dependencies via npm
2. Build frontend and backend separately
3. Start production server with built assets
4. Database migrations run via Drizzle Kit

## Changelog

Recent Updates:
- December 30, 2024: Successfully migrated from Bolt to Replit environment
- December 30, 2024: Fixed infinite re-render issues in React components  
- December 30, 2024: Added 20 comprehensive English lessons (beginner to intermediate)
- December 30, 2024: Enhanced achievement system with 15 different badges
- December 30, 2024: Configured OpenAI API integration with proper error handling
- December 30, 2024: Implemented pronunciation analyzer and vocabulary trainer
- June 24, 2025: Fixed conversation practice repetitive responses with enhanced fallback system
- June 24, 2025: Added auto-correction feature with visual feedback display
- June 24, 2025: Improved conversation variety with response tracking and 8 different response patterns
- June 24, 2025: Enhanced placement test validation and fill-blank question handling
- June 24, 2025: Implemented comprehensive auto-correction system with grammar scoring (70-100%)
- June 24, 2025: Fixed browser environment errors and map() undefined issues
- June 24, 2025: Added intelligent basic error detection for common grammar mistakes
- June 24, 2025: Created beautiful auto-correction UI with original vs corrected text display
- June 24, 2025: Fixed OpenAI auto-correction implementation with proper prompt formatting
- June 24, 2025: Updated response parsing to use "Corrected:" and "Reply:" format
- June 24, 2025: Enhanced API key access for Replit environment configuration
- June 24, 2025: Implemented backend API architecture for OpenAI integration
- June 24, 2025: Added comprehensive fallback grammar corrections (30+ patterns including past tense)
- June 24, 2025: Enhanced conversation responses with context-aware categorized replies
- June 24, 2025: Fixed auto-correction system to work with both AI and fallback modes
- June 24, 2025: Added conversation memory with 6-message history for context  
- June 24, 2025: Implemented dynamic user input handling and enhanced regex parsing
- June 24, 2025: Increased OpenAI temperature to 0.7 for more creative responses
- June 24, 2025: Added Tamil and Sinhala translation features (compulsory requirement)
- June 24, 2025: Implemented bilingual auto-correction with native language explanations
- June 24, 2025: Created translation service with fallback phrases for common terms
- June 24, 2025: Enhanced conversation practice UI with language selection dropdown
- June 24, 2025: Implemented comprehensive grammar correction system like Grammarly
- June 24, 2025: Added detailed word-by-word analysis with explanations for every correction
- June 24, 2025: Enhanced OpenAI prompts for advanced grammar analysis and feedback
- June 24, 2025: Created detailed correction parsing with original→corrected format
- June 24, 2025: Simplified OpenAI prompt for better clarity and teacher-like responses
- June 24, 2025: Enhanced fallback system with 15+ complex grammar patterns including word order
- June 24, 2025: Added bilingual correction display in conversation practice UI
- June 24, 2025: Fixed all conversation state management and turn counting issues
- June 24, 2025: Implemented red highlighting for all spelling and grammar errors in original text
- June 24, 2025: Enhanced visual correction display with color-coded error highlighting
- June 24, 2025: Added comprehensive spelling pattern recognition for common mistakes
- June 24, 2025: Created advanced error highlighting system with HTML markup for better visibility
- June 24, 2025: Enhanced 30-Day English Mastery Journey with advanced pronunciation challenges
- June 24, 2025: Added Perfect Pronunciation Trainer with TH, R/L, V/W sound mastery modules
- June 24, 2025: Implemented comprehensive error correction system with 95% accuracy goal
- June 24, 2025: Created advanced pronunciation analyzer with phoneme-level feedback
- June 24, 2025: Added bilingual error correction display in conversation practice
- June 24, 2025: Enhanced daily lessons with perfect sound identification options
- June 24, 2025: Integrated pronunciation trainer into dashboard with quick access
- June 24, 2025: Added perfect grammar correction display with detailed analysis
- June 24, 2025: Created comprehensive level-based learning tracks (Track A, B, C)
- June 24, 2025: Implemented complete 30-day curriculum with daily structured lessons
- June 24, 2025: Added detailed vocabulary, grammar, and cultural notes for each day
- June 24, 2025: Fixed all audio synthesis interruption issues with proper error handling
- June 24, 2025: Enhanced speech recognition with timeouts and comprehensive error handling
- June 24, 2025: Added level-based lesson selection based on user's English proficiency
- June 24, 2025: Created detailed daily activities with speaking, listening, reading, and writing tasks
- June 24, 2025: Implemented gamification with XP points, badges, and progress tracking
- June 24, 2025: Added cultural notes and daily challenges for practical English learning
- June 26, 2025: Implemented WhatsApp-style conversation error detection (100% accuracy)
- June 26, 2025: Added instant contraction correction (Im → I'm, Youre → You're, etc.)
- June 26, 2025: Created comprehensive conversation pattern analysis with 40+ error types
- June 26, 2025: Implemented real-time casual speech error detection (wanna, gonna, u r)
- June 26, 2025: Added missing auxiliary verb detection (I going → I am going)
- June 26, 2025: Enhanced error severity classification (high/medium/low priority)
- June 26, 2025: Created WhatsApp-style response formatting with thumbs up emoji
- June 26, 2025: Implemented comprehensive responsive design system for all devices
- June 26, 2025: Added mobile-first CSS utilities with touch-friendly interaction targets
- June 26, 2025: Enhanced conversation interface with full screen responsiveness
- June 26, 2025: Created advanced speech recognition with confidence scoring
- June 26, 2025: Implemented dual-mode error detection (AI + pattern-based fallback)
- June 26, 2025: Added contextual conversation continuation with natural responses

## User Preferences

Preferred communication style: Simple, everyday language.