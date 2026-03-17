# 🚀 FetchMyOffer: Control Plane

[![Next.js](https://img.shields.io/badge/Next.js-15+-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

**FetchMyOffer** is an autonomous, Bring-Your-Own-Key (BYOK) AI recruitment SaaS. This repository houses the **Next.js Control Plane**, which acts as the central orchestrator and user dashboard for the platform.

It securely vaults user API credentials and acts as an Infrastructure-as-Code (IaC) engine, autonomously provisioning distributed microservices (a Java Spring Boot Brain and a Python Playwright Scraper) on Render's cloud infrastructure.

## 🏗️ System Architecture

FetchMyOffer operates on a 3-part distributed architecture:

1. **Control Plane (This Repo):** Next.js web app for onboarding, secure credential vaulting, cloud orchestration, and dashboard controls.
2. **[The Brain (Spring Boot)](https://github.com/alimehdi04/fetchMyOffer):** The central processing hub that analyzes jobs using Groq/Gemini AI and sends Telegram alerts.
3. **[The Scraper (Python/FastAPI)](https://github.com/alimehdi04/scraperPython_fetchMyOffer):** A Playwright-powered microservice that scrapes job boards and webhooks data back to the Brain.

## ✨ Key Features

- **Bring-Your-Own-Key (BYOK):** Zero platform fees. Users provide their own Groq, Gemini, and Render API keys to spin up their personal infrastructure.
- **Military-Grade Vault:** All user API keys are encrypted at rest using AES-256-GCM before touching the PostgreSQL database.
- **Infrastructure as Code (IaC):** Automatically commands the Render API to deploy Docker containers, inject dynamic environment variables, and manage webhooks.
- **Frictionless Telegram Onboarding:** Users link their Telegram accounts via a secure, one-click magic link (`/start <code_xyz>`).
- **Self-Healing Automation:** Includes a Vercel Cron Job that pings cold-started free-tier servers daily before scheduled hunts.
- **Full Remote Control:** Users can force job hunts, upload PDF resumes (routed directly to their Spring Boot container), and destroy their cloud infrastructure on demand.

---

## 💻 Local Setup & Installation

To run the Control Plane locally, follow these steps.

### 1. Clone the Repository

```bash
git clone https://github.com/alimehdi04/fetchmyoffer-control-plane.git
cd fetchmyoffer-control-plane
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root of the project. **The app will crash without this file.**

```env
# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate_a_random_secret_string"

# Supabase / PostgreSQL Database
DATABASE_URL="postgresql://postgres.[YOUR_PROJECT_REF]:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[YOUR_PROJECT_REF]:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"

# Google OAuth (For User Login)
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# App Secrets
# MUST BE EXACTLY 32 CHARACTERS LONG
ENCRYPTION_SECRET_KEY="12345678901234567890123456789012"

# Telegram Bot (For Webhook Setup)
TELEGRAM_BOT_TOKEN="your_telegram_bot_token"
TELEGRAM_BOT_USERNAME="your_bot_username"

# Vercel Cron Security
CRON_SECRET="your_cron_secret"
```

### 4. Setup the Database (Prisma)

Generate the Prisma client and push the schema to your Supabase database:

```bash
npx prisma generate
npx prisma db push
```

### 5. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

---

## 🛠️ How It Works (The User Flow)

1. **Authentication:** User logs in via Google OAuth.
2. **Telegram Linking:** User clicks a deep link to start a chat with the FetchMyOffer Telegram Bot. The webhook captures their `chatId` and links it to their account.
3. **The Vault:** User provides their AI (Groq/Gemini), Database (Supabase), and Cloud (Render) keys. These are encrypted via AES-256 and saved.
4. **Provisioning:** The Next.js server decrypts the Render key, connects to the Render API, and creates two new Dockerized web services.
5. **Two-Step Injection:** Once Render assigns a URL to the Spring Boot Brain, the Control Plane injects a `WEBHOOK_URL` environment variable back into the containers so the Scraper knows where to send job data.
6. **Dashboard Management:** The user uploads their resume to seed the AI and can monitor their deployment status or trigger manual job hunts.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](#).

## 📝 License

This project is [MIT](https://choosealicense.com/licenses/mit/) licensed.