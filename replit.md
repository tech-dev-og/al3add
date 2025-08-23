# Overview

This is a full-stack countdown/event tracking application built with modern web technologies. The app allows users to create and manage various types of countdown events (like birthdays, holidays, weddings, etc.) with multilingual support for Arabic and English. It features a Pinterest-style dashboard layout for easy event browsing and creation.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React SPA**: Built with TypeScript and Vite for fast development and optimized builds
- **UI Framework**: Shadcn/ui components with Radix UI primitives for accessibility
- **Styling**: TailwindCSS with custom CSS variables for theming and Islamic design elements
- **State Management**: React Query for server state and React hooks for local state
- **Routing**: React Router for client-side navigation
- **Internationalization**: i18next with React integration for Arabic/English localization
- **RTL Support**: Built-in right-to-left layout support for Arabic users

## Backend Architecture
- **Node.js/Express**: RESTful API server with TypeScript
- **Session Management**: Express sessions with PostgreSQL store
- **Development**: Vite middleware integration for hot reloading in development
- **Error Handling**: Centralized error handling middleware with structured logging

## Database Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect for type-safe database operations  
- **Database**: PostgreSQL with Neon serverless for scalability
- **Schema Management**: Migrations handled through Drizzle Kit
- **Connection Pooling**: Neon serverless pool for efficient database connections

## Authentication & Authorization
- **Authentication**: Supabase Auth for user management
- **Authorization**: Role-based access control with admin/moderator/user roles
- **Session Storage**: PostgreSQL-backed sessions with connect-pg-simple

## Data Models
- **Users**: Profiles with username, display name, avatar, and bio
- **Events**: User-owned events with title, date, type, calculation options, and background images
- **User Roles**: Role assignments for access control
- **Translations**: Dynamic translation management for multilingual content
- **Audit Logs**: Email and image generation tracking for admin oversight

## Client-Server Integration
- **API Communication**: REST endpoints with JSON payloads
- **Real-time Updates**: React Query for optimistic updates and cache management
- **File Handling**: Base64 image storage with localStorage fallback
- **Error Boundaries**: Client-side error handling with toast notifications

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting
- **Supabase**: Backend-as-a-Service for authentication and real-time features

## Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety across frontend and backend
- **Drizzle Kit**: Database schema management and migrations

## UI/UX Libraries
- **Shadcn/ui**: Component library built on Radix UI
- **Radix UI**: Unstyled, accessible UI primitives
- **TailwindCSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **date-fns**: Date manipulation with locale support

## Backend Services
- **Express.js**: Web application framework
- **connect-pg-simple**: PostgreSQL session store
- **ws**: WebSocket support for Neon database

## Frontend State Management
- **TanStack React Query**: Server state management and caching
- **React Hook Form**: Form handling with validation
- **React Router**: Client-side routing

## Internationalization
- **i18next**: Internationalization framework
- **react-i18next**: React bindings for i18next
- **i18next-browser-languagedetector**: Automatic language detection