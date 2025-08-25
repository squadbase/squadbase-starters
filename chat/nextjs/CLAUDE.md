# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server with Turbopack on http://localhost:3000
- `npm run build` - Build production application with Turbopack
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code linting

## Architecture

This is a Next.js 15.5.0 chat application starter template with:
- **App Router** - Using the `/app` directory structure for routing
- **TypeScript** - Strict mode enabled with ES2017 target
- **Tailwind CSS v4** - Using PostCSS plugin configuration
- **Turbopack** - Used for both development and production builds
- **AI SDK** - Vercel AI SDK (`ai` and `@ai-sdk/react`) for building conversational interfaces

### Key Directories
- `/app` - Next.js App Router pages and layouts
- `/components/ai-elements` - Pre-built AI chat UI components (messages, prompt input, conversation, etc.)
- `/components/ui` - shadcn/ui components (button, avatar, dialog, etc.)
- `/lib` - Utility functions including `cn()` for className merging
- `/hooks` - Custom React hooks
- `/public` - Static assets served at root URL

### Component Library
This project uses shadcn/ui components with:
- Radix UI primitives for accessibility
- Tailwind CSS for styling
- Lucide React for icons
- Class variance authority for component variants

### AI Chat Components
The `/components/ai-elements` directory contains reusable chat UI components:
- `conversation.tsx` - Scrollable conversation container with stick-to-bottom behavior
- `message.tsx` - Message display with avatar support
- `prompt-input.tsx` - Input field with toolbar and model selection
- `response.tsx` - AI response display with streaming support
- `code-block.tsx` - Syntax highlighted code blocks
- `image.tsx` - Image handling in chat
- Other specialized components for AI interactions

### Path Aliases
- `@/*` - Maps to root directory for clean imports

### Styling Approach
- Uses Tailwind CSS v4 with PostCSS
- Component styling uses `cn()` utility from `/lib/utils` for conditional classes
- Dark mode support built-in with Tailwind's dark: modifier

## Database Stack

### Database
- **Neon** - Serverless Postgres database
- **Drizzle ORM** - TypeScript ORM for type-safe database operations

### Implementation Guidelines

#### Setup & Configuration
1. **Environment Variables**
   - Store database connection string in `.env.local` as `DATABASE_URL`
   - Format: `postgresql://user:password@ep-hostname.region.aws.neon.tech/neondb?sslmode=require`
   - Never commit `.env.local` to version control

2. **Database Connection** (`/src/db/index.ts`)
   ```typescript
   import { drizzle } from "drizzle-orm/neon-http";
   import { neon } from "@neondatabase/serverless";
   
   const sql = neon(process.env.DATABASE_URL!);
   export const db = drizzle({ client: sql });
   ```

3. **Schema Definition** (`/src/db/schema.ts`)
   - Use Drizzle's PostgreSQL core functions (`pgTable`, `serial`, `text`, etc.)
   - Define TypeScript types using `$inferInsert` and `$inferSelect`
   - Keep all table definitions in a single schema file for consistency

4. **Drizzle Configuration** (`drizzle.config.ts`)
   ```typescript
   import { config } from 'dotenv';
   import { defineConfig } from "drizzle-kit";
   
   config({ path: '.env.local' });
   
   export default defineConfig({
     schema: "./src/db/schema.ts",
     out: "./drizzle/migrations",
     dialect: "postgresql",
     dbCredentials: {
       url: process.env.DATABASE_URL!,
     },
   });
   ```

#### Best Practices

1. **File Structure**
   ```
   /src/db/
     ├── index.ts       # Database connection
     ├── schema.ts      # Table definitions
     └── queries/       # Query functions organized by domain
         ├── users.ts
         └── posts.ts
   ```

2. **Server Actions** (Next.js App Router)
   - Use `"use server"` directive for database operations
   - Call `revalidatePath()` after mutations to refresh cached data
   - Handle errors gracefully and return appropriate responses

3. **Type Safety**
   - Always export inferred types from schema:
     ```typescript
     export type InsertUser = typeof usersTable.$inferInsert;
     export type SelectUser = typeof usersTable.$inferSelect;
     ```
   - Use these types in your application code for full type safety

4. **Query Patterns**
   - Use Drizzle's query builder for complex queries
   - Leverage `eq()`, `and()`, `or()`, `like()` operators
   - Use transactions for multi-table operations
   - Implement pagination with `limit()` and `offset()`

5. **Migrations**
   - Generate: `npx drizzle-kit generate`
   - Apply: `npx drizzle-kit migrate`
   - For development: `npx drizzle-kit push` (direct schema sync)

6. **Performance Considerations**
   - Use connection pooling for production
   - Consider using `neon-serverless` driver with WebSockets for better performance
   - Implement proper indexes in your schema
   - Use `select()` with specific columns instead of selecting all

### Dependencies to Install
```bash
npm install drizzle-orm @neondatabase/serverless
npm install -D drizzle-kit dotenv
```

### Common Commands
- `npx drizzle-kit generate` - Generate migration files
- `npx drizzle-kit migrate` - Apply migrations
- `npx drizzle-kit push` - Push schema changes directly (dev)
- `npx drizzle-kit studio` - Open Drizzle Studio for database management
- `npx drizzle-kit introspect` - Generate schema from existing database