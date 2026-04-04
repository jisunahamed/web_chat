# Messenger AI – SaaS Platform

AI chatbot SaaS — create agents, connect to websites, manage conversations & leads.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL (Neon – serverless)
- **AI**: OpenAI API
- **Auth**: JWT
- **Deploy**: Vercel

## Quick Start (Local)

```bash
# 1. Install
npm install

# 2. Setup env
cp .env.example .env
# Edit .env → set DATABASE_URL (Neon) + OPENAI_API_KEY + JWT_SECRET

# 3. Push schema to database
npx prisma db push

# 4. Run
npm run dev
```

Visit http://localhost:3000

## Deploy to Vercel

1. **Create Neon Database**: https://neon.tech → New Project → copy connection string

2. **Push to GitHub**:
```bash
git init && git add . && git commit -m "init"
git remote add origin https://github.com/YOUR/REPO.git
git push -u origin main
```

3. **Import in Vercel**: https://vercel.com/import
   - Select your repo
   - Add environment variables:
     - `DATABASE_URL` = Neon connection string
     - `OPENAI_API_KEY` = your OpenAI key
     - `JWT_SECRET` = random 64-char string
   - Deploy!

4. **Run migration**:
```bash
npx prisma db push
```

## Embed Widget

### JS Script
```html
<script
  src="https://your-app.vercel.app/widget.js"
  data-agent-id="AGENT_ID"
  data-api-key="API_KEY"
></script>
```

### WordPress Plugin
Install "Messenger AI Chatbot" plugin → Settings:
- API Base URL: `https://your-app.vercel.app`
- Agent ID: from dashboard
- API Key: from dashboard settings

## API Endpoints

| Method | Path | Auth |
|---|---|---|
| POST | /api/auth/signup | Public |
| POST | /api/auth/login | Public |
| GET | /api/auth/me | JWT |
| GET/POST | /api/agents | JWT |
| PUT/DELETE | /api/agents/[id] | JWT |
| POST | /api/chat | API Key |
| POST | /api/lead | API Key |
| GET | /api/leads | JWT |
| GET | /api/conversations | JWT |
| GET/DELETE | /api/conversations/[id] | JWT |
