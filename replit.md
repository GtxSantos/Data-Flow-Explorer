# Santander ETL Pipeline

## Overview

A Data Science portfolio app demonstrating the ETL (Extract, Transform, Load) pipeline flow, inspired by the Santander Dev Week 2023 challenge. Uses AI to generate personalized financial messages for bank customers.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + TailwindCSS + wouter
- **AI**: OpenAI via Replit AI Integrations (`@workspace/integrations-openai-ai-server`)

## Features

- **Extract**: Read user data from the database (3 demo users seeded)
- **Transform**: Use AI (OpenAI gpt-5-mini) to generate personalized financial messages in Portuguese
- **Load**: Store ETL results and display them in the UI

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Artifacts

- `artifacts/api-server` — Express 5 API server (routes: users, ETL)
- `artifacts/etl-pipeline` — React + Vite frontend

## DB Schema

- `users` — bank customers with account and card info, plus AI message field
- `etl_results` — audit log of ETL pipeline runs with AI-generated messages

## API Routes

- `GET /api/users` — list all users
- `POST /api/users` — create new user
- `GET /api/users/:id` — get user by ID
- `DELETE /api/users/:id` — delete user
- `POST /api/etl/run` — run the ETL pipeline (AI message generation)
- `GET /api/etl/results` — get all ETL results
- `GET /api/etl/stats` — get ETL statistics

## Notes

- `lib/api-zod/src/index.ts` only exports from `./generated/api` (not `./generated/types`) to avoid duplicate export conflicts
- OpenAI integration uses `AI_INTEGRATIONS_OPENAI_BASE_URL` and `AI_INTEGRATIONS_OPENAI_API_KEY` env vars (auto-provisioned by Replit)
