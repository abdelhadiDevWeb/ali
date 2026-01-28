# Supabase Configuration

This directory contains the Supabase client configuration for the Next.js application.

## Files

- `client.ts` - Browser-side Supabase client (for Client Components)
- `server.ts` - Server-side Supabase client (for Server Components, Server Actions, Route Handlers)
- `middleware.ts` - Middleware helper for session management
- `types.ts` - TypeScript types for your Supabase database

## Usage

### In Client Components

```typescript
'use client'

import { createClient } from '@/lib/supabase/client'

export default function ClientComponent() {
  const supabase = createClient()
  
  // Use supabase client here
  const { data } = await supabase.from('table_name').select('*')
  
  return <div>...</div>
}
```

### In Server Components

```typescript
import { createClient } from '@/lib/supabase/server'

export default async function ServerComponent() {
  const supabase = await createClient()
  
  // Use supabase client here
  const { data } = await supabase.from('table_name').select('*')
  
  return <div>...</div>
}
```

### In Server Actions

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'

export async function myServerAction() {
  const supabase = await createClient()
  
  // Use supabase client here
  const { data } = await supabase.from('table_name').select('*')
  
  return data
}
```

## Environment Variables

Make sure you have the following environment variables set in your `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project settings:
https://app.supabase.com/project/_/settings/api

## Generating TypeScript Types

To generate TypeScript types from your Supabase database schema:

```bash
# For local development
npx supabase gen types typescript --local > lib/supabase/types.ts

# For production (requires project ID)
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/types.ts
```

Then update the `Database` interface in `types.ts` with the generated types.
