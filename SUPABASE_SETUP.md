# Supabase Setup Guide

This guide will help you configure Supabase with your Next.js project.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- A Supabase project created

## Step 1: Get Your Supabase Credentials

1. Go to your Supabase project dashboard: https://app.supabase.com
2. Navigate to **Settings** → **API**
3. Copy the following values:
   - **Project URL** (this is your `NEXT_PUBLIC_SUPABASE_URL`)
   - **anon/public key** (this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

## Step 2: Configure Environment Variables

1. Create a `.env.local` file in the `client` directory (if it doesn't exist)
2. Add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Example:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> ⚠️ **Important**: Never commit `.env.local` to version control. It's already in `.gitignore`.

## Step 3: Verify Installation

The Supabase packages are already installed:
- `@supabase/supabase-js` - Main Supabase client library
- `@supabase/ssr` - Server-side rendering support for Next.js

## Step 4: Project Structure

The Supabase configuration is set up in the following files:

```
client/
├── lib/
│   └── supabase/
│       ├── client.ts      # Browser client (for Client Components)
│       ├── server.ts      # Server client (for Server Components/Actions)
│       ├── middleware.ts  # Middleware helper for session management
│       ├── types.ts       # TypeScript types (auto-generated)
│       └── README.md      # Usage documentation
├── middleware.ts          # Next.js middleware for session refresh
└── env.example            # Environment variables template
```

## Step 5: Usage Examples

### In Client Components

```typescript
'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function MyComponent() {
  const [data, setData] = useState(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from('your_table')
        .select('*')
      
      if (error) console.error(error)
      else setData(data)
    }
    
    fetchData()
  }, [])

  return <div>{/* Your component */}</div>
}
```

### In Server Components

```typescript
import { createClient } from '@/lib/supabase/server'

export default async function ServerComponent() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('your_table')
    .select('*')

  if (error) {
    return <div>Error: {error.message}</div>
  }

  return <div>{/* Render your data */}</div>
}
```

### Authentication Example

```typescript
'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      console.error('Login error:', error.message)
    } else {
      console.log('Logged in:', data.user)
    }
  }

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit">Login</button>
    </form>
  )
}
```

## Step 6: Generate TypeScript Types (Optional but Recommended)

To get full TypeScript support for your database schema:

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Generate types from your remote project
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/types.ts

# Or for local development
npx supabase gen types typescript --local > lib/supabase/types.ts
```

Then update the `Database` interface in `lib/supabase/types.ts`.

## Step 7: Database Setup

You have SQL initialization files in `supaBase_init/`:
- `001_tables._auth.sql` - Authentication tables
- `002_buckets.sql` - Storage buckets
- `003_functions_auth.sql` - Auth functions
- `004_realtions.auth.sql` - Table relations
- `005_tirggers.sql` - Database triggers
- `006_rls.sql` - Row Level Security policies

Run these SQL files in your Supabase SQL Editor to set up your database schema.

## Step 8: Middleware Configuration

The middleware is configured to refresh user sessions automatically. If you want to enable authentication redirects, uncomment the authentication check in `lib/supabase/middleware.ts`.

## Troubleshooting

### Environment Variables Not Working

1. Make sure `.env.local` is in the `client` directory
2. Restart your Next.js dev server after adding/changing environment variables
3. Verify variable names start with `NEXT_PUBLIC_` for client-side access

### Type Errors

1. Make sure you've generated types from your Supabase schema
2. Update the `Database` interface in `lib/supabase/types.ts`

### Session Issues

1. Check that middleware is properly configured
2. Verify cookies are being set correctly in browser DevTools

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js with Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Supabase Auth Helpers for Next.js](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
