<?php
require_once __DIR__ . '/../config/Cors.php';
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    Response::error("Method not allowed", 405);
}

// Admin only
$user = AuthMiddleware::enforceRole('admin');

// Get JSON input
$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    Response::error("Invalid JSON input", 400);
}

$requiredFields = ['vendor_id', 'status'];
foreach ($requiredFields as $field) {
    if (!isset($data[$field])) {
        Response::error("Missing required field: {$field}", 400);
    }
}

if (!in_array($data['status'], ['pending', 'active', 'suspended'])) {
    Response::error("Invalid status. Must be pending, active, or suspended", 400);
}

$db = (new Database())->getConnection();

try {
    // Check if vendor exists
    $checkQuery = "SELECT id FROM users WHERE id = :vendor_id AND role = 'vendor'";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->bindParam(':vendor_id', $data['vendor_id']);
    $checkStmt->execute();
    
    if ($checkStmt->rowCount() === 0) {
        Response::error("Vendor not found", 404);
    }
    
    // Check if status column exists
    $columnCheck = $db->query("SHOW COLUMNS FROM users LIKE 'status'");
    if ($columnCheck->rowCount() > 0) {
        // Update vendor status
        $query = "UPDATE users SET status = :status, updated_at = CURRENT_TIMESTAMP 
                  WHERE id = :vendor_id AND role = 'vendor'";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':status', $data['status']);
        $stmt->bindParam(':vendor_id', $data['vendor_id']);
        
        if ($stmt->execute()) {
            Response::success("Vendor status updated successfully", [
                'vendor_id' => $data['vendor_id'],
                'status' => $data['status']
            ]);
        } else {
            Response::error("Failed to update vendor status", 500);
        }
    } else {
        Response::error("Status column not found in database. Please run the migration script.", 500);
    }
    
} catch (Exception $e) {
    Response::error("Database Error: " . $e->getMessage(), 500);
}
?>
