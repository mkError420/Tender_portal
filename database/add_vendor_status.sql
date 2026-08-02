-- Add status field to users table for vendor approval workflow
-- This will allow admins to approve/reject vendor registrations

USE if0_42423300_rcmc_tender;

-- Add status column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS status ENUM('pending', 'active', 'suspended') DEFAULT 'pending';

-- Update existing vendors to have 'active' status (for backward compatibility)
UPDATE users 
SET status = 'active' 
WHERE role = 'vendor' AND status IS NULL;

-- Update existing admin to have 'active' status
UPDATE users 
SET status = 'active' 
WHERE role = 'admin' AND status IS NULL;
