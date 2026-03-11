<div align="center">

# 🏛️ RashtraKosh
### **|| कोशमूलाः सर्वारम्भाः ||**
*Finance is the root of all endeavors*

**Premium AI-Powered Public Finance Intelligence & Budget Visualization Platform**

[![Vercel Deployment](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=for-the-badge&logo=vercel)](https://vercel.com)
[![Next.js 14](https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)

---

[Overview](#-overview) • [Key Features](#-key-features) • [Tech Stack](#-technical-architecture) • [Setup](#-installation--setup) • [Architecture](#-project-structure)

</div>

## ✨ Vision
**RashtraKosh** is a state-of-the-art intelligence platform designed to bring radical transparency and AI-driven insights to the Indian Union Budget. By transforming complex treasury data into interactive, intuitive, and beautiful visualizations, RashtraKosh empowers citizens, analysts, and policy-makers to understand the national financial landscape in high resolution.

---

## ⚠️ Data Accuracy Disclaimer (Beta Platform)
> **Notice regarding Government Data:** The data presented on this platform is algorithmically extracted from official Government of India Outcome Budget and Demand for Grants PDF documents. While stringent data validation checks and variance flagging are implemented during the ingestion pipeline, extraction anomalies may occur. 
> 
> *This data is provided for illustrative, educational, and analytical purposes only, and should **not** be cited as an official administrative source of government financial figures.*

---

## 📸 Final Interface

![Home Page](./public/docs/screenshots/home.png)
*Modern Landing with Vintage Indian Aesthetic and Real-time KPI Tracking*

---

## 🌟 What's New in V2.0 (The Intelligence Update)

- **Automated PDF Data Pipeline**: Entirely eliminated manual data entry. Upload official GOI PDFs, let the custom extraction engine parse the OOMF tables, map schemes, and insert allocations automatically.
- **Admin Command Center**: A completely secure, designated `/(admin)` route group for managing data ingestion, feedback moderation, and policy actions.
- **Ingestion Audit Trail**: Complete transparency module verifying the history of data loads, mapping validations, and algorithmic extraction logs.
- **Citizen Feedback Inbox**: Direct loop for public grievance and feature/policy recommendations with internal triage tracking.
- **Enterprise-Grade Security**: Global rate limiting on all public routes + strict request payload validation via Zod schemas.
- **Vintage RashtraKosh UI**: A breathtaking visual overhaul anchoring the project in Indian heritage, featuring dynamic 3D Emblem animations, dark/light modes, and a glass-pane aesthetic.

---

## 🚀 Core Platform Features

### 🔍 1. Budget Explorer (Deep Drill-down)
Navigate through the layers of the Indian economy with surgical precision.
- **Hierarchical Drill-down**: Ministry → Department → Core Schemes.
- **Health Scoring**: Proprietary performance metrics for every financial entity.
- **Utilization Tracking**: Real-time monitoring of allocated vs. utilized funds.

![Explorer](./public/docs/screenshots/explorer.png)

### 🤖 2. RashtraKosh Intelligence (AI Advisor)
An AI-powered policy advisor that understands the nuances of public finance.
- **Natural Language Queries**: Ask complex questions about budget reallocations or policy impact.
- **Context-Aware Insights**: Leverages Anthropic Claude models for deep financial reasoning.
- **Predictive Analysis**: Intelligence on fiscal surplus and potential impact zones.

![Intelligence](./public/docs/screenshots/intelligence.png)

### 📊 3. Advanced Analytics & Visualization
Beautiful, high-density data visualizations that reveal the stories behind the numbers.
- **Macro Trends**: Visualization of sector-wise growth and allocation shifts.
- **Comparative Metrics**: Benchmarking departmental performance across fiscal years.

![Analytics](./public/docs/screenshots/analytics.png)

### 🏗️ 4. Admin Command Center
A unified console for treasury managers and analysts.
- **Automated PDF Ingestion**: Robust pipeline to extract, map, and ingest data from official Outcome Budgets and Demand for Grants PDFs.
- **Ingestion Audit Trail**: Dedicated dashboard to monitor, verify, and track the history of automated data ingestions.
- **Feedback Inbox**: Comprehensive interface to manage, filter, and process citizen feedback with internal notes and status tracking.
- **Policy Reallocation**: Tools to simulate budget shifts based on AI recommendations.


*Comprehensive suite of tools for robust data and engagement management*

---

## 🛠️ Technical Architecture

### **Core Stack**
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server Actions)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with Custom Glassmorphism System
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Database**: [Prisma ORM](https://www.prisma.io/) with PostgreSQL
- **Auth**: [Next-Auth (Auth.js v5)](https://authjs.dev/)
- **AI Integration**: [Vercel AI SDK](https://sdk.vercel.ai/) & [Anthropic Claude](https://www.anthropic.com/)
- **Visuals**: [Lucide React](https://lucide.dev/) & [Recharts](https://recharts.org/)

### **Performance & Security Design**
- **Security Hardening**: Strict input validation using Zod and comprehensive rate-limiting across all public endpoints and API routes.
- **Edge Compatible Auth**: Decoupled configuration for optimal middleware performance.
- **Optimized Assets**: Next.js `Image` component used for LCP performance.
- **Component Architecture**: Atomic design for reusable UI elements.

---

## 💻 Installation & Setup

### **System Requirements & Prerequisites**
- **Node.js**: v18.17.0 or higher (Required for Next.js App Router & Server Actions)
- **Database**: PostgreSQL (Local or Cloud, e.g., Supabase/Neon)
- **AI Engine**: Anthropic API Key (Required for `RashtraKosh Intelligence`)
- **PDF Extraction Engine**: Node environment capable of buffer stream management (No external Python dependencies needed)
- **Security Protocols**: Built-in memory limits require minimum 1GB RAM for Next Server (due to rate-limiter & pdf-parse overhead)

### **Local Development**
1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/India-Innovates.git
   cd India-Innovates/RashtraKosh
   ```

2. **Install Dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Configure Environment Variables**
   Create a `.env.local` file:
   ```env
   DATABASE_URL="postgresql://..."
   AUTH_SECRET="your-secret"
   ANTHROPIC_API_KEY="your-key"
   ```

4. **Database Setup**
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

5. **Start Dev Server**
   ```bash
   npm run dev
   ```

---

## 🏛️ Project Structure

```bash
RashtraKosh/
├── app/               # Next.js 14 App Router
│   ├── (admin)        # Admin Console Routes
│   ├── (auth)         # Authentication Pages
│   └── (public)       # Core User Facing Pages
├── components/        # Specialized UI Components
│   ├── ui/            # Atomic Design System
│   └── navigation/    # Navbar & Global Navigation
├── lib/               # Shared Utilities & Auth Config
├── prisma/            # Database Schema & Seed Logic
├── store/             # State Management (Zustand)
└── public/            # Static Assets & Documentation
```

---

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.

<div align="center">
  <p>Built with ❤️ for a Transparant and Resurgent India</p>
  <p><b>© 2026 RashtraKosh Team</b></p>
</div>
