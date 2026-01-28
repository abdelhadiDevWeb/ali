# Audio Playback Fix Guide

## Problem

Audio files are not playing in the audio player.

## Common Causes & Solutions

### 1. CORS Issues

Supabase Storage might need CORS configuration:

1. Go to Supabase Dashboard → **Storage** → **Settings**
2. Scroll to **CORS Configuration**
3. Add your domain or use `*` for development:
   ```
   http://localhost:3000
   http://localhost:3000/*
   ```
4. Or use `*` for all origins (development only):
   ```
   *
   ```

### 2. Check Audio URL Format

The audio URL should be a full Supabase Storage URL like:
```
https://[project-id].supabase.co/storage/v1/object/public/media/audio/filename.mp3
```

### 3. Verify File Upload

1. Go to Supabase Dashboard → **Storage** → **media** bucket
2. Check if files are in the `audio/` folder
3. Click on a file to see its public URL
4. Copy the URL and test it directly in the browser

### 4. Browser Console Errors

Open browser DevTools (F12) → Console tab:
- Look for CORS errors
- Look for 404 errors (file not found)
- Look for audio format errors

### 5. Test Audio URL Directly

1. Copy the audio URL from the database
2. Paste it in a new browser tab
3. If it plays there, the issue is with the player
4. If it doesn't play, the issue is with the file or URL

### 6. Check File Format

Make sure the uploaded file is a valid audio format:
- MP3, WAV, OGG, M4A
- Some browsers have format limitations

### 7. Content Security Policy

The CSP has been updated to allow media sources. If you still have issues:
- Check browser console for CSP violations
- The CSP now includes: `media-src 'self' https: blob: data:`

## Quick Debug Steps

1. **Check the URL**:
   ```javascript
   // In browser console, check the audio URL
   console.log(audio.audio_file)
   ```

2. **Test in new tab**:
   - Right-click on the audio player
   - Select "Open audio in new tab"
   - See if it plays

3. **Check network tab**:
   - Open DevTools → Network tab
   - Try to play audio
   - Look for failed requests (red)
   - Check the response headers

4. **Verify file exists**:
   - Go to Supabase Storage
   - Navigate to `media/audio/` folder
   - Verify the file exists

## Updated Audio Player Features

The audio player now includes:
- ✅ Multiple source types (MP3, WAV, OGG, M4A)
- ✅ Error handling with console logging
- ✅ Download link
- ✅ Open in new tab link
- ✅ Better styling
- ✅ CORS support (`crossOrigin="anonymous"`)

## If Still Not Working

1. **Check Supabase Storage CORS**:
   - Storage → Settings → CORS
   - Add your domain

2. **Check RLS Policies**:
   - Make sure public read access is enabled
   - See `FIX_STORAGE_RLS.md`

3. **Check File URL**:
   - The URL should be from Supabase Storage
   - Format: `https://[project].supabase.co/storage/v1/object/public/media/audio/...`

4. **Try different browser**:
   - Some browsers have audio format limitations
   - Try Chrome, Firefox, or Edge

5. **Check file size**:
   - Very large files might not load
   - Try a smaller test file first
