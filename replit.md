# Hash Utility Application

## Overview

This is a full-stack hash utility application built with React, Express, and PostgreSQL. The application provides cryptographic hash generation, comparison, and lookup capabilities through a modern web interface. It supports multiple hash algorithms including MD5, SHA-1, SHA-256, SHA-512, and bcrypt.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Library**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Authentication**: Session-based with bcrypt for password hashing
- **File Uploads**: Multer for handling multipart form data
- **Development**: Hot reload with Vite integration for seamless development

### Database Schema
- **hash_operations**: Stores hash generation operations with input text/file info and results
- **hash_lookups**: Stores hash lookup attempts with original values if found
- **users**: Basic user management with username/password authentication

## Key Components

### Core Features
1. **Hash Generation**: Support for MD5, SHA-1, SHA-256, SHA-512, and bcrypt algorithms
2. **Hash Comparison**: Real-time comparison of two hash values
3. **Hash Lookup**: Search for original values in the database
4. **File Hashing**: Support for hashing uploaded files
5. **Results Storage**: Persistent storage of hash operations and lookups

### UI Components
- **HashGenerator**: Main interface for text and file hash generation
- **HashResults**: Display generated hashes with copy functionality
- **HashComparison**: Side-by-side hash comparison tool
- **HashLookup**: Search interface for hash reverse lookup

### Storage Layer
- **Production**: Drizzle ORM with PostgreSQL for persistent data storage
- **Development**: In-memory storage implementation for rapid prototyping
- **Interface**: Abstracted storage interface allowing easy switching between implementations

## Data Flow

1. **Hash Generation**: User input → Hash algorithms → Database storage → Results display
2. **Hash Lookup**: Hash input → Database search → Results with original value if found
3. **Hash Comparison**: Two hash inputs → Real-time comparison → Match/no-match indication
4. **File Processing**: File upload → Hash generation → Storage → Results display

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database connection
- **bcrypt**: Secure password hashing
- **multer**: File upload handling
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **wouter**: Lightweight routing

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Modern icon library
- **class-variance-authority**: Type-safe variant API for styling

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds optimized static assets to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Database**: Drizzle migrations managed via `drizzle-kit`

### Environment Configuration
- **Database**: Requires `DATABASE_URL` environment variable
- **Production**: Single-process deployment with static file serving
- **Development**: Hot reload with Vite dev server integration

### Scripts
- `dev`: Development server with hot reload
- `build`: Production build for both frontend and backend
- `start`: Production server startup
- `db:push`: Database schema synchronization

The application follows a modern full-stack architecture with clear separation of concerns, type safety throughout, and a focus on developer experience with hot reload and comprehensive tooling.