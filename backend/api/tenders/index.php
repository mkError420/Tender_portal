<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJsonResponse(['error' => 'Method not allowed'], 405);
}

$database = new Database();
$conn = $database->getConnection();

try {
    // Get query parameters
    $status = $_GET['status'] ?? null;
    $category = $_GET['category'] ?? null;
    $search = $_GET['search'] ?? null;
    
    $query = "SELECT t.*, u.name as created_by_name, 
              (SELECT COUNT(*) FROM bids WHERE tender_id = t.id) as bid_count
              FROM tenders t
              LEFT JOIN users u ON t.created_by = u.id
              WHERE 1=1";
    
    $params = [];
    
    if ($status) {
        $query .= " AND t.status = :status";
        $params[':status'] = $status;
    }
    
    if ($category) {
        $query .= " AND t.category = :category";
        $params[':category'] = $category;
    }
    
    if ($search) {
        $query .= " AND (t.title LIKE :search OR t.reference_no LIKE :search OR t.description LIKE :search)";
        $params[':search'] = "%$search%";
    }
    
    $query .= " ORDER BY t.created_at DESC";
    
    $stmt = $conn->prepare($query);
    
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    
    $stmt->execute();
    $tenders = $stmt->fetchAll();
    
    // Get documents for each tender
    foreach ($tenders as &$tender) {
        $docQuery = "SELECT id, file_name, file_url FROM tender_documents WHERE tender_id = :tender_id";
        $docStmt = $conn->prepare($docQuery);
        $docStmt->bindParam(':tender_id', $tender['id']);
        $docStmt->execute();
        $tender['documents'] = $docStmt->fetchAll();
    }
    
    sendJsonResponse(['tenders' => $tenders]);
    
} catch (PDOException $e) {
    sendJsonResponse(['error' => 'Database error'], 500);
}
?>
