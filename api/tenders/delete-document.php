<?php
/**
 * DELETE /api/tenders/delete-document.php
 * Delete a specific document from a tender (Admin Only)
 */

require_once __DIR__ . '/../config/Cors.php';
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    Response::error("Method not allowed", 405);
}

// Admin only
$user = AuthMiddleware::enforceRole('admin');

// Get document ID from request body
$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['document_id'])) {
    Response::error("Missing document_id", 400);
}

$documentId = (int) $data['document_id'];
if ($documentId <= 0) {
    Response::error("Invalid document_id", 400);
}

$db = (new Database())->getConnection();

try {
    // First, get the document info to delete the physical file
    $stmt = $db->prepare("SELECT id, file_url, tender_id FROM tender_documents WHERE id = :id LIMIT 1");
    $stmt->execute([':id' => $documentId]);
    $document = $stmt->fetch();

    if (!$document) {
        Response::error("Document not found", 404);
    }

    // Delete the physical file
    $filePath = $_SERVER['DOCUMENT_ROOT'] . '/' . ltrim($document['file_url'], '/');
    if (file_exists($filePath)) {
        unlink($filePath);
    }

    // Delete the database record
    $deleteStmt = $db->prepare("DELETE FROM tender_documents WHERE id = :id");
    $deleteStmt->execute([':id' => $documentId]);

    Response::success("Document deleted successfully", ['document_id' => $documentId]);
} catch (PDOException $e) {
    Response::error("Database Error: " . $e->getMessage(), 500);
}
