---
description: How to Deploy the MockMaster Interview Prep Platform
---

This workflow details the step-by-step process of deploying the MockMaster application (Next.js frontend, Express backend, and PostgreSQL database) to a cloud platform.

## Recommended Cloud Hosting Platforms

We recommend the following two deployment strategies based on your requirements:

### Recommendation 1: Render / Vercel (Easiest PaaS - Recommended)
* **Frontend (Next.js)**: Deploy on **Vercel** (Free/Hobby tier, standard for Next.js apps).
* **Backend (Express)**: Deploy on **Render** or **Railway** as a Web Service.
* **Database (PostgreSQL)**: Deploy on **Render PostgreSQL** or **Supabase** (Free tier managed PG database).

### Recommendation 2: DigitalOcean / AWS / GCP (Single VPS Docker Deployment)
* Deploy the entire stack using **Docker Compose** on a single virtual private server (e.g., DigitalOcean Droplet, AWS EC2 instance, or Hetzner Cloud VPS).
* This is extremely cost-effective as it hosts the DB, backend, and frontend under a single server instance.

---

## Step-by-Step Deployment Guide

### Phase 1: Database Deployment (Supabase or Render)

#### Option A: Supabase (Recommended for Free Tier PG)
1. Sign up/log in to [Supabase](https://supabase.com/).
2. Create a new Database Project.
3. Retrieve your PostgreSQL Connection String from **Project Settings > Database > Connection string > URI**. It will look like this:
   `postgresql://postgres:[YOUR-PASSWORD]@db.xxxx.supabase.co:5432/postgres`

#### Option B: Render PostgreSQL
1. Sign up/log in to [Render](https://render.com/).
2. Click **New > PostgreSQL**.
3. Set name, region, and select the Free instance.
4. Once active, copy the **Internal Database URL** (if deploying backend on Render) or **External Database URL** (for local/outside access).

---

### Phase 2: Deploy Backend API (Render)

1. Connect your GitHub repository to Render.
2. Click **New > Web Service**. Select your repository.
3. Configure the service:
   * **Root Directory**: `backend`
   * **Runtime**: `Node`
   * **Build Command**: `npm install && npm run build`
   * **Start Command**: `npm start`
4. Add the following **Environment Variables** in Render settings:
   * `PORT`: `5005` (or whatever port you want)
   * `NODE_ENV`: `production`
   * `CLIENT_URL`: `https://your-frontend-domain.vercel.app` (URL of your frontend after Vercel deployment)
   * `DATABASE_URL`: Your Supabase/Render PostgreSQL URI
   * `JWT_SECRET`: Any random security string (e.g. `super_secret_jwt_key_12903847`)
   * `JWT_REFRESH_SECRET`: Any random refresh key (e.g. `super_secret_refresh_key_901234`)
   * `GEMINI_API_KEY`: Your Google Gemini API Key
5. Deploy the Service.
6. Once deployed, note your Render base URL: e.g., `https://mockmaster-api.onrender.com`.

---

### Phase 3: Run Database Migrations

You need to initialize the tables in your production PostgreSQL database:
1. On your local machine, temporarily change `DATABASE_URL` in `backend/.env` to your production database URL.
2. Run Prisma push command:
   ```bash
   cd backend
   npx prisma db push
   npx prisma generate
   ```
3. Revert your local `backend/.env` back to localhost database URL.

---

### Phase 4: Deploy Frontend (Vercel)

1. Sign up/log in to [Vercel](https://vercel.com).
2. Click **Add New > Project**, and select your GitHub repository.
3. Configure project settings:
   * **Root Directory**: Select `frontend`
   * **Framework Preset**: `Next.js`
4. Add the following **Environment Variables**:
   * `NEXT_PUBLIC_API_URL`: `https://mockmaster-api.onrender.com/api` (URL of your backend API on Render)
   * `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: (Optional) Your Google OAuth Client ID if using real Google Auth.
5. Click **Deploy**. Vercel will automatically compile, optimize, and generate your application URL structure.
