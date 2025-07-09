# Hash Utility Pro - Architecture Overview

## Overview

Hash Utility Pro is a comprehensive cryptographic hash toolkit built as a full-stack web application. It provides users with the ability to generate various types of hashes, perform hash lookups using rainbow tables, validate hash formats, and compare hashes. The application is designed with a modern React frontend and an Express.js backend, utilizing PostgreSQL for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for lightweight client-side routing

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **Authentication**: bcrypt for password hashing
- **File Uploads**: multer for multipart/form-data handling
- **Session Management**: connect-pg-simple for PostgreSQL session storage

### Development Environment
- **Development Server**: Vite dev server with HMR
- **Production Build**: esbuild for server bundling, Vite for client bundling
- **Database Migrations**: Drizzle Kit for schema management
- **Type Safety**: Shared TypeScript schemas between client and server

## Key Components

### Hash Generation Engine
- Supports multiple hash algorithms: MD5, SHA-1, SHA-256, SHA-512, bcrypt
- Handles both text input and file uploads
- Batch processing capabilities for multiple inputs
- Real-time hash generation with progress tracking

### Rainbow Table Service
- Pre-computed hash lookup tables for common passwords
- Comprehensive wordlist with over 1000 common passwords and variations
- Support for multiple hash types in lookups
- Automatic hash type detection

### Hash Validation System
- Format validation for different hash types
- Length and character pattern verification
- Auto-detection of hash algorithms
- Detailed validation feedback

### User Interface Components
- **Hash Generator**: Input forms with algorithm selection
- **Hash Lookup**: Search interface for rainbow table queries
- **Batch Processor**: Bulk hash generation capabilities
- **Hash Validator**: Format verification tools
- **HMAC Generator**: Keyed hash generation
- **History Dashboard**: Operation tracking and statistics

## Data Flow

1. **Hash Generation**: User input → Server processing → Database storage → Result display
2. **Hash Lookup**: Hash input → Rainbow table search → Result with original value (if found)
3. **Batch Processing**: Multiple inputs → Parallel processing → Aggregated results
4. **History Tracking**: All operations logged to database for audit trail

## External Dependencies

### Frontend Dependencies
- **UI Components**: Radix UI primitives for accessible components
- **Form Handling**: React Hook Form with Zod validation
- **Date Handling**: date-fns for timestamp formatting
- **Icons**: Lucide React for consistent iconography
- **Styling**: Tailwind CSS with class-variance-authority

### Backend Dependencies
- **Cryptography**: Node.js crypto module and bcrypt
- **Database**: Drizzle ORM with PostgreSQL adapter
- **Validation**: Zod schemas shared between client and server
- **File Processing**: multer for file upload handling

### Development Dependencies
- **Build Tools**: Vite, esbuild, TypeScript compiler
- **Development**: tsx for TypeScript execution
- **Database Tools**: Drizzle Kit for migrations
- **Replit Integration**: Cartographer plugin for development environment

## Deployment Strategy

### Development Mode
- Vite dev server handles frontend with HMR
- tsx runs TypeScript server directly
- Database migrations run via Drizzle Kit
- Environment variables loaded from .env files

### Production Build
- Frontend: Vite builds optimized React bundle to `dist/public`
- Backend: esbuild bundles server code to `dist/index.js`
- Database: Drizzle migrations ensure schema consistency
- Static assets served by Express in production

### Database Schema
- **hash_operations**: Stores hash generation history
- **hash_lookups**: Tracks rainbow table lookup attempts
- **users**: User authentication and session management
- Timestamps and JSON fields for flexible data storage

### Security Considerations
- Input validation on both client and server
- SQL injection prevention through parameterized queries
- File upload restrictions and validation
- Session-based authentication with secure cookies
- Rate limiting considerations for batch operations

The application is designed to be scalable, maintainable, and secure while providing a comprehensive suite of cryptographic hash utilities for both educational and practical purposes.