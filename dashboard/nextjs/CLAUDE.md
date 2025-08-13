# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Purpose

This is a Next.js 15 dashboard starter template designed for users who are new to Next.js to easily fork and build rich, interactive dashboards using live coding with Claude Code. The template provides a solid foundation with modern Next.js conventions, TypeScript, and Tailwind CSS 4.

## Target Use Case

- **For beginners**: Users unfamiliar with Next.js can fork this repository and start building immediately
- **Live coding friendly**: Optimized for pair programming sessions with Claude Code
- **Dashboard focused**: Structured to support common dashboard patterns and components
- **Production ready**: Includes proper TypeScript configuration and build setup

## Development Commands

- `npm run dev` - Start development server with Turbopack enabled
- `npm run build` - Build production version
- `npm run start` - Start production server
- `npm run lint` - Run ESLint with Next.js configuration

## Architecture & Structure

**App Router Structure:**
- Uses Next.js 15 app router (not pages router)
- Main application code in `/app` directory
- Layout component in `app/layout.tsx` with global metadata and font configuration
- Homepage in `app/page.tsx`

**Styling & UI:**
- Tailwind CSS 4 with PostCSS configuration
- CSS custom properties for fonts: `--font-geist-sans` and `--font-geist-mono`
- Dark mode support built into components via Tailwind classes
- Global styles in `app/globals.css`

**TypeScript Configuration:**
- Strict TypeScript enabled
- Path alias `@/*` maps to project root
- Next.js plugin integration for optimal TypeScript experience

**Font Management:**
- Uses Next.js `next/font/google` for optimized Geist fonts
- Font variables defined in root layout and applied globally

## Key Configuration Files

- `tsconfig.json` - TypeScript configuration with strict mode and Next.js plugin
- `eslint.config.mjs` - ESLint with Next.js core web vitals and TypeScript rules
- `next.config.ts` - Next.js configuration (currently minimal)
- `postcss.config.mjs` - PostCSS setup for Tailwind CSS 4
- `package.json` - Uses npm, includes Turbopack for development

## Dashboard Development Guidelines

**Getting Started for New Users:**
- Fork this repository to begin building your dashboard
- Run `npm install` followed by `npm run dev` to start developing
- Modify `app/page.tsx` to begin building your dashboard interface
- Use the existing Tailwind classes for consistent styling

**Common Dashboard Patterns:**
- Add new pages by creating folders in `/app` directory (e.g., `/app/analytics/page.tsx`)
- Create reusable components in a `/components` directory when needed
- Use Tailwind's grid and flexbox utilities for responsive layouts
- Leverage built-in dark mode support via `dark:` prefixes

**Live Coding Best Practices:**
- Keep components small and focused for easier iteration
- Use TypeScript interfaces for props and data structures
- Utilize Tailwind's utility classes for rapid styling
- Take advantage of hot reload for immediate feedback

## Development Notes

- Development server uses Turbopack for faster builds and hot reload
- Static assets in `/public` directory
- Ready for dashboard component development
- Easily extensible with additional UI libraries or state management as needed