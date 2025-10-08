# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Next.js 15 debt tracking application that helps users monitor their debt payments, assets, and net worth over time. Users can create debt sources (credit cards, loans, etc.), record monthly snapshots of payments and assets, and visualize their progress toward becoming debt-free.

## Development Commands

- **Development server**: `npm run dev` (uses Turbopack)
- **Build**: `npm run build` (uses Turbopack)
- **Production server**: `npm start`

## Architecture

### Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB (via Mongoose)
- **Authentication**: Clerk
- **UI**: Radix UI primitives + Tailwind CSS 4
- **State Management**: React hooks (client-side data fetching)

### Database Models

Three Mongoose models in `src/models/`:

1. **DebtSource** - Debt accounts (credit cards, loans, etc.)
   - Indexed by `userId` and `isActive`
   - Supports different debt types: CREDIT, CREDIT_CARD, ACCOUNT_LIMIT, LEASING, OTHER
   - Tracks `initialAmount`, `interestRate`, `minMonthlyPayment`, `canOverpay`

2. **Record** - Monthly snapshots of financial state
   - Unique compound index on `userId` + `month` (only one record per user per month)
   - Contains arrays of debt payments and total assets
   - Month format: "YYYY-MM" (e.g., "2025-10")

3. **Settings** - User settings
   - Unique per `userId`
   - Currently stores `flatPricePerM2` for net worth → square meter calculations

### Data Flow

1. **Client-side hooks** (`src/hooks/useDebtTracker.ts`):
   - `useSettings()` - Fetches/updates user settings
   - `useDebtSources()` - CRUD operations for debt sources
   - `useRecords()` - CRUD operations for monthly records
   - `useCalculatedRecordsAndDebts()` - Main hook that combines all data and runs calculations

2. **Calculations** (`src/lib/calculations.ts`):
   - `calculateRecordsAndDebtSources()` processes records chronologically to compute:
     - Current debt amounts after each payment
     - Total debt, net worth, flat m² equivalent
     - Payment history for each debt source
   - Records are processed in reverse order (oldest first) to accumulate debt changes over time

3. **API Routes** (`src/app/api/`):
   - `/api/settings` - GET/PUT user settings
   - `/api/debt-sources` - GET (all), POST (create)
   - `/api/debt-sources/[id]` - PUT (update), DELETE (soft delete via `isActive: false`)
   - `/api/records` - GET (all), POST (create)
   - `/api/records/[id]` - PUT (update), DELETE (hard delete)

### MongoDB Connection

`src/lib/mongodb.ts` implements connection caching to prevent connection pool exhaustion during Next.js hot reloads. The connection is cached in `global.mongoose`.

**Important**: The environment variable is `MONGODB_MONGODB_URI` (not `MONGODB_URI`).

### Authentication

Clerk middleware (`src/middleware.ts`) protects all routes except static files and Next.js internals. User authentication is required for all API routes and dashboard pages.

### UI Components

- **Radix UI primitives** in `src/components/ui/` (button, dialog, card, etc.)
- **Custom components**:
  - `AddDebtSourceDialog.tsx` - Form for creating debt sources
  - `AddSnapshotDialog.tsx` - Form for creating monthly records
- **Layout**: Uses sidebar pattern for dashboard navigation

### File Structure

```
src/
├── app/                    # Next.js App Router
│   ├── dashboard/          # Protected dashboard pages
│   │   ├── page.tsx        # Main dashboard
│   │   ├── snapshots/      # Monthly records view
│   │   └── debt-sources/   # Debt sources management
│   ├── api/                # API routes
│   └── page.tsx            # Landing page
├── components/             # React components
│   └── ui/                 # Radix UI primitives
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities
│   ├── calculations.ts     # Core debt calculation logic
│   ├── mongodb.ts          # Database connection
│   ├── types.ts            # TypeScript interfaces
│   └── utils.ts            # Helper functions
└── models/                 # Mongoose schemas
```

## Key Concepts

**Calculated Types**: The app uses two calculated types that extend base models:
- `CalculatedRecord` - Adds `totalDebt`, `netWorth`, `flatM2`, `totalPayment` to `IRecord`
- `CalculatedDebtSource` - Adds `currentAmount` and `historyOfPayments` to `IDebtSource`

These are computed client-side by processing records chronologically, deducting payments from initial amounts.

**Soft Delete**: Debt sources use `isActive: false` for soft deletion to preserve historical data integrity in records.

**Month Format**: All month fields use "YYYY-MM" string format for consistent sorting and comparison.
