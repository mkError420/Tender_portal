<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/middleware.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(['error' => 'Method not allowed'], 405);
}

// Admin only
$user = requireAdmin();

$data = getJsonInput();

$requiredFields = ['title', 'reference_no', 'description', 'category', 'publish_date', 'closing_date'];
$missing = validateRequired($data, $requiredFields);

if (!empty($missing)) {
    sendJsonResponse(['error' => 'Missing required fields', 'fields' => $missing], 400);
}

$database = new Database();
$conn = $database->getConnection();

try {
    // Check if reference number already exists
    $checkQuery = "SELECT id FROM tenders WHERE reference_no = :reference_no";
    $checkStmt = $conn->prepare($checkQuery);
    $checkStmt->bindParam(':reference_no', $data['reference_no']);
    $checkStmt->execute();
    
    if ($checkStmt->rowCount() > 0) {
        sendJsonResponse(['error' => 'Reference number already exists'], 409);
    }
    
    $query = "INSERT INTO tenders (title, reference_no, description, category, estimated_budget, 
              publish_date, closing_date, status, created_by) 
              VALUES (:title, :reference_no, :description, :category, :estimated_budget, 
              :publish_date, :closing_date, :status, :created_by)";
    
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':title', $data['title']);
    $stmt->bindParam(':reference_no', $data['reference_no']);
    $stmt->bindParam(':description', $data['description']);
    $stmt->bindParam(':category', $data['category']);
    $stmt->bindParam(':estimated_budget', $data['estimated_budget']);
    $stmt->bindParam(':publish_date', $data['publish_date']);
    $stmt->bindParam(':closing_date', $data['closing_date']);
    $stmt->bindParam(':status', $data['status'] ?? 'draft');
    $stmt->bindParam(':created_by', $user['user_id']);
    
    if ($stmt->execute()) {
        $tenderId = $conn->lastInsertId();
        
        // Handle document uploads if provided
        if (isset($data['documents']) && is_array($data['documents'])) {
            foreach ($data['documents'] as $doc) {
                $docQuery = "INSERT INTO tender_documents (tender_id, file_name, file_url) 
                            VALUES (:tender_id, :file_name, :file_url)";
                $docStmt = $conn->prepare($docQuery);
                $docStmt->bindParam(':tender_id', $tenderId);
                $docStmt->bindParam(':file_name', $doc['file_name']);
                $docStmt->bindParam(':file_url', $doc['file_url']);
                $docStmt->execute();
            }
        }
        
        sendJsonResponse([
            'message' => 'Tender created successfully',
            'tender_id' => $tenderId
        ], 201);
    } else {
        sendJsonResponse(['error' => 'Failed to create tender'], 500);
    }
    
} catch (PDOException $e) {
    sendJsonResponse(['error' => 'Database error'], 500);
}
?>
