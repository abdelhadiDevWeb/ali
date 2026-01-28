# Dashboard Documentation

## Overview

A modern, animated dashboard for managing content with Supabase integration.

## URL Structure

The dashboard is accessible at:
- Base URL: `/dashbord/@65@&@/alilou_kermiche`
- Profile: `/dashbord/@65@&@/alilou_kermiche` (default)
- Categories: `/dashbord/@65@&@/alilou_kermiche/category`
- Audio: `/dashbord/@65@&@/alilou_kermiche/audio`
- Certifications: `/dashbord/@65@&@/alilou_kermiche/certification`

## Features

### 1. Profile Page
- View and edit admin profile
- Update first name, last name, and email
- Real-time updates with Supabase

### 2. Category Management
- **Add Categories**: Create new categories with validation
- **List Categories**: View all categories in a grid layout
- **Edit Categories**: Update category names
- **Delete Categories**: Remove categories with confirmation

### 3. Audio Management
- **Add Audio**: Create audio entries with:
  - Title (required)
  - Description
  - Audio file URL
  - Image URL
  - Video URL
  - Category selection
- **List Audio**: View all audio files with category badges
- **Edit Audio**: Update existing audio entries
- **Delete Audio**: Remove audio entries with confirmation

### 4. Certification Management
- **Add Certifications**: Create certification entries with:
  - Title (required)
  - Description
  - Date (required)
  - PDF upload (PDF only)
  - Image URL (for preview/thumbnail)
- **List Certifications**: View all certifications in a card grid
- **Update Certifications**: Edit existing certifications
- **PDF Upload**: Upload and update PDF files (requires Supabase Storage setup)

## UI Features

### Modern Design
- Gradient backgrounds
- Smooth animations
- Dark mode support
- Responsive layout (mobile, tablet, desktop)

### Animations
- Fade-in animations for page content
- Slide-down animations for forms
- Hover effects on interactive elements
- Smooth transitions

### Components
- Sidebar navigation with active state indicators
- Form modals with validation
- Card-based layouts
- Icon-based UI (Lucide React icons)

## Setup

### Prerequisites
1. Supabase project configured
2. Database tables created (run SQL files)
3. Environment variables set

### Installation
```bash
npm install
```

### Dependencies
- `lucide-react` - Icons
- `@supabase/ssr` - Supabase SSR support
- `@supabase/supabase-js` - Supabase client

## Usage

### Accessing the Dashboard

1. Start the development server:
```bash
npm run dev
```

2. Navigate to:
```
http://localhost:3000/dashbord/@65@&@/alilou_kermiche
```

### Adding Content

1. **Categories**: Click "Add Category" → Enter name → Create
2. **Audio**: Click "Add Audio" → Fill form → Create
3. **Certifications**: Click "Add Certification" → Fill form → Upload PDF → Create

### Editing Content

1. Hover over any item in the list
2. Click the edit icon (pencil)
3. Modify the form
4. Click "Update"

### Deleting Content

1. Hover over any item
2. Click the delete icon (trash)
3. Confirm deletion

## File Structure

```
client/
├── app/
│   └── dashbord/
│       └── [...slug]/
│           └── page.tsx          # Dashboard route handler
├── components/
│   └── dashboard/
│       ├── DashboardLayout.tsx   # Main layout with sidebar
│       ├── ProfilePage.tsx       # Profile management
│       ├── CategoryPage.tsx       # Category CRUD
│       ├── AudioPage.tsx         # Audio CRUD
│       └── CertificationPage.tsx # Certification CRUD
└── lib/
    └── supabase/
        └── client.ts             # Supabase client
```

## Supabase Storage Setup (for PDFs)

To enable PDF uploads for certifications:

1. Create a storage bucket in Supabase:
   - Go to Storage in Supabase dashboard
   - Create bucket named `certifications`
   - Set to public or configure RLS

2. Update `CertificationPage.tsx`:
   - Uncomment the Supabase Storage upload code
   - Configure bucket name and path

## Security

- Row Level Security (RLS) enabled on all tables
- Admin-only write access
- Public read access for content
- Input validation on all forms
- CSRF protection (via middleware)

## Customization

### Colors
Edit Tailwind classes in components to change color scheme:
- Primary: `from-blue-500 to-indigo-600`
- Background: `from-slate-50 via-blue-50 to-indigo-50`

### Animations
Customize animations in `globals.css`:
- `fade-in`: Page content
- `slide-down`: Forms

### Layout
Modify `DashboardLayout.tsx` to:
- Change sidebar width
- Add/remove menu items
- Customize header

## Troubleshooting

### Data not loading
- Check Supabase connection
- Verify environment variables
- Check browser console for errors
- Verify RLS policies allow reads

### Forms not submitting
- Check network tab for API errors
- Verify required fields are filled
- Check Supabase RLS policies allow writes

### PDF upload not working
- Ensure Supabase Storage is configured
- Check bucket permissions
- Verify file is PDF format

## Future Enhancements

- [ ] File upload UI for images/audio/video
- [ ] Bulk operations
- [ ] Search and filtering
- [ ] Pagination for large lists
- [ ] Image previews
- [ ] Audio/video players
- [ ] Export functionality
- [ ] Activity logs

## Support

For issues or questions:
- Check Supabase documentation
- Review component code
- Check browser console for errors
