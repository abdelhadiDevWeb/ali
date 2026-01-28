-- ============================================
-- Database Tables Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. Admin Table
-- ============================================
CREATE TABLE IF NOT EXISTS admin (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password TEXT NOT NULL, -- Store hashed password, never plain text
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for email lookup
CREATE INDEX IF NOT EXISTS idx_admin_email ON admin(email);

-- ============================================
-- 2. Category Table
-- ============================================
CREATE TABLE IF NOT EXISTS category (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for category name lookup
CREATE INDEX IF NOT EXISTS idx_category_name ON category(name);

-- ============================================
-- 3. Audio Table
-- ============================================
CREATE TABLE IF NOT EXISTS audio (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    audio_file TEXT, -- URL or path to audio file
    image TEXT, -- URL or path to image file
    video TEXT, -- URL or path to video file (Vd)
    category_id UUID REFERENCES category(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for audio table
CREATE INDEX IF NOT EXISTS idx_audio_category ON audio(category_id);
CREATE INDEX IF NOT EXISTS idx_audio_title ON audio(title);
CREATE INDEX IF NOT EXISTS idx_audio_created_at ON audio(created_at DESC);

-- ============================================
-- 4. Work Table
-- ============================================
CREATE TABLE IF NOT EXISTS work (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image TEXT, -- URL or path to image file
    video TEXT, -- URL or path to video file
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for work table
CREATE INDEX IF NOT EXISTS idx_work_title ON work(title);
CREATE INDEX IF NOT EXISTS idx_work_created_at ON work(created_at DESC);

-- ============================================
-- 5. Certification Table
-- ============================================
CREATE TABLE IF NOT EXISTS certification (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image TEXT, -- URL or path to image file
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for certification table
CREATE INDEX IF NOT EXISTS idx_certification_title ON certification(title);
CREATE INDEX IF NOT EXISTS idx_certification_date ON certification(date DESC);
CREATE INDEX IF NOT EXISTS idx_certification_created_at ON certification(created_at DESC);

-- ============================================
-- 6. Reseaux Sociaux (Social Networks) Table
-- ============================================
CREATE TABLE IF NOT EXISTS reseaux_sociaux (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL, -- e.g., 'Facebook', 'Twitter', 'LinkedIn'
    url TEXT NOT NULL,
    icon VARCHAR(50), -- Optional: icon name or class
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for social networks
CREATE INDEX IF NOT EXISTS idx_reseaux_sociaux_name ON reseaux_sociaux(name);

-- ============================================
-- Function to update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================
-- Triggers to auto-update updated_at
-- ============================================
CREATE TRIGGER update_admin_updated_at BEFORE UPDATE ON admin
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_category_updated_at BEFORE UPDATE ON category
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_audio_updated_at BEFORE UPDATE ON audio
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_work_updated_at BEFORE UPDATE ON work
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_certification_updated_at BEFORE UPDATE ON certification
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reseaux_sociaux_updated_at BEFORE UPDATE ON reseaux_sociaux
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Comments for documentation
-- ============================================
COMMENT ON TABLE admin IS 'Administrator accounts with authentication credentials';
COMMENT ON TABLE category IS 'Categories for organizing audio content';
COMMENT ON TABLE audio IS 'Audio files with metadata and optional video/image';
COMMENT ON TABLE work IS 'Portfolio work items with images and videos';
COMMENT ON TABLE certification IS 'Certifications and achievements';
COMMENT ON TABLE reseaux_sociaux IS 'Social media links and profiles';

COMMENT ON COLUMN admin.password_hash IS 'Hashed password - never store plain text passwords';
COMMENT ON COLUMN audio.category_id IS 'Foreign key reference to category table';
COMMENT ON COLUMN audio.audio_file IS 'URL or storage path to audio file';
COMMENT ON COLUMN audio.video IS 'URL or storage path to video file (Vd field)';
