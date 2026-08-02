<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/middleware.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJsonResponse(['error' => 'Method not allowed'], 405);
}

// Require authentication
$user = authenticate();

$database = new Database();
$conn = $database->getConnection();

try {
    $tenderId = $_GET['tender_id'] ?? null;
    
    // Admins can see all bids, vendors only their own
    if ($user['role'] === 'admin') {
        $query = "SELECT b.*, t.title as tender_title, t.reference_no, 
                  u.name as vendor_name, u.company_name, u.email as vendor_email
                  FROM bids b
                  JOIN tenders t ON b.tender_id = t.id
                  JOIN users u ON b.vendor_id = u.id";
        
        $params = [];
        
        if ($tenderId) {
            $query .= " WHERE b.tender_id = :tender_id";
            $params[':tender_id'] = $tenderId;
        }
        
        $query .= " ORDER BY b.submitted_at DESC";
        
        $stmt = $conn->prepare($query);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->execute();
        $bids = $stmt->fetchAll();
        
    } else {
        // Vendor - only their own bids
        $query = "SELECT b.*, t.title as tender_title, t.reference_no, t.status as tender_status,
                  t.closing_date
                  FROM bids b
                  JOIN tenders t ON b.tender_id = t.id
                  WHERE b.vendor_id = :vendor_id";
        
        $params = [':vendor_id' => $user['user_id']];
        
        if ($tenderId) {
            $query .= " AND b.tender_id = :tender_id";
            $params[':tender_id'] = $tenderId;
        }
        
        $query .= " ORDER BY b.submitted_at DESC";
        
        $stmt = $conn->prepare($query);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->execute();
        $bids = $stmt->fetchAll();
    }
    
    sendJsonResponse(['bids' => $bids]);
    
} catch (PDOException $e) {
    sendJsonResponse(['error' => 'Database error'], 500);
}
?>
