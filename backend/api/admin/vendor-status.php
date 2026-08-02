<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/middleware.php';

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    sendJsonResponse(['error' => 'Method not allowed'], 405);
}

// Admin only
$user = requireAdmin();

$data = getJsonInput();

$requiredFields = ['vendor_id', 'status'];
$missing = validateRequired($data, $requiredFields);

if (!empty($missing)) {
    sendJsonResponse(['error' => 'Missing required fields', 'fields' => $missing], 400);
}

if (!in_array($data['status'], ['pending', 'active', 'suspended'])) {
    sendJsonResponse(['error' => 'Invalid status'], 400);
}

$database = new Database();
$conn = $database->getConnection();

try {
    // Check if vendor exists
    $checkQuery = "SELECT id FROM users WHERE id = :vendor_id AND role = 'vendor'";
    $checkStmt = $conn->prepare($checkQuery);
    $checkStmt->bindParam(':vendor_id', $data['vendor_id']);
    $checkStmt->execute();
    
    if ($checkStmt->rowCount() === 0) {
        sendJsonResponse(['error' => 'Vendor not found'], 404);
    }
    
    // Update vendor status
    $query = "UPDATE users SET status = :status, updated_at = CURRENT_TIMESTAMP 
              WHERE id = :vendor_id AND role = 'vendor'";
    
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':status', $data['status']);
    $stmt->bindParam(':vendor_id', $data['vendor_id']);
    
    if ($stmt->execute()) {
        sendJsonResponse([
            'message' => 'Vendor status updated successfully',
            'vendor_id' => $data['vendor_id'],
            'status' => $data['status']
        ]);
    } else {
        sendJsonResponse(['error' => 'Failed to update vendor status'], 500);
    }
    
} catch (PDOException $e) {
    sendJsonResponse(['error' => 'Database error'], 500);
}
?>
