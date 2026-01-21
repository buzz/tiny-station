# Project Context

## Purpose

Icecast streaming listener application with real-time chat functionality, allowing users to listen to live radio streams and interact through an online chat system. Features include stream metadata display, user authentication, real-time message delivery, and email notifications.

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Socket.io-client, FontAwesome
- **Backend**: Node.js, Express, Socket.io, Passport.js (JWT authentication)
- **Data/Session**: Redis (ioredis)
- **Email**: Nodemailer
- **Build Tools**: pnpm workspaces, Yarn (in Docker), TypeScript, ESLint, Prettier
- **Deployment**: Docker, pm2

## Project Conventions

### Code Style

- Single quotes, no semicolons
- Trailing commas on all multi-line objects/arrays
- Print width: 100 characters
- End of line: LF
- Airbnb-style ESLint configuration with Prettier integration
- Module-based imports (import from './module.js')

### Architecture Patterns

- Monorepo using pnpm workspaces with separate frontend and server packages
- React Context API for state management (UserContext, ChatContext, ModalContext, StreamInfoContext, SocketIOContext)
- Server-side Socket.io event handlers (StreamInfoDispatcher, ChatManager, UserManager)
- Express middleware for authentication (Passport.js JWT strategy)
- Redis for session/user management and possibly shared state

### Testing Strategy

- No testing configuration present yet; current development workflow includes:
  - Linting via ESLint
  - TypeScript type checking via tsc
  - Code formatting with Prettier

### Git Workflow

- Monorepo with pnpm workspaces
- Main packages: frontend and server
- Commit message conventions follow free-form

## Domain Context

- **Icecast**: Open-source streaming media server that serves audio streams
- **Real-time communication**: Socket.io for bidirectional, event-based communication
- **User authentication**: JWT tokens with Passport.js middleware
- **Session management**: Redis-based user session tracking
- **Email verification**: Token-based user registration with email notifications

## Important Constraints

- AGPL-3.0-or-later license
- Frontend supports both Vite build
- Backend uses Node debug logging with debuglog('listen-app')
- Requires Redis server for user management/chat history
- Production deployment uses Docker with non-root user (listen-app)

## External Dependencies

- **Icecast server**: Source of streaming audio data (URL configurable via ICECAST_URL env)
- **Redis**: Required for user session management and potentially state distribution
- **SMTP server**: For email sending (verification tokens, notifications)
