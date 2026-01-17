# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16 dashboard application for Brave Frontier Heroes, using OAuth2 authentication to interact with the BFH Forge API. The application provides user information display, hero unit metadata, and battle replay functionality.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (runs on port 3500)
npm run dev

# Generate TypeScript API client from OpenAPI spec
npm run generate:api

# Build for production
npm run build

# Start production server
npm run start

# Run linter
npm run lint
```

## Environment Setup

### Configuration File

All environment variables are centralized in `src/config/env.ts`. This file provides default values for BFH API endpoints, so the app can run without setting these environment variables.

**Default values included**:
- `BFH_API_BASE_URL`: `https://api.bravefrontierheroes.com`
- `BFH_AUTH_URL`: `https://auth.bravefrontierheroes.com/oauth2/auth`
- `BFH_TOKEN_URL`: `https://auth.bravefrontierheroes.com/oauth2/token`

### Environment Variables

Environment variables (see `.env.example`):

```
NEXT_PUBLIC_CLIENT_ID=<OAuth2 client ID - exposed to client>
CLIENT_SECRET=<OAuth2 client secret - server-side only>
NEXT_PUBLIC_BFH_API_BASE_URL=https://api.bravefrontierheroes.com (optional, has default)
NEXT_PUBLIC_BFH_AUTH_URL=https://auth.bravefrontierheroes.com/oauth2/auth (optional, has default)
NEXT_PUBLIC_BFH_TOKEN_URL=https://auth.bravefrontierheroes.com/oauth2/token (optional, has default)
```

**Important**:
- `NEXT_PUBLIC_CLIENT_ID` is required for OAuth2 authentication and is exposed to the client (this is standard for OAuth2 public clients)
- `CLIENT_SECRET` is required for server-side token exchange and must NEVER be exposed to the client
- API endpoint URLs have default values and are optional
- When modifying default values, edit `src/config/env.ts` instead of scattered across files

## API Client Generation

This project uses Orval to auto-generate TypeScript API clients from the BFH OpenAPI spec:

- **Config**: `orval.config.ts`
- **Source**: `https://api.bravefrontierheroes.com/swagger/doc.json`
- **Output**: `src/api/generated/` (React Query hooks, split by tags)
- **Models**: `src/api/model/`
- **Custom Axios Instance**: `src/api/mutator/custom-instance.ts`

After changing the OpenAPI spec or configuration, run:
```bash
npm run generate:api
```

### Using Generated API Hooks

**IMPORTANT**: Always use Orval-generated React Query hooks for BFH API calls. Do NOT create custom API routes or use fetch directly.

```typescript
// ✅ CORRECT - Use Orval generated hooks
import { useGetV1Me } from '@/src/api/generated/user/user';
import { useGetV1MeUnits } from '@/src/api/generated/assets/assets';

const { data: userData, isLoading, error } = useGetV1Me();
const { data: units } = useGetV1MeUnits();

// ❌ WRONG - Don't create intermediate API routes
const response = await fetch('/api/user/me');
```

**Benefits of using Orval hooks**:
- Automatic authentication (token injection via custom-instance.ts)
- Type-safe API calls
- Built-in caching, refetching, and error handling via React Query
- Automatic 401 error handling (redirects to login)

The generated hooks use TanStack Query (React Query) and are automatically typed.

## Architecture

### Authentication Flow

1. User clicks login → redirects to BFH OAuth2 authorization page (`NEXT_PUBLIC_BFH_AUTH_URL`)
2. After authorization, BFH redirects to `/api/auth/callback` with authorization code
3. Server-side route handler exchanges code for access token using `CLIENT_SECRET` (Basic Auth)
4. Access token stored in cookie (`bfh_access_token`, httpOnly: false for client-side access)
5. Refresh token stored if provided (`bfh_refresh_token`, httpOnly: true)
6. User redirected to `/dashboard`

**Key files**:
- Login UI: `app/login/page.tsx`
- OAuth callback: `app/api/auth/callback/route.ts`
- Logout: `app/api/auth/logout/route.ts`

**Note**: Access token is stored with `httpOnly: false` to allow Orval-generated hooks to access it via `js-cookie` in the custom Axios instance. Refresh token remains httpOnly for security.

### API Request Flow

1. Orval-generated hooks use the custom Axios instance from `src/api/mutator/custom-instance.ts`
2. Request interceptor automatically reads `bfh_access_token` cookie via `js-cookie`
3. Request interceptor adds `Authorization: Bearer <token>` header to all requests
4. Response interceptor handles 401 errors by:
   - Removing the cookie
   - Redirecting to `/login`

All authentication is handled transparently by the custom instance - no manual token management needed.

### Route Structure

- **App Router**: Uses Next.js 16 App Router
- **API Routes**: Minimal server-side handlers in `app/api/`
  - `auth/callback/route.ts` - OAuth2 callback handler
  - `auth/logout/route.ts` - Session cleanup
  - `hero/metadata/[id]/route.ts` - Hero metadata proxy (legacy, consider migrating to Orval)
- **Pages**:
  - `app/page.tsx` - Root (redirects to login)
  - `app/login/page.tsx` - Login page
  - `app/dashboard/page.tsx` - Main dashboard (uses Orval hooks directly)

### Key Components

- **QueryProvider** (`src/components/providers/query-provider.tsx`): TanStack Query setup with client-side rendering
- **UnitCard** (`src/components/unit-card.tsx`): Displays hero metadata by fetching from `https://core.bravefrontierheroes.com/metadata/units/{heroId}`
- **BattleReplayLink** (`src/components/battle-replay-link.tsx`): Generates battle replay URLs
- **UI Components** (`src/components/ui/`): shadcn/ui components with glassmorphism styling

### Utility Functions

Located in `src/lib/utils.ts`:

```typescript
// Tailwind class merging
cn(...inputs: ClassValue[]): string

// Generate battle log JSON URL
getBattleLogUrl(battleId: number | string): string
// Returns: https://rsc.bravefrontierheroes.com/battle/duel/{first_6_digits}/{battleId}.json

// Generate battle replay page URL
getBattleReplayUrl(battleId: number | string, lang?: string): string
// Returns: https://bravefrontierheroes.com/{lang}/battle/{battleId}

// Generate hero metadata URL
getHeroMetadataUrl(heroId: number | string): string
// Returns: https://core.bravefrontierheroes.com/metadata/units/{heroId}
```

## Styling

- **Framework**: Tailwind CSS 4 with PostCSS
- **Design System**: Custom glassmorphism theme
- **Component Library**: shadcn/ui (configured via `components.json`)
- **Custom Classes**: `.glass`, `.glass-card`, `.glass-hover` for glassmorphism effects

## Important Notes

- The app runs on **port 3500** (not the default 3000)
- All OAuth2 redirect URIs must use `{origin}/api/auth/callback`
- **ALWAYS use Orval-generated hooks** for BFH API calls - never create custom fetch wrappers or intermediate API routes
- Access tokens are stored in cookies with `httpOnly: false` to allow client-side access by Orval hooks
- The custom Axios instance (`src/api/mutator/custom-instance.ts`) handles automatic token injection and 401 redirects
- Generated API code should not be manually edited - regenerate with `npm run generate:api`
- When adding new API endpoints, regenerate the client and import the new hooks directly
