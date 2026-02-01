<p align="center">
  <img width="128" height="128" src="images/logo.webp" alt="TinyStation">
</p>

# TinyStation

[![License: AGPL-3.0+](https://img.shields.io/badge/License-AGPL--3.0%2B-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev/)
[![Fastify](https://img.shields.io/badge/Fastify-5-23D5.svg)](https://fastify.dev/)

> TinyStation is an open-source web radio application that combines live audio streaming with real-time chat functionality.

## ✨ Highlights

- Live Icecast audio streaming with real-time metadata
- Real-time chat
- Automatic email notifications when the stream goes live
- Minimal, sleek, and easy-to-use interface

## 📋 Overview

TinyStation is an open-source web radio app that lets you tune in to a single live station and chat with other listeners in real time. Users can register and log in to join the community, listen to the stream, and participate in the conversation; all from a single, simple interface, and it’s completely self-hosted.

## ⚡ Quick Start (local)

Run Redis, Icecast services.

```bash
cp .env .env.local
# Edit .env.local

# Install dependencies
pnpm install

# Start development servers
pnpm run server:dev   # Backend (Fastify + Socket.IO)
pnpm run frontend:dev # Frontend (React + Vite)

# Or run everything
pnpm run start
```

## 🚀 Deployment

TBD...

## 📦 Packages

| Package                                          | Description                                      |
| ------------------------------------------------ | ------------------------------------------------ |
| [`@tiny-station/frontend`](./packages/frontend/) | React application with chat UI and stream player |
| [`@tiny-station/server`](./packages/server/)     | Fastify backend with Socket.IO and REST APIs     |
| [`@tiny-station/common`](./packages/common/)     | Shared types and utilities                       |

## 🛠️ Development

```bash
# Lint and format
pnpm run lint
pnpm run lint:fix
pnpm run format

# Type checking
pnpm run ts:check

# Testing
pnpm run test              # All packages
pnpm run test:common       # Common package only
pnpm run test:frontend     # Frontend only
pnpm run test:server       # Server only
pnpm run test:watch        # Watch mode
```

## 🤝 Contributing

Found a bug or have a feature idea? Head over to the [Issues](https://github.com/buzz/tiny-station/issues) page and let us know.

*Contributions are welcome. Feel free to fork and submit PRs.*

## 📄 License

AGPL-3.0-or-later. See [LICENSE.txt](./LICENSE.txt) for details.
