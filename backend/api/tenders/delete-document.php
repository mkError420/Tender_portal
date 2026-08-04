<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/middleware.php';

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    sendJsonResponse(['error' => 'Method not allowed'], 405);
}

// Admin only
$user = requireAdmin();

// Get document ID from request body
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['document_id'])) {
    sendJsonResponse(['error' => 'document_id is required'], 400);
}

$documentId = $data['document_id'];

$database = new Database();
$conn = $database->getConnection();

try {
    // First, get the document info to delete the physical file
    $query = "SELECT id, file_url, tender_id FROM tender_documents WHERE id = :id";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':id', $documentId);
    $stmt->execute();
    
    $document = $stmt->fetch();
    
    if (!$document) {
        sendJsonResponse(['error' => 'Document not found'], 404);
    }
    
    // Delete the physical file
    $filePath = UPLOAD_DIR . 'tenders/' . $document['tender_id'] . '/' . basename($document['file_url']);
    if (file_exists($filePath)) {
        unlink($filePath);
    }
    
    // Delete the database record
    $deleteQuery = "DELETE FROM tender_documents WHERE id = :id";
    $deleteStmt = $conn->prepare($deleteQuery);
    $deleteStmt->bindParam(':id', $documentId);
    
    if ($deleteStmt->execute()) {
        sendJsonResponse([
            'message' => 'Document deleted successfully',
            'document_id' => $documentId
        ]);
    } else {
        sendJsonResponse(['error' => 'Failed to delete document from database'], 500);
    }
    
} catch (PDOException $e) {
    sendJsonResponse(['error' => 'Database error: ' . $e->getMessage()], 500);
}
?>
