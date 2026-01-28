# Fix Storage RLS Policy Error

## Problem

You're getting this error when uploading files:
```
Error uploading audio: new row violates row-level security policy
```

This means the Row Level Security (RLS) policies on the `storage.objects` table are blocking your uploads.

## Quick Fix

### Option 1: Using SQL Editor (Recommended)

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste this SQL code:

```sql
-- Create media bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Public can view media files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload to media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to media" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update media files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete media files" ON storage.objects;

-- Create new policies
-- 1. Allow public read access
CREATE POLICY "Public can view media files"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

-- 2. Allow anyone to upload (for development)
CREATE POLICY "Anyone can upload to media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'media');

-- 3. Allow anyone to update
CREATE POLICY "Anyone can update media files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'media')
WITH CHECK (bucket_id = 'media');

-- 4. Allow anyone to delete
CREATE POLICY "Anyone can delete media files"
ON storage.objects FOR DELETE
USING (bucket_id = 'media');
```

5. Click **Run** to execute the SQL
6. Try uploading a file again - it should work now!

### Option 2: Using Storage Dashboard UI

1. Go to **Storage** in Supabase Dashboard
2. Click on the **`media`** bucket
3. Go to **Policies** tab
4. Click **New Policy**
5. Create these 4 policies:

#### Policy 1: Public Read
- **Policy name**: `Public can view media files`
- **Allowed operation**: SELECT
- **Policy definition**: `bucket_id = 'media'`
- **Policy command**: `USING (bucket_id = 'media')`

#### Policy 2: Upload
- **Policy name**: `Anyone can upload to media`
- **Allowed operation**: INSERT
- **Policy definition**: `bucket_id = 'media'`
- **Policy command**: `WITH CHECK (bucket_id = 'media')`

#### Policy 3: Update
- **Policy name**: `Anyone can update media files`
- **Allowed operation**: UPDATE
- **Policy definition**: `bucket_id = 'media'`
- **Policy command**: 
  - **Using expression**: `bucket_id = 'media'`
  - **With check expression**: `bucket_id = 'media'`

#### Policy 4: Delete
- **Policy name**: `Anyone can delete media files`
- **Allowed operation**: DELETE
- **Policy definition**: `bucket_id = 'media'`
- **Policy command**: `USING (bucket_id = 'media')`

## For Production (More Secure)

If you want to restrict uploads to authenticated users only, use these policies instead:

```sql
-- Public read access
CREATE POLICY "Public can view media files"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

-- Only authenticated users can upload
CREATE POLICY "Authenticated users can upload to media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'media' 
  AND auth.role() = 'authenticated'
);

-- Only authenticated users can update
CREATE POLICY "Authenticated users can update media files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'media' AND auth.role() = 'authenticated')
WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');

-- Only authenticated users can delete
CREATE POLICY "Authenticated users can delete media files"
ON storage.objects FOR DELETE
USING (bucket_id = 'media' AND auth.role() = 'authenticated');
```

## Verify It Works

After setting up the policies:

1. Go to your dashboard Audio page
2. Try uploading a file
3. Check the browser console for any errors
4. The file should upload successfully!

## Troubleshooting

### Still getting errors?

1. **Check bucket exists**: Go to Storage → Make sure `media` bucket exists
2. **Check bucket is public**: The bucket should have "Public" enabled
3. **Check policies**: Go to Storage → `media` bucket → Policies → Make sure all 4 policies exist
4. **Clear browser cache**: Sometimes cached errors persist
5. **Check browser console**: Look for more detailed error messages

### Error: "policy already exists"

If you get this error, drop the existing policies first:

```sql
DROP POLICY IF EXISTS "Public can view media files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload to media" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update media files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete media files" ON storage.objects;
```

Then create them again using the SQL above.

## Security Note

The policies above allow **anyone** to upload files. For production, you should:
- Use authenticated-only policies
- Implement proper authentication
- Add file size limits
- Add file type validation (already done in the code)
