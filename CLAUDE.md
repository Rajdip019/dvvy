# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

dvvy — a client-side Next.js 16 app for splitting group expenses. State is persisted in localStorage. Dark mode is enabled by default.

## Commands

```bash
pnpm run dev        # Start dev server at localhost:3000
pnpm run build      # Production build
pnpm run start      # Start production server
pnpm run lint       # ESLint
pnpm exec shadcn add <component>  # Add a shadcn/ui component to components/ui/
```

No test framework is configured.

## Architecture

- **Framework:** Next.js 16 App Router, React 19, TypeScript (strict mode)
- **Styling:** Tailwind CSS 4 with shadcn/ui (new-york style), oklch color tokens in `app/globals.css`
- **State:** React Context + useReducer in `context/AppContext.tsx` — access via `useApp()` hook. Actions: `CREATE_GROUP`, `DELETE_GROUP`, `ADD_MEMBER`, `ADD_EXPENSE`, `DELETE_EXPENSE`
- **Types:** All shared types in `types/index.ts` — `Group`, `Member`, `Expense`, `Split`, `SplitType`, `Settlement`, `Balance`
- **Business logic:** `utils/balance.ts` — `calculateBalances()` computes net balances, `simplifyDebts()` uses a greedy algorithm to minimize settlement transactions
- **UI components:** shadcn/ui primitives in `components/ui/`, feature components (`CreateGroupForm`, `AddExpenseForm`, `ExpenseList`, `BalanceSheet`) in `components/`
- **Utility:** `lib/utils.ts` exports `cn()` (clsx + tailwind-merge)

## Routing

- `/` — Home page, lists all groups
- `/group/[id]` — Group detail with expenses tab and balances tab

All page components are client components using `"use client"`.

## Path Aliases

`@/*` maps to the project root (configured in tsconfig.json and components.json).

## Expense Split Types

Three split modes: `equal` (all members), `select` (chosen members, split equally), `unequal` (manual amounts per member). The `AddExpenseForm` handles validation for each mode.
