-- ============================================
-- Database Triggers
-- ============================================

-- Note: The update_updated_at_column() function and triggers
-- are already created in 001_tables._auth.sql

-- ============================================
-- Additional Triggers (if needed)
-- ============================================

-- Example: Trigger to log admin actions
-- CREATE TABLE IF NOT EXISTS admin_audit_log (
--     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--     admin_id UUID REFERENCES admin(id),
--     action VARCHAR(50) NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
--     table_name VARCHAR(100) NOT NULL,
--     record_id UUID,
--     old_data JSONB,
--     new_data JSONB,
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- CREATE OR REPLACE FUNCTION log_admin_action()
-- RETURNS TRIGGER AS $$
-- BEGIN
--     IF TG_OP = 'DELETE' THEN
--         INSERT INTO admin_audit_log (admin_id, action, table_name, record_id, old_data)
--         VALUES (OLD.id, TG_OP, TG_TABLE_NAME, OLD.id, row_to_json(OLD));
--         RETURN OLD;
--     ELSIF TG_OP = 'UPDATE' THEN
--         INSERT INTO admin_audit_log (admin_id, action, table_name, record_id, old_data, new_data)
--         VALUES (NEW.id, TG_OP, TG_TABLE_NAME, NEW.id, row_to_json(OLD), row_to_json(NEW));
--         RETURN NEW;
--     ELSIF TG_OP = 'INSERT' THEN
--         INSERT INTO admin_audit_log (admin_id, action, table_name, record_id, new_data)
--         VALUES (NEW.id, TG_OP, TG_TABLE_NAME, NEW.id, row_to_json(NEW));
--         RETURN NEW;
--     END IF;
--     RETURN NULL;
-- END;
-- $$ language 'plpgsql';

-- ============================================
-- Trigger to validate email format
-- ============================================
CREATE OR REPLACE FUNCTION validate_email_format()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
        RAISE EXCEPTION 'Invalid email format';
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER validate_admin_email
    BEFORE INSERT OR UPDATE ON admin
    FOR EACH ROW
    EXECUTE FUNCTION validate_email_format();

-- ============================================
-- Trigger to ensure category name is not empty
-- ============================================
CREATE OR REPLACE FUNCTION validate_category_name()
RETURNS TRIGGER AS $$
BEGIN
    IF TRIM(NEW.name) = '' THEN
        RAISE EXCEPTION 'Category name cannot be empty';
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER validate_category_name_trigger
    BEFORE INSERT OR UPDATE ON category
    FOR EACH ROW
    EXECUTE FUNCTION validate_category_name();

-- ============================================
-- Trigger to ensure audio title is not empty
-- ============================================
CREATE OR REPLACE FUNCTION validate_audio_title()
RETURNS TRIGGER AS $$
BEGIN
    IF TRIM(NEW.title) = '' THEN
        RAISE EXCEPTION 'Audio title cannot be empty';
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER validate_audio_title_trigger
    BEFORE INSERT OR UPDATE ON audio
    FOR EACH ROW
    EXECUTE FUNCTION validate_audio_title();

-- ============================================
-- Trigger to ensure work title is not empty
-- ============================================
CREATE OR REPLACE FUNCTION validate_work_title()
RETURNS TRIGGER AS $$
BEGIN
    IF TRIM(NEW.title) = '' THEN
        RAISE EXCEPTION 'Work title cannot be empty';
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER validate_work_title_trigger
    BEFORE INSERT OR UPDATE ON work
    FOR EACH ROW
    EXECUTE FUNCTION validate_work_title();

-- ============================================
-- Trigger to ensure certification title is not empty
-- ============================================
CREATE OR REPLACE FUNCTION validate_certification_title()
RETURNS TRIGGER AS $$
BEGIN
    IF TRIM(NEW.title) = '' THEN
        RAISE EXCEPTION 'Certification title cannot be empty';
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER validate_certification_title_trigger
    BEFORE INSERT OR UPDATE ON certification
    FOR EACH ROW
    EXECUTE FUNCTION validate_certification_title();

-- ============================================
-- Trigger to validate URL format for social networks
-- ============================================
CREATE OR REPLACE FUNCTION validate_social_url()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.url !~ '^https?://' THEN
        RAISE EXCEPTION 'Social network URL must start with http:// or https://';
    END IF;
    IF TRIM(NEW.name) = '' THEN
        RAISE EXCEPTION 'Social network name cannot be empty';
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER validate_social_url_trigger
    BEFORE INSERT OR UPDATE ON reseaux_sociaux
    FOR EACH ROW
    EXECUTE FUNCTION validate_social_url();
