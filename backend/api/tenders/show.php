<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJsonResponse(['error' => 'Method not allowed'], 405);
}

if (!isset($_GET['id'])) {
    sendJsonResponse(['error' => 'Tender ID is required'], 400);
}

$database = new Database();
$conn = $database->getConnection();

try {
    $tenderId = $_GET['id'];
    
    $query = "SELECT t.*, u.name as created_by_name, u.email as created_by_email
              FROM tenders t
              LEFT JOIN users u ON t.created_by = u.id
              WHERE t.id = :id";
    
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':id', $tenderId);
    $stmt->execute();
    
    $tender = $stmt->fetch();
    
    if (!$tender) {
        sendJsonResponse(['error' => 'Tender not found'], 404);
    }
    
    // Get documents
    $docQuery = "SELECT id, file_name, file_url, uploaded_at FROM tender_documents WHERE tender_id = :tender_id";
    $docStmt = $conn->prepare($docQuery);
    $docStmt->bindParam(':tender_id', $tenderId);
    $docStmt->execute();
    $documents = $docStmt->fetchAll();
    
    // Convert relative URLs to absolute URLs
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'];
    $baseUrl = $protocol . '://' . $host;
    
    foreach ($documents as &$doc) {
        if (!preg_match('/^https?:\/\//', $doc['file_url'])) {
            $doc['file_url'] = $baseUrl . '/' . ltrim($doc['file_url'], '/');
        }
    }
    
    $tender['documents'] = $documents;
    
    // Get bids count
    $bidCountQuery = "SELECT COUNT(*) as count FROM bids WHERE tender_id = :tender_id";
    $bidCountStmt = $conn->prepare($bidCountQuery);
    $bidCountStmt->bindParam(':tender_id', $tenderId);
    $bidCountStmt->execute();
    $tender['bid_count'] = $bidCountStmt->fetch()['count'];
    
    sendJsonResponse(['tender' => $tender]);
    
} catch (PDOException $e) {
    sendJsonResponse(['error' => 'Database error'], 500);
}
?>
