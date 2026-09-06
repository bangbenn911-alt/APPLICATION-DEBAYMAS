# Corporate Assessment Center

Enterprise Recruitment Assessment Platform built with React, TypeScript, Node.js, Express, and PostgreSQL.

## Features Completed in this release
- **Enterprise Architecture:** Strict modular backend and decoupled React frontend.
- **Role-based Auth:** Secure JWT Authentication (Candidate, Admin, HR).
- **Assessment Engine:** Configurable time limits, section weights, and randomized questions.
- **Dynamic Question Types:**
  - Multiple Choice (Numerical, Verbal, Abstract)
  - Spreadsheet Engine (Custom safe formula parser)
  - Accounting Technical (Journal Entry validation)
- **Scoring Engine:** Automated partial scoring, negative marking, and formula tolerance without using `eval()`.
- **Candidate Portal:** Real-time autosave, server-synced timer, anti-cheat tab warnings.
- **Database:** Full Prisma Schema for Enterprise Data Modeling.

## Tech Stack
- **Frontend:** React 18, Vite, TailwindCSS, Zustand
- **Backend:** Node.js, Express, Prisma, Zod, bcrypt, JWT
- **Database:** PostgreSQL 15

## Requirements
- Node.js >= 18
- Docker Desktop (for Postgres)

## Quick Start (Development)

1. **Start Database via Docker:**
   ```bash
   docker-compose up -d db
