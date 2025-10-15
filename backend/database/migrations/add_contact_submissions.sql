-- Migration: Add contact_submissions table
-- This table stores all contact form submissions

CREATE TABLE IF NOT EXISTS contact_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    confirmation_number VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    preferred_contact VARCHAR(20) DEFAULT 'email',
    attachment_path VARCHAR(500),
    attachment_name VARCHAR(255),
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'responded', 'closed')),
    response_message TEXT,
    responded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_contact_submissions_email ON contact_submissions(email);
CREATE INDEX idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX idx_contact_submissions_created_at ON contact_submissions(created_at DESC);
CREATE INDEX idx_contact_submissions_confirmation ON contact_submissions(confirmation_number);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_contact_submissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_contact_submissions_updated_at
    BEFORE UPDATE ON contact_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_contact_submissions_updated_at();

-- Add comments for documentation
COMMENT ON TABLE contact_submissions IS 'Stores all contact form submissions from the FlowTracker contact page';
COMMENT ON COLUMN contact_submissions.confirmation_number IS 'Unique confirmation number provided to users for tracking their submission';
COMMENT ON COLUMN contact_submissions.status IS 'Current status of the contact submission: new, in_progress, responded, or closed';
COMMENT ON COLUMN contact_submissions.preferred_contact IS 'User''s preferred method of contact: email, phone, or either';
COMMENT ON COLUMN contact_submissions.attachment_path IS 'File system path to uploaded attachment';
COMMENT ON COLUMN contact_submissions.attachment_name IS 'Original filename of uploaded attachment';

