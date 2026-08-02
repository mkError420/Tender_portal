<?php
/**
 * Test script to check vendor listing API
 * This will help debug why vendors aren't showing
 */

require_once 'api/config/Database.php';

$db = (new Database())->getConnection();

try {
    echo "<h2>Checking Users Table Structure</h2>";
    $columns = $db->query("SHOW COLUMNS FROM users");
    echo "<table border='1'><tr><th>Field</th><th>Type</th><th>Null</th><th>Key</th><th>Default</th></tr>";
    while ($col = $columns->fetch()) {
        echo "<tr><td>{$col['Field']}</td><td>{$col['Type']}</td><td>{$col['Null']}</td><td>{$col['Key']}</td><td>{$col['Default']}</td></tr>";
    }
    echo "</table>";
    
    echo "<h2>All Users in Database</h2>";
    $users = $db->query("SELECT id, name, email, role, phone, company_name, created_at FROM users ORDER BY created_at DESC");
    echo "<table border='1'><tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Phone</th><th>Company</th><th>Created</th></tr>";
    while ($user = $users->fetch()) {
        echo "<tr><td>{$user['id']}</td><td>{$user['name']}</td><td>{$user['email']}</td><td>{$user['role']}</td><td>{$user['phone']}</td><td>{$user['company_name']}</td><td>{$user['created_at']}</td></tr>";
    }
    echo "</table>";
    
    echo "<h2>Vendors Only</h2>";
    $vendors = $db->query("SELECT id, name, email, role, phone, company_name, created_at FROM users WHERE role = 'vendor' ORDER BY created_at DESC");
    $vendorCount = $vendors->rowCount();
    echo "<p>Total vendors: $vendorCount</p>";
    echo "<table border='1'><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Company</th><th>Created</th></tr>";
    while ($vendor = $vendors->fetch()) {
        echo "<tr><td>{$vendor['id']}</td><td>{$vendor['name']}</td><td>{$vendor['email']}</td><td>{$vendor['phone']}</td><td>{$vendor['company_name']}</td><td>{$vendor['created_at']}</td></tr>";
    }
    echo "</table>";
    
    // Check if status column exists
    echo "<h2>Status Column Check</h2>";
    $columnCheck = $db->query("SHOW COLUMNS FROM users LIKE 'status'");
    if ($columnCheck->rowCount() > 0) {
        echo "<p>Status column EXISTS</p>";
        echo "<h2>Vendors with Status</h2>";
        $vendorsWithStatus = $db->query("SELECT id, name, email, role, status, phone, company_name, created_at FROM users WHERE role = 'vendor' ORDER BY created_at DESC");
        echo "<table border='1'><tr><th>ID</th><th>Name</th><th>Email</th><th>Status</th><th>Phone</th><th>Company</th><th>Created</th></tr>";
        while ($vendor = $vendorsWithStatus->fetch()) {
            echo "<tr><td>{$vendor['id']}</td><td>{$vendor['name']}</td><td>{$vendor['email']}</td><td>{$vendor['status']}</td><td>{$vendor['phone']}</td><td>{$vendor['company_name']}</td><td>{$vendor['created_at']}</td></tr>";
        }
        echo "</table>";
    } else {
        echo "<p>Status column DOES NOT EXIST - needs migration</p>";
    }
    
} catch (Exception $e) {
    echo "<p style='color: red;'>Error: " . $e->getMessage() . "</p>";
}
?>
