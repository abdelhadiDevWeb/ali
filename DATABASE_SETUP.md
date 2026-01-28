# Database Setup Guide

This guide explains how to set up the database tables in Supabase.

## Database Schema Overview

The database consists of 6 main tables:

1. **admin** - Administrator accounts
2. **category** - Categories for organizing content
3. **audio** - Audio files with metadata
4. **work** - Portfolio work items
5. **certification** - Certifications and achievements
6. **reseaux_sociaux** - Social media links

## Setup Instructions

### Step 1: Access Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Run SQL Files in Order

Execute the SQL files in this order:

#### 1. Create Tables
```sql
-- Run: 001_tables._auth.sql
```
This creates all the tables with proper structure, indexes, and triggers.

#### 2. Set Up Buckets (if using file storage)
```sql
-- Run: 002_buckets.sql (if you have file storage setup)
```

#### 3. Create Functions
```sql
-- Run: 003_functions_auth.sql (if you have auth functions)
```

#### 4. Set Up Relations
```sql
-- Run: 004_realtions.auth.sql
```
This sets up foreign key relationships (already included in 001).

#### 5. Create Triggers
```sql
-- Run: 005_tirggers.sql
```
This creates validation triggers (some are already in 001).

#### 6. Enable Row Level Security
```sql
-- Run: 006_rls.sql
```
This enables RLS and creates security policies.

### Step 3: Verify Tables

After running the SQL files, verify the tables were created:

1. Go to **Table Editor** in Supabase
2. You should see all 6 tables listed
3. Check that indexes and triggers are present

## Table Structures

### 1. Admin Table
```sql
admin
├── id (UUID, Primary Key)
├── first_name (VARCHAR)
├── last_name (VARCHAR)
├── email (VARCHAR, Unique)
├── password_hash (TEXT) -- Never store plain passwords!
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

### 2. Category Table
```sql
category
├── id (UUID, Primary Key)
├── name (VARCHAR, Unique)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

### 3. Audio Table
```sql
audio
├── id (UUID, Primary Key)
├── title (VARCHAR)
├── description (TEXT)
├── audio_file (TEXT) -- File URL/path
├── image (TEXT) -- Image URL/path
├── video (TEXT) -- Video URL/path
├── category_id (UUID, Foreign Key → category.id)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

### 4. Work Table
```sql
work
├── id (UUID, Primary Key)
├── title (VARCHAR)
├── description (TEXT)
├── image (TEXT) -- Image URL/path
├── video (TEXT) -- Video URL/path
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

### 5. Certification Table
```sql
certification
├── id (UUID, Primary Key)
├── title (VARCHAR)
├── description (TEXT)
├── image (TEXT) -- Image URL/path
├── date (DATE)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

### 6. Reseaux Sociaux Table
```sql
reseaux_sociaux
├── id (UUID, Primary Key)
├── name (VARCHAR) -- e.g., 'Facebook', 'Twitter'
├── url (TEXT) -- Social media URL
├── icon (VARCHAR) -- Optional icon name
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

## Features Included

### Automatic Timestamps
- `created_at` - Automatically set on insert
- `updated_at` - Automatically updated on row modification

### Indexes
- Email lookup on admin table
- Category name lookup
- Audio by category, title, and date
- Work by title and date
- Certifications by title and date
- Social networks by name

### Validation Triggers
- Email format validation
- Required field validation (titles, names)
- URL format validation for social networks

### Row Level Security (RLS)
- Public read access for content tables (category, audio, work, certification, reseaux_sociaux)
- Admin-only write access for all tables
- Admin can only view/update their own data

## Security Notes

1. **Password Storage**: The `admin` table stores `password_hash`, not plain passwords. Always hash passwords before storing.

2. **RLS Policies**: Row Level Security is enabled. Adjust policies in `006_rls.sql` based on your needs.

3. **Foreign Keys**: The `audio.category_id` references `category.id`. If a category is deleted, the audio's category_id is set to NULL (not deleted).

## Usage Examples

### Insert a Category
```sql
INSERT INTO category (name) 
VALUES ('Music');
```

### Insert Audio with Category
```sql
INSERT INTO audio (title, description, category_id)
VALUES (
  'My Audio Track',
  'A great audio track',
  (SELECT id FROM category WHERE name = 'Music')
);
```

### Query Audio with Category
```sql
SELECT 
  audio.*,
  category.name as category_name
FROM audio
LEFT JOIN category ON audio.category_id = category.id
ORDER BY audio.created_at DESC;
```

## Next Steps

1. **Create Storage Buckets**: Set up Supabase Storage buckets for files (audio, images, videos)
2. **Set Up Authentication**: Configure Supabase Auth to work with admin table
3. **Generate TypeScript Types**: Run `npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/types.ts`
4. **Test RLS Policies**: Verify that RLS is working as expected
5. **Create Admin Account**: Insert your first admin account (with hashed password)

## Troubleshooting

### Error: "relation already exists"
- Tables already exist. You can either drop them first or use `CREATE TABLE IF NOT EXISTS`.

### Error: "permission denied"
- Check RLS policies. You may need to use the service role key for initial setup.

### Error: "foreign key constraint"
- Make sure categories exist before inserting audio with category_id.

## Support

For issues or questions:
- Check Supabase documentation: https://supabase.com/docs
- Review SQL files for comments and structure
- Verify RLS policies match your requirements
