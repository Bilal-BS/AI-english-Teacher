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
2. **AI-Powered Conversation**: Real-time conversation practice with OpenAI integration
3. **Speech Recognition**: Browser-based speech recognition for pronunciation practice
4. **Vocabulary Trainer**: Spaced repetition system for vocabulary building
5. **Writing Assistant**: AI-powered writing feedback and improvement suggestions
6. **Daily Challenges**: Gamified daily exercises to maintain engagement

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

## User Preferences

Preferred communication style: Simple, everyday language.