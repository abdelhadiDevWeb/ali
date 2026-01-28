# Supabase Storage Setup Guide

## Overview

This guide explains how to set up Supabase Storage for file uploads. All files are stored in a single `media` bucket with organized folders.

## Required Storage Bucket

You need to create **ONE** public storage bucket in Supabase:

1. **media** - Main bucket for all file types
   - Contains folders: `audio/`, `images/`, `vd/`, `pdf/`

## Setup Steps

### Step 1: Create Storage Bucket

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **New bucket**
4. Create the bucket with these settings:

#### Media Bucket
- **Name**: `media`
- **Public bucket**: ✅ Enabled (check this)
- Click **Create bucket**

**Note**: The folders (`audio/`, `images/`, `vd/`, `pdf/`) will be created automatically when you upload files. You don't need to create them manually.

### Step 2: Set Up Storage Policies (RLS)

For the media bucket, you need to set up Row Level Security policies:

1. Go to **Storage** → Select `media` bucket → **Policies**
2. Click **New Policy**
3. Create the following policies:

#### Policy 1: Public Read Access
- **Policy name**: `Public Access`
- **Allowed operation**: SELECT
- **Policy definition**:
```sql
bucket_id = 'media'
```

#### Policy 2: Authenticated Upload
- **Policy name**: `Authenticated Upload`
- **Allowed operation**: INSERT
- **Policy definition**:
```sql
bucket_id = 'media'
AND auth.role() = 'authenticated'
```

#### Policy 3: Authenticated Update
- **Policy name**: `Authenticated Update`
- **Allowed operation**: UPDATE
- **Policy definition**:
```sql
bucket_id = 'media'
AND auth.role() = 'authenticated'
```

#### Policy 4: Authenticated Delete
- **Policy name**: `Authenticated Delete`
- **Allowed operation**: DELETE
- **Policy definition**:
```sql
bucket_id = 'media'
AND auth.role() = 'authenticated'
```

### Step 3: Alternative - Use SQL Editor

You can also run SQL commands in the SQL Editor:

```sql
-- Create media bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Create policies for media bucket
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'media');

CREATE POLICY "Authenticated Upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated Update" ON storage.objects
FOR UPDATE USING (bucket_id = 'media' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated Delete" ON storage.objects
FOR DELETE USING (bucket_id = 'media' AND auth.role() = 'authenticated');
```

## File Upload Features

### Supported File Types

**Audio Files:**
- MP3, WAV, OGG, M4A
- Stored in: `media/audio/`
- Max size: 50MB

**Images:**
- JPG, JPEG, PNG, GIF, WEBP
- Stored in: `media/images/`
- Max size: 50MB

**Videos:**
- MP4, WEBM, OGG, MOV
- Stored in: `media/vd/`
- Max size: 50MB

**PDF Files:**
- PDF
- Stored in: `media/pdf/`
- Max size: 50MB

### Upload Process

1. **Select File**: Click the upload area to select a file from your PC
2. **Preview**: For images and videos, you'll see a preview
3. **Upload**: Click the "Upload" button to upload to Supabase Storage
4. **Automatic URL**: The file URL is automatically saved to the form
5. **Save**: Submit the form to save the audio entry with file URLs

### Features

- ✅ File type validation
- ✅ File size validation (50MB max)
- ✅ Image and video preview before upload
- ✅ Upload progress indicator
- ✅ Automatic URL generation
- ✅ Remove uploaded files
- ✅ Replace existing files

## Troubleshooting

### Error: "Bucket not found"
- Make sure you've created the `media` bucket
- Check bucket name is exactly: `media`

### Error: "Permission denied"
- Check that buckets are set to public
- Verify RLS policies are set up correctly
- Make sure you're authenticated (if using auth)

### Error: "File too large"
- Maximum file size is 50MB
- Compress files if needed

### Files not uploading
- Check browser console for errors
- Verify Supabase Storage is enabled in your project
- Check network tab for failed requests

## Testing

1. Go to the Audio page in your dashboard
2. Click "Add Audio"
3. Try uploading each file type:
   - Select an audio file → Upload
   - Select an image → Upload
   - Select a video → Upload
4. Verify files appear in Supabase Storage
5. Submit the form and check the database

## Notes

- Files are stored in Supabase Storage, not directly in the database
- Only file URLs are stored in the database
- All files are in the `media` bucket, organized in folders:
  - `media/audio/` - Audio files
  - `media/images/` - Image files
  - `media/vd/` - Video files
  - `media/pdf/` - PDF files
- Each file gets a unique name to prevent conflicts
- Folders are created automatically when files are uploaded