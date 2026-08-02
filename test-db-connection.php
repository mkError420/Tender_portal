<?php
/**
 * Database Connection Test Script
 * This script tests the database connection with production credentials
 */

$host = 'sql200.infinityfree.com';
$db_name = 'if0_42423300_rcmc_tender';
$username = 'if0_42423300';
$password = 'rcmc123456789';

echo "Testing Database Connection...\n";
echo "Host: $host\n";
echo "Database: $db_name\n";
echo "Username: $username\n";
echo "--------------------------------\n";

try {
    $dsn = "mysql:host=" . $host . ";dbname=" . $db_name . ";charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];
    
    $conn = new PDO($dsn, $username, $password, $options);
    echo "✓ Database Connection Successful!\n";
    
    // Test query to check if we can access tables
    $stmt = $conn->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    if (count($tables) > 0) {
        echo "✓ Found " . count($tables) . " tables:\n";
        foreach ($tables as $table) {
            echo "  - $table\n";
        }
    } else {
        echo "⚠ No tables found. You need to import the schema.sql file.\n";
    }
    
} catch (PDOException $e) {
    echo "✗ Database Connection Failed!\n";
    echo "Error: " . $e->getMessage() . "\n";
    
    // Provide troubleshooting tips
    echo "\nTroubleshooting Tips:\n";
    echo "1. Verify the database credentials are correct\n";
    echo "2. Check if the database exists on the server\n";
    echo "3. Ensure your IP is allowed to connect to the database\n";
    echo "4. Check if the MySQL server is accessible from your location\n";
}
?>
