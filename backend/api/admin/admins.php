<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/middleware.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJsonResponse(['error' => 'Method not allowed'], 405);
}

// Admin only
$user = requireAdmin();

$database = new Database();
$conn = $database->getConnection();

try {
    // Check if status column exists
    $columnCheck = $conn->query("SHOW COLUMNS FROM users LIKE 'status'");
    $hasStatusColumn = $columnCheck->rowCount() > 0;
    
    // Get all admins with their details
    if ($hasStatusColumn) {
        $query = "SELECT id, name, email, phone, company_name, status, created_at 
                  FROM users 
                  WHERE role = 'admin' 
                  ORDER BY created_at DESC";
    } else {
        $query = "SELECT id, name, email, phone, company_name, 
                  'active' as status, created_at 
                  FROM users 
                  WHERE role = 'admin' 
                  ORDER BY created_at DESC";
    }
    
    $stmt = $conn->prepare($query);
    $stmt->execute();
    $admins = $stmt->fetchAll();
    
    sendJsonResponse([
        'admins' => $admins,
        'total' => count($admins)
    ]);
    
} catch (PDOException $e) {
    sendJsonResponse(['error' => 'Database error'], 500);
}
?>
