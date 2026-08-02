<?php
/**
 * Check Admin User Script
 * This script verifies that the admin user exists in the database
 */

$host = 'sql200.infinityfree.com';
$db_name = 'if0_42423300_rcmc_tender';
$username = 'if0_42423300';
$password = 'rcmc123456789';

echo "Checking Admin User in Database\n";
echo "================================\n\n";

try {
    $dsn = "mysql:host=" . $host . ";dbname=" . $db_name . ";charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];
    
    $conn = new PDO($dsn, $username, $password, $options);
    echo "✓ Database Connection Successful!\n\n";
    
    // Check if users table exists
    $stmt = $conn->query("SHOW TABLES LIKE 'users'");
    $tableExists = $stmt->fetch();
    
    if (!$tableExists) {
        echo "❌ Users table does not exist. Please import the schema.sql file.\n";
        exit;
    }
    
    echo "✓ Users table exists.\n\n";
    
    // Check for admin user
    $stmt = $conn->prepare("SELECT id, name, email, role, phone, company_name FROM users WHERE email = :email");
    $stmt->execute([':email' => 'admin@rangpurgroup.com']);
    $adminUser = $stmt->fetch();
    
    if ($adminUser) {
        echo "✓ Admin user found:\n";
        echo "  ID: {$adminUser['id']}\n";
        echo "  Name: {$adminUser['name']}\n";
        echo "  Email: {$adminUser['email']}\n";
        echo "  Role: {$adminUser['role']}\n";
        echo "  Phone: {$adminUser['phone']}\n";
        echo "  Company: {$adminUser['company_name']}\n\n";
        
        // Test password verification
        $testPassword = 'admin123';
        $stmt = $conn->prepare("SELECT password_hash FROM users WHERE email = :email");
        $stmt->execute([':email' => 'admin@rangpurgroup.com']);
        $userWithHash = $stmt->fetch();
        
        if ($userWithHash && password_verify($testPassword, $userWithHash['password_hash'])) {
            echo "✓ Password verification successful for 'admin123'\n";
        } else {
            echo "❌ Password verification failed for 'admin123'\n";
            echo "  You may need to update the admin password.\n";
        }
    } else {
        echo "❌ Admin user not found.\n";
        echo "  Creating admin user...\n";
        
        // Insert admin user
        $passwordHash = password_hash('admin123', PASSWORD_DEFAULT);
        $insertStmt = $conn->prepare("INSERT INTO users (name, email, password_hash, role, phone, company_name) VALUES (:name, :email, :password_hash, :role, :phone, :company_name)");
        $insertStmt->execute([
            ':name' => 'Admin User',
            ':email' => 'admin@rangpurgroup.com',
            ':password_hash' => $passwordHash,
            ':role' => 'admin',
            ':phone' => '+8801700000000',
            ':company_name' => 'Rangpur Group'
        ]);
        
        echo "✓ Admin user created successfully.\n";
        echo "  Email: admin@rangpurgroup.com\n";
        echo "  Password: admin123\n";
    }
    
    // Show all users
    echo "\n\nAll users in database:\n";
    $stmt = $conn->query("SELECT id, name, email, role FROM users");
    $users = $stmt->fetchAll();
    
    if (count($users) > 0) {
        foreach ($users as $user) {
            echo "  - ID: {$user['id']}, Name: {$user['name']}, Email: {$user['email']}, Role: {$user['role']}\n";
        }
    } else {
        echo "  No users found.\n";
    }
    
} catch (PDOException $e) {
    echo "❌ Database Error: " . $e->getMessage() . "\n";
}
?>
