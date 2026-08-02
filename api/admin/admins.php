<?php
require_once __DIR__ . '/../config/Cors.php';
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Response::error("Method not allowed", 405);
}

// Admin only
$user = AuthMiddleware::enforceRole('admin');

$db = (new Database())->getConnection();

try {
    // Check if status column exists
    $columnCheck = $db->query("SHOW COLUMNS FROM users LIKE 'status'");
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
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    $admins = $stmt->fetchAll();
    
    Response::success("Admins fetched successfully", [
        'admins' => $admins,
        'total' => count($admins)
    ]);
    
} catch (Exception $e) {
    Response::error("Database Error: " . $e->getMessage(), 500);
}
?>
