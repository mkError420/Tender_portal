-- Add supplier_requirements column to tenders table
-- Migration script for adding supplier requirements field

USE if0_42423300_rcmc_tender;

-- Add supplier_requirements column to tenders table
ALTER TABLE tenders 
ADD COLUMN supplier_requirements TEXT AFTER category;

-- Update the table structure comment
ALTER TABLE tenders COMMENT = 'Tenders table with supplier requirements field';
