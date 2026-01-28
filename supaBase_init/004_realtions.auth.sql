-- ============================================
-- Table Relations and Foreign Keys
-- ============================================

-- Note: Foreign keys are already defined in 001_tables._auth.sql
-- This file is for additional relations if needed

-- ============================================
-- Additional Relations (if needed in future)
-- ============================================

-- Example: If you want to add a many-to-many relationship
-- between audio and categories (currently one-to-many)

-- CREATE TABLE IF NOT EXISTS audio_categories (
--     audio_id UUID REFERENCES audio(id) ON DELETE CASCADE,
--     category_id UUID REFERENCES category(id) ON DELETE CASCADE,
--     PRIMARY KEY (audio_id, category_id)
-- );

-- ============================================
-- Cascade Delete Rules
-- ============================================

-- Audio -> Category: SET NULL (if category is deleted, audio category_id becomes NULL)
-- This is already set in the audio table definition

-- ============================================
-- Future Relations (commented out for reference)
-- ============================================

-- If you need to link certifications to admin:
-- ALTER TABLE certification ADD COLUMN admin_id UUID REFERENCES admin(id) ON DELETE SET NULL;

-- If you need to link work to admin:
-- ALTER TABLE work ADD COLUMN admin_id UUID REFERENCES admin(id) ON DELETE SET NULL;

-- If you need to link audio to admin:
-- ALTER TABLE audio ADD COLUMN admin_id UUID REFERENCES admin(id) ON DELETE SET NULL;
