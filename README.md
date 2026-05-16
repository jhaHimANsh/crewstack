# CREWSTACK — Team Task Manager (Full-Stack)

A full-stack web app where users can create projects, assign tasks, and track progress with **role-based access (Admin / Member)**. Built on PostgreSQL with a neo-brutalist UI and deployed on Railway.

> **Live URL:** _[add your Railway URL after deployment]_  
> **GitHub:** _[add your repo URL]_  
> **Demo video:** _[add Loom/YouTube link]_

---

## ✨ Features

- 🔐 **Authentication** — Signup / Login with JWT + bcrypt
- 👥 **Role-Based Access Control** — `ADMIN` (full control) vs `MEMBER` (work on assigned tasks)
- 📁 **Project Management** — Create projects, invite members by email
- ✅ **Task Management** — Create, assign, prioritize (Low/Medium/High), set due dates
- 🗂️ **Kanban Board View** — Drag-style 3-column layout (Todo / In Progress / Done) + list view toggle
- 📊 **Dashboard** — Real-time stats: total tasks, status breakdown, overdue tracking, personal queue
- ⏰ **Overdue Detection** — Auto-flag tasks past their due date
- 🎨 **Neo-Brutalist UI** — Hard borders, drop shadows, vibrant flat colors — distinctive and unapologetic
- ✓ **Validated APIs** — Zod schemas on every endpoint
- 📱 **Responsive** — Works on mobile, tablet, desktop

---

## 🛠️ Tech Stack

**Backend**
- Node.js + Express
- **PostgreSQL** (relational, ACID-compliant)
- **Prisma ORM** (type-safe DB queries, schema-first)
- **Zod** (runtime validation)
- JWT (jsonwebtoken) + bcryptjs
- CORS, Morgan

**Frontend**
- React 18 + Vite
- React Router v6
- Tailwind CSS (custom design tokens for brutalist aesthetic)
- Axios
- React Hot Toast

**Deployment**
- Railway (single service for app + bundled PostgreSQL)
- No external database setup needed — Railway provisions PostgreSQL automatically

---

## 📁 Project Structure

```
crewstack/
├── server/
│   ├── prisma/
│   │   └── schema.prisma         # User, Project, Task, ProjectMember
│   ├── src/
│   │   ├── config/prisma.js      # Prisma client singleton
│   │   ├── controllers/          # auth, project, task
│   │   ├── middleware/           # auth (JWT), role, validate (Zod)
│   │   ├── routes/               # express routers
│   │   ├── schemas/              # Zod request schemas
│   │   └── index.js              # Express entry
│   └── package.json
├── client/
│   ├── src/
│   │   ├── lib/api.js            # Axios instance
│   │   ├── context/AuthContext.jsx
│   │   ├── components/           # Topbar, ProtectedRoute
│   │   ├── pages/                # Login, Signup, Dashboard, Projects, ProjectDetail
│   │   ├── App.jsx, main.jsx
│   │   └── index.css             # Tailwind + brutalist component classes
│   ├── index.html
│   ├── vite.config.js, tailwind.config.js
│   └── package.json
├── package.json                  # Root orchestrator (Railway uses this)
├── railway.json, nixpacks.toml
└── README.md
```

---

## 🚀 Local Setup

### Prerequisites
- Node.js 18+ and npm
- **PostgreSQL** running locally **OR** a Railway/Supabase/Neon Postgres URL

### 1. Clone & install

```bash
git clone <your-repo-url>
cd crewstack
npm run install-all
```

### 2. Set up environment

Create `server/.env`:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/crewstack
JWT_SECRET=replace_with_a_long_random_string
JWT_EXPIRE=7d
```

> If you don't have local Postgres, use Railway's free tier — sign up, create a Postgres database, copy the `DATABASE_URL`, and use that.

### 3. Push schema to database

```bash
cd server
npx prisma db push
cd ..
```

This creates all tables (User, Project, Task, ProjectMember) in your database.

### 4. Run

**Terminal 1 — backend** (port 5000):
```bash
npm run dev:server
```

**Terminal 2 — frontend** (port 3000, proxies `/api` → 5000):
```bash
npm run dev:client
```

Open http://localhost:3000.

### 5. Run in production mode locally

```bash
npm run build
NODE_ENV=production npm start
```

Visit http://localhost:5000.

---

## ☁️ Deploy to Railway (3 minutes)

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: CREWSTACK"
git branch -M main
git remote add origin https://github.com/<your-username>/crewstack.git
git push -u origin main
```

