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
    // Get all vendors with their details
    $query = "SELECT id, name, email, phone, company_name, trade_license_no, address, status, created_at 
              FROM users 
              WHERE role = 'vendor' 
              ORDER BY created_at DESC";
    
    $stmt = $conn->prepare($query);
    $stmt->execute();
    $vendors = $stmt->fetchAll();
    
    sendJsonResponse([
        'vendors' => $vendors,
        'total' => count($vendors)
    ]);
    
} catch (PDOException $e) {
    sendJsonResponse(['error' => 'Database error'], 500);
}
?>
