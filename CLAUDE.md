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

The generated hooks use TanStack Query (React Query) and are automatically typed.

## Architecture

### Authentication Flow

1. User clicks login → redirects to BFH OAuth2 authorization page (`NEXT_PUBLIC_BFH_AUTH_URL`)
2. After authorization, BFH redirects to `/api/auth/callback` with authorization code
3. Server-side route handler exchanges code for access token using `CLIENT_SECRET` (Basic Auth)
4. Access token stored in HTTPOnly cookie (`bfh_access_token`)
5. Refresh token stored if provided (`bfh_refresh_token`)
6. User redirected to `/dashboard`

**Key files**:
- Login UI: `app/login/page.tsx`
- OAuth callback: `app/api/auth/callback/route.ts`
- Logout: `app/api/auth/logout/route.ts`

### API Request Flow

1. All API requests use the custom Axios instance from `src/api/mutator/custom-instance.ts`
2. Request interceptor automatically adds `Authorization: Bearer <token>` header from `bfh_access_token` cookie
3. Response interceptor handles 401 errors by:
   - Removing the cookie
   - Redirecting to `/login`

### Route Structure

- **App Router**: Uses Next.js 16 App Router
- **API Routes**: Server-side API handlers in `app/api/`
  - `auth/callback/route.ts` - OAuth2 callback handler
  - `auth/logout/route.ts` - Session cleanup
  - `user/me/route.ts` - Proxy for user info (alternative to direct API call)
- **Pages**:
  - `app/page.tsx` - Root (redirects to login)
  - `app/login/page.tsx` - Login page
  - `app/dashboard/page.tsx` - Main dashboard (requires auth)

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
- Access tokens are stored client-side in cookies (not HTTPOnly for client-side API calls) but managed via js-cookie
- The custom Axios instance handles automatic token injection and 401 redirects
- Generated API code should not be manually edited - regenerate with `npm run generate:api`
