# Next.js 15 AI Chat Starter

A modern AI chat application starter template built with Next.js 15, Vercel AI SDK, and Tailwind CSS 4. Perfect for developers who want to quickly build conversational interfaces with streaming responses and rich UI components.

![AI Chat Starter Demo](./assets/ai-chat-starter.gif)

## Deploy

Click the button to clone this repository and deploy it on Squadbase.

[![Deploy to Squadbase](https://app.squadbase.dev/button.svg)](https://app.squadbase.dev/new/clone?repository-url=https://github.com/squadbase/squadbase-starters/tree/main/chat/nextjs)

## Getting Started

1. Fork this repository
2. Install dependencies:

```bash
npm install
```

3. Set up the database:
   - Create a PostgreSQL database (we recommend [Neon](https://neon.tech) for serverless Postgres)
   - Copy your database connection string to `.env.local`:
   ```
   DATABASE_URL=postgresql://user:password@ep-hostname.region.aws.neon.tech/neondb?sslmode=require
   ```
   - Generate and apply database migrations:
   ```bash
   npx drizzle-kit generate
   npx drizzle-kit migrate
   ```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) to start chatting

### Development Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Database Commands (Drizzle ORM)

- `npx drizzle-kit generate` - Generate migration files from schema changes
- `npx drizzle-kit migrate` - Apply pending migrations to database
- `npx drizzle-kit push` - Push schema changes directly (development only)
- `npx drizzle-kit studio` - Open Drizzle Studio for database management

### Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with fonts and metadata
│   ├── page.tsx           # Chat interface - start customizing here
│   └── globals.css        # Global styles
├── components/
│   ├── ai-elements/       # Pre-built AI chat components
│   │   ├── conversation.tsx    # Scrollable chat container
│   │   ├── message.tsx         # Message display with avatars
│   │   ├── prompt-input.tsx    # Input field with model selection
│   │   ├── response.tsx        # Streaming AI responses
│   │   └── code-block.tsx      # Syntax highlighted code
│   └── ui/               # shadcn/ui components
├── lib/                  # Utility functions
├── public/               # Static assets
└── hooks/                # Custom React hooks
```

## How to customize

1. **Start with the chat interface**: Modify `app/page.tsx` to customize your chat experience
2. **Add AI providers**: Configure different AI models in your environment
3. **Customize components**: Modify chat components in `/components/ai-elements/`
4. **Style with Tailwind**: Use utility classes and dark mode variants

### Live Coding with Claude Code

This template is optimized for pair programming with [Claude Code](https://claude.ai/code):

- Ready-to-use chat components for rapid iteration
- TypeScript interfaces for AI message structures
- Streaming responses with real-time updates
- Hot reload for immediate feedback

## Stack

- **Next.js 15** with App Router
- **Vercel AI SDK** for conversational interfaces (`ai` and `@ai-sdk/react`)
- **TypeScript** with strict configuration
- **Tailwind CSS 4** with dark mode support
- **Turbopack** for fast development
- **shadcn/ui** components with Radix UI primitives
- **Geist fonts** optimized with `next/font`
- **ESLint** with Next.js configuration

## Learn More

- [Vercel AI SDK](https://sdk.vercel.ai/docs) - Build AI-powered applications
- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API
- [Tailwind CSS](https://tailwindcss.com/docs) - Utility-first CSS framework
- [TypeScript](https://www.typescriptlang.org/docs) - Typed JavaScript
