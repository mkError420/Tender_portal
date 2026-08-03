<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/middleware.php';

// Allow both PUT and POST methods (some servers don't support PUT)
if ($_SERVER['REQUEST_METHOD'] !== 'PUT' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(['error' => 'Method not allowed'], 405);
}

// Admin only
$user = requireAdmin();

$data = getJsonInput();

if (!isset($data['id'])) {
    sendJsonResponse(['error' => 'Tender ID is required'], 400);
}

$database = new Database();
$conn = $database->getConnection();

try {
    // Check if tender exists
    $checkQuery = "SELECT id, reference_no FROM tenders WHERE id = :id";
    $checkStmt = $conn->prepare($checkQuery);
    $checkStmt->bindParam(':id', $data['id']);
    $checkStmt->execute();
    
    if ($checkStmt->rowCount() === 0) {
        sendJsonResponse(['error' => 'Tender not found'], 404);
    }
    
    $existingTender = $checkStmt->fetch();
    
    // Build dynamic update query
    $updateFields = [];
    $params = [':id' => $data['id']];
    
    $allowedFields = ['title', 'reference_no', 'description', 'category', 'estimated_budget', 
                     'publish_date', 'closing_date', 'status'];
    
    foreach ($allowedFields as $field) {
        if (isset($data[$field])) {
            // Check if reference_no is being changed and if it conflicts with existing
            if ($field === 'reference_no' && $data['reference_no'] !== $existingTender['reference_no']) {
                $refCheckQuery = "SELECT id FROM tenders WHERE reference_no = :reference_no AND id != :id";
                $refCheckStmt = $conn->prepare($refCheckQuery);
                $refCheckStmt->bindParam(':reference_no', $data['reference_no']);
                $refCheckStmt->bindParam(':id', $data['id']);
                $refCheckStmt->execute();
                
                if ($refCheckStmt->rowCount() > 0) {
                    sendJsonResponse(['error' => 'Reference number already exists'], 409);
                }
            }
            $updateFields[] = "$field = :$field";
            $params[":$field"] = $data[$field];
        }
    }
    
    if (empty($updateFields)) {
        sendJsonResponse(['error' => 'No fields to update'], 400);
    }
    
    $query = "UPDATE tenders SET " . implode(', ', $updateFields) . " WHERE id = :id";
    
    $stmt = $conn->prepare($query);
    
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    
    if ($stmt->execute()) {
        sendJsonResponse(['message' => 'Tender updated successfully']);
    } else {
        sendJsonResponse(['error' => 'Failed to update tender'], 500);
    }
    
} catch (PDOException $e) {
    sendJsonResponse(['error' => 'Database error: ' . $e->getMessage()], 500);
}
?>
