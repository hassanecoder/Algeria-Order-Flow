# COD Order Management Tool - Algeria

## Overview

A full-featured Cash on Delivery (COD) order management web application built for Algerian e-commerce businesses. Features order tracking, customer management, delivery agent assignment, product catalog, and analytics — all with DZD currency and all 58 Algerian wilayas.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifacts/cod-manager)
- **API framework**: Express 5 (artifacts/api-server)
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Charts**: Recharts
- **Routing**: Wouter
- **Build**: esbuild (API), Vite (frontend)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server (all routes)
│   └── cod-manager/        # React frontend app
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/
│   └── src/seed.ts         # Database seed script (200 orders, 80 customers, 15 products, 8 agents)
```

## Features

### Pages
- **Dashboard** — KPI cards (revenue, orders, delivery rate, return rate), recent orders, today's summary
- **Orders** — Full order list with search/filter by status/wilaya, status badges, edit/delete
- **New/Edit Order** — Form with 58 Algerian wilayas, products, agents, pricing
- **Customers** — Customer directory with order stats, search/filter by wilaya
- **Delivery Agents** — Agent cards with stats (deliveries, success rate, current orders)
- **Products** — Product catalog with pricing in DZD, stock levels
- **Analytics** — Revenue trend (line chart), orders by status (donut), top wilayas (bar chart)
- **Settings** — Company info, default shipping cost, auto-confirm toggle

### Database Schema
- `orders` — COD orders with status, customer info, product, pricing, agent assignment
- `customers` — Customer profiles with wilaya/commune
- `agents` — Delivery agents with wilaya and status
- `products` — Product catalog with DZD pricing and stock
- `settings` — Application configuration

### API Routes (all at /api)
- `GET/POST /api/orders` — List & create orders
- `GET/PUT/DELETE /api/orders/:id` — Order CRUD
- `PATCH /api/orders/:id/status` — Update order status
- `GET/POST /api/customers` — Customer management
- `GET/POST /api/agents` — Agent management
- `GET/POST /api/products` — Product catalog
- `GET /api/analytics/summary` — KPI stats
- `GET /api/analytics/by-wilaya` — Orders by wilaya
- `GET /api/analytics/by-status` — Orders by status
- `GET /api/analytics/revenue-trend` — Revenue over time
- `GET/PUT /api/settings` — App settings

## Seeding

Run `pnpm --filter @workspace/scripts run seed` to populate with realistic Algerian data:
- 200 orders over 60 days with real Algerian customer names
- 80 customers across major wilayas
- 8 delivery agents
- 15 products (electronics, fashion, beauty, appliances)
- All amounts in DZD

## Development

```bash
# Start API server
pnpm --filter @workspace/api-server run dev

# Start frontend
pnpm --filter @workspace/cod-manager run dev

# Run codegen after API spec changes
pnpm --filter @workspace/api-spec run codegen

# Push DB schema changes
pnpm --filter @workspace/db run push

# Seed database
pnpm --filter @workspace/scripts run seed
```
