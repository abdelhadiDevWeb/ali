# Environment Variables Setup

## Quick Fix for Supabase Error

If you're seeing the error:
```
Your project's URL and Key are required to create a Supabase client!
```

You need to set up your environment variables.

## Steps to Fix

### 1. Create `.env.local` file

In the `client` directory, create a file named `.env.local` (if it doesn't exist).

### 2. Add Your Supabase Credentials

Open `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Get Your Supabase Credentials

1. Go to your Supabase project dashboard: https://app.supabase.com
2. Navigate to **Settings** → **API**
3. Copy the following values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4. Example `.env.local` File

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.example_key_here
```

### 5. Restart Your Dev Server

After adding the environment variables:

1. Stop your dev server (Ctrl+C)
2. Start it again:
   ```bash
   npm run dev
   ```

## Important Notes

- **Never commit `.env.local`** to version control (it's already in `.gitignore`)
- Environment variables starting with `NEXT_PUBLIC_` are exposed to the browser
- The `anon` key is safe to use in client-side code (it's public)
- Never use the `service_role` key in client-side code

## Verification

After setting up, you should be able to:
- Access the dashboard without errors
- See data loading from Supabase
- Use all CRUD operations

## Troubleshooting

### Still seeing the error?

1. **Check file location**: Make sure `.env.local` is in the `client` directory (same level as `package.json`)
2. **Check variable names**: Must be exactly `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. **Restart server**: Environment variables are loaded at startup
4. **Check for typos**: No spaces around the `=` sign
5. **Check quotes**: Don't add quotes around the values

### Example of correct format:
```env
NEXT_PUBLIC_SUPABASE_URL=https://abc.supabase.co
```

### Example of incorrect format:
```env
NEXT_PUBLIC_SUPABASE_URL = "https://abc.supabase.co"  # ❌ Wrong - has spaces and quotes
```

## Need Help?

- Check Supabase docs: https://supabase.com/docs
- Verify your project settings: https://app.supabase.com/project/_/settings/api
- Check the console for more detailed error messages
