# WhatsOrder - Mobile Order Form Application

## Overview
WhatsOrder is a Capacitor-based mobile application built with Next.js 15, React 19, and Firebase. It allows businesses to create custom order forms that customers can access to place orders via WhatsApp.

## Project Type
- **Primary Platform**: Android APK (Capacitor mobile app)
- **Web Version**: Next.js web application (can run on Replit)
- **Framework**: Next.js 15 with App Router
- **UI**: React 19 with Tailwind CSS
- **Backend**: Firebase (Firestore, Authentication, Storage)

## Recent Changes (October 4, 2025)
- Fixed Next.js 15 async params compatibility issue in `src/app/preview/[slug]/page.tsx`
- Updated package.json scripts to bind to 0.0.0.0:5000 for Replit compatibility
- Added TypeScript type annotation to webpack config in next.config.ts
- Updated .gitignore to exclude Replit-specific directories
- All TypeScript errors resolved, build verified successful

## Project Structure
- `/src/app/` - Next.js App Router pages
- `/src/components/` - Reusable React components
- `/src/lib/` - Firebase configuration and utilities
- `/src/hooks/` - Custom React hooks
- `/android/` - Android native project
- `/twa-whatsorder/` - Trusted Web Activity configuration

## Firebase Configuration Required
The app requires these environment variables:
- NEXT_PUBLIC_FIREBASE_API_KEY
- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
- NEXT_PUBLIC_FIREBASE_PROJECT_ID
- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
- NEXT_PUBLIC_FIREBASE_APP_ID

## Key Features
- Create and manage order forms
- QR code generation for sharing
- WhatsApp integration for order placement
- Firebase authentication (anonymous)
- Real-time order tracking
- Capacitor native features (camera, geolocation, notifications, etc.)

## Build Commands
- `npm run dev` - Run development server on port 5000
- `npm run build` - Build Next.js production bundle
- `npm start` - Start production server on port 5000
- Build scripts for Android APK are in `/build-android.sh` and `/build-twa.sh`

## Architecture Notes
- Uses Next.js 15 App Router with async params (breaking change from Next.js 14)
- Client/server component separation for proper hydration
- Firebase services initialized with singleton pattern to prevent re-initialization
- Capacitor integration for native mobile features
