<?php
/**
 * Migration script to add status column to users table
 * Run this once to update the database schema
 */

require_once __DIR__ . '/../config/Cors.php';
require_once __DIR__ . '/../config/Database.php';

$db = (new Database())->getConnection();

try {
    // Check if status column already exists
    $columnCheck = $db->query("SHOW COLUMNS FROM users LIKE 'status'");
    
    if ($columnCheck->rowCount() > 0) {
        // Update existing users without status to have appropriate defaults
        $updateNullStatus = "UPDATE users SET status = 'active' WHERE status IS NULL";
        $db->exec($updateNullStatus);
        
        echo json_encode([
            "success" => true,
            "message" => "Status column already exists in users table. Updated users with null status."
        ]);
        exit;
    }
    
    // Add status column
    $alterQuery = "ALTER TABLE users ADD COLUMN status ENUM('pending', 'active', 'suspended') DEFAULT 'pending' AFTER role";
    $db->exec($alterQuery);
    
    // Update existing vendors to active status (so they can login immediately)
    $updateVendors = "UPDATE users SET status = 'active' WHERE role = 'vendor'";
    $db->exec($updateVendors);
    
    // Update existing admin to active status
    $updateAdmin = "UPDATE users SET status = 'active' WHERE role = 'admin'";
    $db->exec($updateAdmin);
    
    echo json_encode([
        "success" => true,
        "message" => "Status column added successfully and existing users updated to active status"
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => "Migration failed: " . $e->getMessage()
    ]);
}
?>
