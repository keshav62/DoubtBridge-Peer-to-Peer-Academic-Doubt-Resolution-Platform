# DoubtBridge - Peer-to-Peer Academic Doubt Resolution Platform

DoubtBridge is a collaborative academic doubt resolution platform where students can ask academic doubts, get matched with verified peer helpers, explore a curated knowledge base, and earn peer recognition.

## 📁 Architecture & Folder Structure

```
├── prisma/
│   ├── schema.prisma       # Database models & relationships
│   └── seed.js             # Seed script for initial academic data
├── public/
│   └── images/             # Static assets and images
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── (auth)/         # Authentication route group (login, register)
│   │   ├── (dashboard)/    # Authenticated dashboard views (doubts, helpers, moderation)
│   │   ├── api/            # API Route handlers
│   │   ├── layout.jsx      # Root HTML layout
│   │   ├── page.jsx        # Landing page
│   │   └── globals.css     # Global styles & design system tokens
│   ├── components/         # Reusable React UI components
│   │   ├── ui/             # Core UI atoms (Button, Card, Badge, Modal, etc.)
│   │   ├── layout/         # Header, Sidebar, Footer components
│   │   ├── doubts/         # Doubt-specific cards, forms, filters
│   │   ├── helpers/        # Helper profile cards, leaderboard
│   │   └── moderation/     # Flag queues, report actions
│   ├── features/           # Modular business logic & actions
│   │   ├── doubts/         # Doubt actions, validation, and database services
│   │   ├── helpers/        # Helper actions & matching algorithm
│   │   ├── answers/        # Answer submission & acceptance actions
│   │   ├── moderation/     # Moderation queue & content flagging services
│   │   └── knowledge/      # Knowledge base & FAQ search services
│   ├── lib/                # Shared utility libraries (Prisma client, Auth, Permissions)
│   └── hooks/              # Custom React hooks
├── .env                    # Environment variables (local)
├── .env.example            # Example environment template
├── eslint.config.mjs       # ESLint configuration
├── jsconfig.json           # Path aliases (@/* -> ./src/*)
├── next.config.mjs         # Next.js configuration
└── package.json            # Project dependencies and npm scripts
```

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Database & Prisma
```bash
# Generate Prisma Client
npm run prisma:generate

# Run Migrations
npm run prisma:migrate

# Seed Demo Data
npm run prisma:seed
```

### 3. Run Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.
DoubtBridge team 200
