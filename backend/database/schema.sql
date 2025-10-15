-- FlowTracker Database Schema
-- Multi-tenant library issue tracking system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Libraries table (tenants)
CREATE TABLE libraries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(255),
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    library_id UUID NOT NULL REFERENCES libraries(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'staff', -- admin, manager, staff, viewer
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(library_id, email)
);

-- Password reset tokens table
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Collections table (issue categories)
CREATE TABLE collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    library_id UUID NOT NULL REFERENCES libraries(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    colour VARCHAR(7) DEFAULT '#3B82F6', -- Hex colour code
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(library_id, name)
);

-- Issues table
CREATE TABLE issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    library_id UUID NOT NULL REFERENCES libraries(id) ON DELETE CASCADE,
    collection_id UUID REFERENCES collections(id) ON DELETE SET NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'open', -- open, in_progress, resolved, closed
    priority VARCHAR(20) NOT NULL DEFAULT 'medium', -- low, medium, high, urgent
    created_by UUID NOT NULL REFERENCES users(id),
    assigned_to UUID REFERENCES users(id),
    due_date TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Issue comments table
CREATE TABLE issue_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false, -- Internal notes vs public comments
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Issue attachments table
CREATE TABLE issue_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Issue status history table
CREATE TABLE issue_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by UUID NOT NULL REFERENCES users(id),
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- issue_assigned, issue_updated, comment_added, etc.
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}', -- Additional data for the notification
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ILS Configuration table
CREATE TABLE ils_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    library_id UUID NOT NULL REFERENCES libraries(id) ON DELETE CASCADE,
    system_type VARCHAR(50) NOT NULL, -- koha, evergreen, sierra, custom
    name VARCHAR(255) NOT NULL,
    base_url VARCHAR(500) NOT NULL,
    api_key VARCHAR(500),
    username VARCHAR(255),
    password VARCHAR(500), -- Encrypted
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(library_id, name)
);

-- ILS Items cache table
CREATE TABLE ils_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    library_id UUID NOT NULL REFERENCES libraries(id) ON DELETE CASCADE,
    ils_id VARCHAR(255) NOT NULL, -- ID from the ILS system
    barcode VARCHAR(100) NOT NULL,
    title VARCHAR(500) NOT NULL,
    author VARCHAR(255),
    isbn VARCHAR(20),
    call_number VARCHAR(100),
    location VARCHAR(255),
    status VARCHAR(50),
    due_date TIMESTAMP WITH TIME ZONE,
    patron_id VARCHAR(255),
    patron_name VARCHAR(255),
    item_type VARCHAR(100),
    collection VARCHAR(255),
    last_synced TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(library_id, ils_id)
);

-- ILS Patrons cache table
CREATE TABLE ils_patrons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    library_id UUID NOT NULL REFERENCES libraries(id) ON DELETE CASCADE,
    ils_id VARCHAR(255) NOT NULL, -- ID from the ILS system
    barcode VARCHAR(100) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, inactive, blocked
    last_synced TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(library_id, ils_id)
);

-- ILS Integration status table
CREATE TABLE ils_integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    library_id UUID NOT NULL REFERENCES libraries(id) ON DELETE CASCADE,
    config_id UUID NOT NULL REFERENCES ils_configs(id) ON DELETE CASCADE,
    last_sync TIMESTAMP WITH TIME ZONE,
    sync_status VARCHAR(20) NOT NULL DEFAULT 'success', -- success, error, in_progress
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Third-party service configurations
CREATE TABLE service_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    library_id UUID NOT NULL REFERENCES libraries(id) ON DELETE CASCADE,
    service_type VARCHAR(50) NOT NULL, -- file_storage, image_processing, pdf_generation, calendar
    provider VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    config JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(library_id, service_type, name)
);

-- Indexes for performance
CREATE INDEX idx_issues_library_id ON issues(library_id);
CREATE INDEX idx_issues_status ON issues(status);
CREATE INDEX idx_issues_priority ON issues(priority);
CREATE INDEX idx_issues_assigned_to ON issues(assigned_to);
CREATE INDEX idx_issues_created_by ON issues(created_by);
CREATE INDEX idx_issues_collection_id ON issues(collection_id);
CREATE INDEX idx_issues_created_at ON issues(created_at);

CREATE INDEX idx_issue_comments_issue_id ON issue_comments(issue_id);
CREATE INDEX idx_issue_comments_user_id ON issue_comments(user_id);
CREATE INDEX idx_issue_comments_created_at ON issue_comments(created_at);

CREATE INDEX idx_issue_attachments_issue_id ON issue_attachments(issue_id);
CREATE INDEX idx_issue_attachments_uploaded_by ON issue_attachments(uploaded_by);

CREATE INDEX idx_issue_status_history_issue_id ON issue_status_history(issue_id);
CREATE INDEX idx_issue_status_history_created_at ON issue_status_history(created_at);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

