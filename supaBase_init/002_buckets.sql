-- ============================================
-- Supabase Storage Buckets Setup
-- ============================================

-- Create a single media bucket with folders for all file types
-- Note: These commands need to be run in Supabase Dashboard > Storage

-- Create the media bucket (public)
-- Run this in SQL Editor:
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Storage Policies (RLS) - REQUIRED FOR UPLOADS
-- ============================================

-- IMPORTANT: These policies must be created for file uploads to work!

-- 1. Allow public read access (anyone can view/download files)
CREATE POLICY "Public can view media files"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

-- 2. Allow anyone to upload files (you can restrict this later if needed)
-- Option A: Allow anyone to upload (for testing/development)
CREATE POLICY "Anyone can upload to media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'media');

-- Option B: Only authenticated users can upload (more secure)
-- Uncomment this and comment Option A if you want authentication required:
-- CREATE POLICY "Authenticated users can upload to media"
-- ON storage.objects FOR INSERT
-- WITH CHECK (
--   bucket_id = 'media' 
--   AND auth.role() = 'authenticated'
-- );

-- 3. Allow anyone to update files (you can restrict this later)
CREATE POLICY "Anyone can update media files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'media')
WITH CHECK (bucket_id = 'media');

-- 4. Allow anyone to delete files (you can restrict this later)
CREATE POLICY "Anyone can delete media files"
ON storage.objects FOR DELETE
USING (bucket_id = 'media');

-- ============================================
-- Alternative: More Restrictive Policies (Recommended for Production)
-- ============================================
-- If you want to restrict uploads to authenticated users only,
-- use these policies instead:

-- CREATE POLICY "Public can view media files"
-- ON storage.objects FOR SELECT
-- USING (bucket_id = 'media');

-- CREATE POLICY "Authenticated users can upload to media"
-- ON storage.objects FOR INSERT
-- WITH CHECK (
--   bucket_id = 'media' 
--   AND auth.role() = 'authenticated'
-- );

-- CREATE POLICY "Authenticated users can update media files"
-- ON storage.objects FOR UPDATE
-- USING (bucket_id = 'media' AND auth.role() = 'authenticated')
-- WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');

-- CREATE POLICY "Authenticated users can delete media files"
-- ON storage.objects FOR DELETE
-- USING (bucket_id = 'media' AND auth.role() = 'authenticated');

-- ============================================
-- Instructions:
-- ============================================
-- 1. Go to Supabase Dashboard > Storage
-- 2. Create ONE bucket:
--    - Name: media
--    - Public: Yes (enabled)
-- 3. Go to SQL Editor and run this entire file
-- 4. The folders will be created automatically when files are uploaded:
--    - audio/   (for audio files)
--    - images/  (for image files)
--    - vd/      (for video files)
--    - pdf/     (for PDF files)
--
-- Note: Folders don't need to be created manually - they are created
-- automatically when you upload files to paths like "audio/filename.mp3"
