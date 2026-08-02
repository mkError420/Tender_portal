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

$requiredFields = ['bid_id', 'status'];
$missing = validateRequired($data, $requiredFields);

if (!empty($missing)) {
    sendJsonResponse(['error' => 'Missing required fields', 'fields' => $missing], 400);
}

$validStatuses = ['submitted', 'shortlisted', 'accepted', 'rejected'];
if (!in_array($data['status'], $validStatuses)) {
    sendJsonResponse(['error' => 'Invalid status'], 400);
}

$database = new Database();
$conn = $database->getConnection();

try {
    // Check if bid exists
    $checkQuery = "SELECT id, status FROM bids WHERE id = :bid_id";
    $checkStmt = $conn->prepare($checkQuery);
    $checkStmt->bindParam(':bid_id', $data['bid_id']);
    $checkStmt->execute();
    $bid = $checkStmt->fetch();
    
    if (!$bid) {
        sendJsonResponse(['error' => 'Bid not found'], 404);
    }
    
    // Update bid status
    $query = "UPDATE bids SET status = :status WHERE id = :bid_id";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':status', $data['status']);
    $stmt->bindParam(':bid_id', $data['bid_id']);
    
    if ($stmt->execute()) {
        sendJsonResponse(['message' => 'Bid status updated successfully']);
    } else {
        sendJsonResponse(['error' => 'Failed to update bid status'], 500);
    }
    
} catch (PDOException $e) {
    sendJsonResponse(['error' => 'Database error'], 500);
}
?>
