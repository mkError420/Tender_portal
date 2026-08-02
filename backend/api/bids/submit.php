<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/middleware.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(['error' => 'Method not allowed'], 405);
}

// Vendor only
$user = requireVendor();

$data = getJsonInput();

$requiredFields = ['tender_id', 'bid_amount'];
$missing = validateRequired($data, $requiredFields);

if (!empty($missing)) {
    sendJsonResponse(['error' => 'Missing required fields', 'fields' => $missing], 400);
}

$database = new Database();
$conn = $database->getConnection();

try {
    // Check if tender exists and is active
    $tenderQuery = "SELECT id, status, closing_date FROM tenders WHERE id = :tender_id";
    $tenderStmt = $conn->prepare($tenderQuery);
    $tenderStmt->bindParam(':tender_id', $data['tender_id']);
    $tenderStmt->execute();
    $tender = $tenderStmt->fetch();
    
    if (!$tender) {
        sendJsonResponse(['error' => 'Tender not found'], 404);
    }
    
    if ($tender['status'] !== 'active') {
        sendJsonResponse(['error' => 'Tender is not accepting bids'], 400);
    }
    
    if (strtotime($tender['closing_date']) < time()) {
        sendJsonResponse(['error' => 'Tender has closed'], 400);
    }
    
    // Check if vendor already submitted a bid
    $checkQuery = "SELECT id FROM bids WHERE tender_id = :tender_id AND vendor_id = :vendor_id";
    $checkStmt = $conn->prepare($checkQuery);
    $checkStmt->bindParam(':tender_id', $data['tender_id']);
    $checkStmt->bindParam(':vendor_id', $user['user_id']);
    $checkStmt->execute();
    
    if ($checkStmt->rowCount() > 0) {
        sendJsonResponse(['error' => 'You have already submitted a bid for this tender'], 409);
    }
    
    // Handle file upload if provided
    $attachmentUrl = null;
    if (isset($_FILES['attachment'])) {
        $file = $_FILES['attachment'];
        $validation = validateFileUpload($file);
        
        if (!$validation['valid']) {
            sendJsonResponse(['error' => $validation['message']], 400);
        }
        
        $safeFileName = sanitizeFileName($file['name']);
        $uploadPath = UPLOAD_DIR . $safeFileName;
        
        if (!move_uploaded_file($file['tmp_name'], $uploadPath)) {
            sendJsonResponse(['error' => 'Failed to upload attachment'], 500);
        }
        
        $attachmentUrl = '/uploads/' . $safeFileName;
    }
    
    // Insert bid
    $query = "INSERT INTO bids (tender_id, vendor_id, bid_amount, proposal_summary, attachment_url, status) 
              VALUES (:tender_id, :vendor_id, :bid_amount, :proposal_summary, :attachment_url, 'submitted')";
    
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':tender_id', $data['tender_id']);
    $stmt->bindParam(':vendor_id', $user['user_id']);
    $stmt->bindParam(':bid_amount', $data['bid_amount']);
    $stmt->bindParam(':proposal_summary', $data['proposal_summary']);
    $stmt->bindParam(':attachment_url', $attachmentUrl);
    
    if ($stmt->execute()) {
        sendJsonResponse([
            'message' => 'Bid submitted successfully',
            'bid_id' => $conn->lastInsertId()
        ], 201);
    } else {
        // Delete uploaded file if database insert fails
        if ($attachmentUrl) {
            unlink(UPLOAD_DIR . basename($attachmentUrl));
        }
        sendJsonResponse(['error' => 'Failed to submit bid'], 500);
    }
    
} catch (PDOException $e) {
    sendJsonResponse(['error' => 'Database error'], 500);
}
?>
