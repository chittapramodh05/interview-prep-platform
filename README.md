# AURA | AI-Powered Interview Coach & Career Assistant Platform

AURA is a production-level, SaaS-style full-stack application designed to help software engineers accelerate their career preparation. Candidates can analyze resumes for ATS optimization, practice technical/behavioral mock interviews with real-time AI feedback, write solutions inside an integrated Monaco code editor arena, and track progress over time.

---

## 🚀 Key Features

1. **Secure JWT Authentication**: Sign up/login with credentials, automated refresh token rotation (via HTTP-only cookies), and Google Sign-In simulation.
2. **ATS Resume Analyzer**: Upload PDF resumes to extract key developer credentials and receive compatibility scores, missing keywords, and improvement tips.
3. **AI Mock Interviews**: Select job position, complexity (Easy/Medium/Hard), and experience profile to run a timed technical/behavioral mock chat evaluated by Gemini models.
4. **Coding Arena**: Integrated Monaco code editor playground. Solve algorithmic problems in JavaScript or Python against an in-memory execution compiler sandbox.
5. **Progress Analytics**: Beautiful dashboard widgets and Recharts visual line metrics representing weekly progress, topics mastery, and career advice.
6. **Admin Panel**: Administrator panel to monitor audit logs, manage users, and add coding problems dynamically.

---

## 🛠 Tech Stack

* **Frontend**: Next.js (App Router, Tailwind CSS, TypeScript, Zustand, Recharts, Framer Motion, Axios, Monaco Editor)
* **Backend**: Node.js (Express.js, TypeScript, Prisma ORM, PDF-Parse, Helmet, Express-Rate-Limit)
* **Database**: PostgreSQL (relational structure with Prisma)
* **DevOps**: Docker, Docker Compose

---

## 📂 Folder Structure

```
├── backend/
│   ├── prisma/             # Schema definition & migrations
│   ├── src/
│   │   ├── config/         # Database clients configuration
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # JWT authentication, Rate limitors
│   │   ├── routes/         # Express endpoint maps
│   │   ├── services/       # Gemini AI service, Sandboxed runners
│   │   ├── utils/          # Standard response JSON helpers
│   │   └── server.ts       # Main app entrypoint
│   └── Dockerfile          # Multi-stage production build config
│
├── frontend/
│   ├── src/
│   │   ├── app/            # Next.js App Router screens & layout
│   │   ├── services/       # Axios API client client config
│   │   └── store/          # Zustand authentication stores
│   └── Dockerfile          # Production next build config
│
└── docker-compose.yml      # Orchestrated DB, Express API, & Next SPA
```

---

## ⚙️ Setup & Installation

### Option 1: Docker Compose (Quickest)

Ensure you have **Docker** and **Docker Compose** installed.

1. Set your `GEMINI_API_KEY` (optional) in your environment variables.
2. Run from the root directory:
   ```bash
   docker-compose up --build
   ```
3. AURA will be available at:
   - **Frontend**: [http://localhost:3000](http://localhost:3000)
   - **Backend API**: [http://localhost:5000/health](http://localhost:5000/health)

---

### Option 2: Local Development Setup

#### Prerequisites
* Node.js v18+
* PostgreSQL database instance running locally

#### 1. Setup Backend
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file from the template:
   ```env
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000
   DATABASE_URL=postgresql://<user>:<password>@localhost:5432/<dbname>?schema=public
   JWT_SECRET=yoursecretjwtkey
   JWT_REFRESH_SECRET=yourrefreshsecretjwtkey
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
4. Run migrations and client generate:
   ```bash
   npx prisma db push
   npx prisma generate
   ```
5. Start development server:
   ```bash
   npm run dev
   ```

#### 2. Setup Frontend
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📡 REST API Documentation

### Authentication (`/api/auth`)
* `POST /auth/register` - Create new candidate profile
* `POST /auth/login` - Login with credentials
* `POST /auth/refresh` - Refresh expiring JWT tokens
* `POST /auth/logout` - Clear user tokens
* `POST /auth/google` - Simulated Google OAuth handler

### Resume ATS Analyzer (`/api/resume`)
* `POST /resume/upload` - Upload PDF resume for analysis
* `GET /resume/history` - Retrieve previous scanned CV files
* `GET /resume/report/:id` - Fetch single compatibility report

### Mock Interviews (`/api/interview`)
* `POST /interview/start` - Initialize new timed mock session
* `POST /interview/:id/answer` - Submit and score single response
* `POST /interview/:id/finish` - Compile final aggregate scores
* `GET /interview/history` - Fetch previous interview records
* `GET /interview/report/:id` - Fetch detailed score report

### Coding Arena (`/api/coding`)
* `GET /coding/questions` - List coding challenges
* `GET /coding/questions/:id` - Fetch single challenge description
* `POST /coding/run` - Dry-run code in VM sandbox
* `POST /coding/submit` - Execute tests and submit solution

### System Analytics (`/api/analytics`)
* `GET /analytics/dashboard` - Compile dashboard progress metrics
* `GET /analytics/notifications` - Fetch alert notification events

### Admin Console (`/api/admin`)
* `GET /admin/users` - Audit system user registry
* `POST /admin/questions` - Inject new coding question
* `GET /admin/stats` - Fetch overall system counters