CREATE INDEX idx_users_library_id ON users(library_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

CREATE INDEX idx_collections_library_id ON collections(library_id);

CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

-- ILS Integration indexes
CREATE INDEX idx_ils_configs_library_id ON ils_configs(library_id);
CREATE INDEX idx_ils_configs_system_type ON ils_configs(system_type);
CREATE INDEX idx_ils_configs_is_active ON ils_configs(is_active);

CREATE INDEX idx_ils_items_library_id ON ils_items(library_id);
CREATE INDEX idx_ils_items_barcode ON ils_items(barcode);
CREATE INDEX idx_ils_items_ils_id ON ils_items(ils_id);
CREATE INDEX idx_ils_items_title ON ils_items(title);
CREATE INDEX idx_ils_items_isbn ON ils_items(isbn);
CREATE INDEX idx_ils_items_call_number ON ils_items(call_number);
CREATE INDEX idx_ils_items_status ON ils_items(status);
CREATE INDEX idx_ils_items_last_synced ON ils_items(last_synced);

CREATE INDEX idx_ils_patrons_library_id ON ils_patrons(library_id);
CREATE INDEX idx_ils_patrons_barcode ON ils_patrons(barcode);
CREATE INDEX idx_ils_patrons_ils_id ON ils_patrons(ils_id);
CREATE INDEX idx_ils_patrons_email ON ils_patrons(email);
CREATE INDEX idx_ils_patrons_status ON ils_patrons(status);
CREATE INDEX idx_ils_patrons_last_synced ON ils_patrons(last_synced);

CREATE INDEX idx_ils_integrations_library_id ON ils_integrations(library_id);
CREATE INDEX idx_ils_integrations_config_id ON ils_integrations(config_id);
CREATE INDEX idx_ils_integrations_sync_status ON ils_integrations(sync_status);
CREATE INDEX idx_ils_integrations_last_sync ON ils_integrations(last_sync);

CREATE INDEX idx_service_configs_library_id ON service_configs(library_id);
CREATE INDEX idx_service_configs_service_type ON service_configs(service_type);
CREATE INDEX idx_service_configs_provider ON service_configs(provider);
CREATE INDEX idx_service_configs_is_active ON service_configs(is_active);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_libraries_updated_at BEFORE UPDATE ON libraries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON collections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_issues_updated_at BEFORE UPDATE ON issues
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_issue_comments_updated_at BEFORE UPDATE ON issue_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ils_configs_updated_at BEFORE UPDATE ON ils_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ils_items_updated_at BEFORE UPDATE ON ils_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ils_patrons_updated_at BEFORE UPDATE ON ils_patrons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ils_integrations_updated_at BEFORE UPDATE ON ils_integrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_configs_updated_at BEFORE UPDATE ON service_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO libraries (id, name, code, description, address, phone, email) VALUES
    (uuid_generate_v4(), 'Central Library', 'CENTRAL', 'Main branch of the library system', '123 Main St, City, State 12345', '(555) 123-4567', 'central@library.com'),
    (uuid_generate_v4(), 'North Branch', 'NORTH', 'Northern branch library', '456 North Ave, City, State 12345', '(555) 123-4568', 'north@library.com');

-- Get the first library ID for sample data
DO $$
DECLARE
    central_lib_id UUID;
    admin_user_id UUID;
BEGIN
    SELECT id INTO central_lib_id FROM libraries WHERE code = 'CENTRAL' LIMIT 1;
    
    -- Create admin user
    INSERT INTO users (id, library_id, email, password_hash, first_name, last_name, role) VALUES
        (uuid_generate_v4(), central_lib_id, 'admin@library.com', '$2b$10$rQZ8kL9vJ8K9vJ8K9vJ8K9uJ8K9vJ8K9vJ8K9vJ8K9vJ8K9vJ8K9vJ8K', 'Admin', 'User', 'admin')
    RETURNING id INTO admin_user_id;
    
    -- Create sample collections
    INSERT INTO collections (library_id, name, description, color) VALUES
        (central_lib_id, 'Cataloging Issues', 'Problems with item cataloging and metadata', '#EF4444'),
        (central_lib_id, 'Technical Issues', 'IT and system-related problems', '#F59E0B'),
        (central_lib_id, 'Customer Service', 'User complaints and service issues', '#10B981'),
        (central_lib_id, 'Facilities', 'Building and equipment maintenance', '#8B5CF6');
    
    -- Create sample issues
    INSERT INTO issues (library_id, collection_id, title, description, status, priority, created_by, assigned_to) VALUES
        (central_lib_id, (SELECT id FROM collections WHERE library_id = central_lib_id AND name = 'Cataloging Issues' LIMIT 1), 
         'Missing ISBN for new book', 'The new mystery novel "The Silent Library" is missing its ISBN in the catalog', 'open', 'medium', admin_user_id, admin_user_id),
        (central_lib_id, (SELECT id FROM collections WHERE library_id = central_lib_id AND name = 'Technical Issues' LIMIT 1), 
         'Printer not working', 'The public printer on the second floor is showing error code E-123', 'in_progress', 'high', admin_user_id, admin_user_id),
        (central_lib_id, (SELECT id FROM collections WHERE library_id = central_lib_id AND name = 'Customer Service' LIMIT 1), 
         'Noise complaint', 'Patron reported excessive noise from the children''s section', 'open', 'low', admin_user_id, NULL);
END $$;