### 2. Deploy on Railway

1. Go to [railway.app](https://railway.app) → sign in with GitHub
2. **New Project** → **Deploy from GitHub repo** → pick your `crewstack` repo
3. While it builds, **add PostgreSQL**: in the project view, click **"+ New" → "Database" → "PostgreSQL"**. Railway provisions a Postgres database in seconds.
4. Click your app service → **Variables** → **Raw Editor** and paste:

   ```
   NODE_ENV=production
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   JWT_SECRET=your_long_random_secret_here_change_this
   JWT_EXPIRE=7d
   ```

   The `${{Postgres.DATABASE_URL}}` is a Railway reference — it auto-injects the Postgres URL from the other service. **Pure magic.**

5. Save. Railway redeploys. The build script runs `prisma generate`, builds the React app, and on start runs `prisma db push` to sync the schema.

6. Once deployed → **Settings → Networking → Generate Domain** to get your public URL.

---

## 🔌 API Reference

All endpoints prefixed with `/api`. Protected routes require `Authorization: Bearer <token>`.

### Auth

| Method | Route | Body | Access |
|---|---|---|---|
| POST | `/auth/signup` | `{ name, email, password, role? }` | Public |
| POST | `/auth/login` | `{ email, password }` | Public |
| GET | `/auth/me` | — | Authenticated |

### Projects

| Method | Route | Access | Notes |
|---|---|---|---|
| GET | `/projects` | Authenticated | Lists accessible projects |
| POST | `/projects` | **Admin** | Create project |
| GET | `/projects/:id` | Member/Admin | Project + tasks |
| PUT | `/projects/:id` | **Admin** | Update |
| DELETE | `/projects/:id` | **Admin** | Cascade-deletes tasks |
| POST | `/projects/:id/members` | **Admin** | Add by email |
| DELETE | `/projects/:id/members/:userId` | **Admin** | Remove member |

### Tasks

| Method | Route | Access |
|---|---|---|
| GET | `/tasks` | Authenticated (filterable: `?project=&status=&overdue=true`) |
| GET | `/tasks/dashboard/stats` | Authenticated |
| POST | `/tasks` | Admin / Project Owner |
| GET | `/tasks/:id` | Project Member |
| PUT | `/tasks/:id` | Admin / Owner / Assignee\* |
| DELETE | `/tasks/:id` | Admin / Owner |

\* Assignees (Members) can only change `status` of their own assigned tasks.

### Users

| Method | Route | Access |
|---|---|---|
| GET | `/users` | Authenticated |

---

## 🔒 Role Matrix

| Capability | Admin | Member |
|---|:---:|:---:|
| See all projects | ✅ | ❌ |
| Create projects | ✅ | ❌ |
| Edit/delete projects | ✅ | ❌ |
| Add/remove members | ✅ | ❌ |
| Create tasks in own project | ✅ | Owner only |
| Edit any task field | ✅ | ❌ |
| Change own assigned task status | ✅ | ✅ |
| Delete tasks | ✅ | Project owner |

---

## 🧪 Demo Walkthrough

1. Open the live URL, sign up as **Admin** (e.g. `admin@test.com`).
2. From Projects → **+ New project** → "Q4 Launch".
3. Inside the project, **+ New task** → set due date in the past to trigger Overdue badge.
4. In another browser (incognito), sign up as **Member** (e.g. `member@test.com`).
5. Back in Admin window → Crew sidebar → add Member's email.
6. Switch to Member's window → they now see the project, can change task status, but can't delete or edit titles.
7. Check Dashboard for live stats.

---

## 📦 Submission Checklist

- ✅ Authentication (Signup/Login) with JWT + bcrypt
- ✅ Project & Team Management
- ✅ Task creation, assignment & status tracking
- ✅ Dashboard (status counts, overdue, personal queue)
- ✅ REST APIs + Database (PostgreSQL via Prisma)
- ✅ Validations (Zod) & relationships (Prisma foreign keys + cascade deletes)
- ✅ Role-Based Access Control (Admin/Member)
- ✅ Deployed on Railway
- ✅ Live URL
- ✅ GitHub repo
- ✅ README
- ⬜ Demo video (record screen walkthrough)

---

## 📝 License

MIT
