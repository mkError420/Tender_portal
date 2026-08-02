<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/middleware.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(['error' => 'Method not allowed'], 405);
}

// Admin only
$user = requireAdmin();

if (!isset($_FILES['file']) || !isset($_POST['tender_id'])) {
    sendJsonResponse(['error' => 'File and tender_id are required'], 400);
}

$file = $_FILES['file'];
$tenderId = $_POST['tender_id'];

// Validate file upload
$validation = validateFileUpload($file);
if (!$validation['valid']) {
    sendJsonResponse(['error' => $validation['message']], 400);
}

$database = new Database();
$conn = $database->getConnection();

try {
    // Check if tender exists
    $checkQuery = "SELECT id FROM tenders WHERE id = :id";
    $checkStmt = $conn->prepare($checkQuery);
    $checkStmt->bindParam(':id', $tenderId);
    $checkStmt->execute();
    
    if ($checkStmt->rowCount() === 0) {
        sendJsonResponse(['error' => 'Tender not found'], 404);
    }
    
    // Generate safe filename
    $safeFileName = sanitizeFileName($file['name']);
    $uploadPath = UPLOAD_DIR . $safeFileName;
    
    // Move uploaded file
    if (!move_uploaded_file($file['tmp_name'], $uploadPath)) {
        sendJsonResponse(['error' => 'Failed to upload file'], 500);
    }
    
    // Store in database
    $fileUrl = '/uploads/' . $safeFileName;
    $query = "INSERT INTO tender_documents (tender_id, file_name, file_url) 
              VALUES (:tender_id, :file_name, :file_url)";
    
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':tender_id', $tenderId);
    $stmt->bindParam(':file_name', $file['name']);
    $stmt->bindParam(':file_url', $fileUrl);
    
    if ($stmt->execute()) {
        sendJsonResponse([
            'message' => 'Document uploaded successfully',
            'document_id' => $conn->lastInsertId(),
            'file_url' => $fileUrl
        ], 201);
    } else {
        // Delete file if database insert fails
        unlink($uploadPath);
        sendJsonResponse(['error' => 'Failed to save document'], 500);
    }
    
} catch (PDOException $e) {
    sendJsonResponse(['error' => 'Database error'], 500);
}
?>
