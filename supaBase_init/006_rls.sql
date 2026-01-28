-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE admin ENABLE ROW LEVEL SECURITY;
ALTER TABLE category ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio ENABLE ROW LEVEL SECURITY;
ALTER TABLE work ENABLE ROW LEVEL SECURITY;
ALTER TABLE certification ENABLE ROW LEVEL SECURITY;
ALTER TABLE reseaux_sociaux ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Admin Table Policies
-- ============================================

-- Only authenticated admins can read their own data
CREATE POLICY "Admins can view own data"
    ON admin FOR SELECT
    USING (auth.uid()::text = id::text);

-- Only authenticated admins can update their own data
CREATE POLICY "Admins can update own data"
    ON admin FOR UPDATE
    USING (auth.uid()::text = id::text);

-- Only service role can insert/delete admins (for security)
-- This should be done through backend/admin panel

-- ============================================
-- Category Table Policies
-- ============================================

-- Public read access (everyone can view categories)
CREATE POLICY "Categories are viewable by everyone"
    ON category FOR SELECT
    USING (true);

-- Only authenticated admins can modify categories
CREATE POLICY "Only admins can insert categories"
    ON category FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin
            WHERE admin.id::text = auth.uid()::text
        )
    );

CREATE POLICY "Only admins can update categories"
    ON category FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM admin
            WHERE admin.id::text = auth.uid()::text
        )
    );

CREATE POLICY "Only admins can delete categories"
    ON category FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM admin
            WHERE admin.id::text = auth.uid()::text
        )
    );

-- ============================================
-- Audio Table Policies
-- ============================================

-- Public read access (everyone can view audio)
CREATE POLICY "Audio is viewable by everyone"
    ON audio FOR SELECT
    USING (true);

-- Only authenticated admins can modify audio
CREATE POLICY "Only admins can insert audio"
    ON audio FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin
            WHERE admin.id::text = auth.uid()::text
        )
    );

CREATE POLICY "Only admins can update audio"
    ON audio FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM admin
            WHERE admin.id::text = auth.uid()::text
        )
    );

CREATE POLICY "Only admins can delete audio"
    ON audio FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM admin
            WHERE admin.id::text = auth.uid()::text
        )
    );

-- ============================================
-- Work Table Policies
-- ============================================

-- Public read access (everyone can view work)
CREATE POLICY "Work is viewable by everyone"
    ON work FOR SELECT
    USING (true);

-- Only authenticated admins can modify work
CREATE POLICY "Only admins can insert work"
    ON work FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin
            WHERE admin.id::text = auth.uid()::text
        )
    );

CREATE POLICY "Only admins can update work"
    ON work FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM admin
            WHERE admin.id::text = auth.uid()::text
        )
    );

CREATE POLICY "Only admins can delete work"
    ON work FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM admin
            WHERE admin.id::text = auth.uid()::text
        )
    );

-- ============================================
-- Certification Table Policies
-- ============================================

-- Public read access (everyone can view certifications)
CREATE POLICY "Certifications are viewable by everyone"
    ON certification FOR SELECT
    USING (true);

-- Only authenticated admins can modify certifications
CREATE POLICY "Only admins can insert certifications"
    ON certification FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin
            WHERE admin.id::text = auth.uid()::text
        )
    );

CREATE POLICY "Only admins can update certifications"
    ON certification FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM admin
            WHERE admin.id::text = auth.uid()::text
        )
    );

CREATE POLICY "Only admins can delete certifications"
    ON certification FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM admin
            WHERE admin.id::text = auth.uid()::text
        )
    );

-- ============================================
-- Reseaux Sociaux Table Policies
-- ============================================

-- Public read access (everyone can view social links)
CREATE POLICY "Social networks are viewable by everyone"
    ON reseaux_sociaux FOR SELECT
    USING (true);

-- Only authenticated admins can modify social links
CREATE POLICY "Only admins can insert social networks"
    ON reseaux_sociaux FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin
            WHERE admin.id::text = auth.uid()::text
        )
    );

CREATE POLICY "Only admins can update social networks"
    ON reseaux_sociaux FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM admin
            WHERE admin.id::text = auth.uid()::text
        )
    );

CREATE POLICY "Only admins can delete social networks"
    ON reseaux_sociaux FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM admin
            WHERE admin.id::text = auth.uid()::text
        )
    );

-- ============================================
-- Notes:
-- ============================================
-- 1. These policies assume admin.id matches auth.uid()
--    You may need to adjust based on your authentication setup
-- 2. For production, consider more granular permissions
-- 3. You might want to create a separate admin_roles table
--    for role-based access control (RBAC)
-- 4. Service role can bypass RLS - use carefully in backend
