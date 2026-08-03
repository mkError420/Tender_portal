<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/middleware.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(['error' => 'Method not allowed'], 405);
}

// Vendor only
$user = requireVendor();

// Check if it's form data (multipart) or JSON
$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
$isFormData = strpos($contentType, 'multipart/form-data') !== false;

if ($isFormData) {
    // Handle multipart form data with file uploads
    $tenderId = $_POST['tender_id'] ?? '';
    $bidAmount = $_POST['bid_amount'] ?? '';
    $proposalSummary = $_POST['proposal_summary'] ?? '';
    
    $data = [
        'tender_id' => $tenderId,
        'bid_amount' => $bidAmount,
        'proposal_summary' => $proposalSummary
    ];
} else {
    // Handle JSON data
    $data = getJsonInput();
}

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
    
    // Insert bid first
    $query = "INSERT INTO bids (tender_id, vendor_id, bid_amount, proposal_summary, status) 
              VALUES (:tender_id, :vendor_id, :bid_amount, :proposal_summary, 'submitted')";
    
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':tender_id', $data['tender_id']);
    $stmt->bindParam(':vendor_id', $user['user_id']);
    $stmt->bindParam(':bid_amount', $data['bid_amount']);
    $stmt->bindParam(':proposal_summary', $data['proposal_summary']);
    
    if (!$stmt->execute()) {
        sendJsonResponse(['error' => 'Failed to submit bid'], 500);
    }
    
    $bidId = $conn->lastInsertId();
    
    // Handle file uploads if provided
    $uploadedFiles = [];
    $errors = [];
    
    if (isset($_FILES['attachments'])) {
        $files = $_FILES['attachments'];
        
        // Reorganize files array for multiple uploads
        $filesArray = [];
        if (is_array($files['name'])) {
            for ($i = 0; $i < count($files['name']); $i++) {
                $filesArray[] = [
                    'name' => $files['name'][$i],
                    'type' => $files['type'][$i],
                    'tmp_name' => $files['tmp_name'][$i],
                    'error' => $files['error'][$i],
                    'size' => $files['size'][$i]
                ];
            }
        } else {
            $filesArray[] = $files;
        }
        
        foreach ($filesArray as $file) {
            // Validate file upload
            $validation = validateFileUpload($file);
            if (!$validation['valid']) {
                $errors[] = $file['name'] . ': ' . $validation['message'];
                continue;
            }
            
            // Generate safe filename with timestamp to avoid conflicts
            $timestamp = time();
            $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
            $baseName = pathinfo($file['name'], PATHINFO_FILENAME);
            $safeFileName = sanitizeFileName($baseName) . '_' . $timestamp . '.' . $extension;
            $uploadPath = UPLOAD_DIR . $safeFileName;
            
            // Move uploaded file
            if (!move_uploaded_file($file['tmp_name'], $uploadPath)) {
                $errors[] = $file['name'] . ': Failed to upload file';
                continue;
            }
            
            // Store in database
            $fileUrl = '/uploads/' . $safeFileName;
            $docQuery = "INSERT INTO bid_documents (bid_id, file_name, file_url, file_size) 
                        VALUES (:bid_id, :file_name, :file_url, :file_size)";
            
            $docStmt = $conn->prepare($docQuery);
            $docStmt->bindParam(':bid_id', $bidId);
            $docStmt->bindParam(':file_name', $file['name']);
            $docStmt->bindParam(':file_url', $fileUrl);
            $docStmt->bindParam(':file_size', $file['size']);
            
            if ($docStmt->execute()) {
                $uploadedFiles[] = [
                    'document_id' => $conn->lastInsertId(),
                    'file_name' => $file['name'],
                    'file_url' => $fileUrl
                ];
            } else {
                // Delete file if database insert fails
                unlink($uploadPath);
                $errors[] = $file['name'] . ': Failed to save document';
            }
        }
    }
    
    sendJsonResponse([
        'message' => 'Bid submitted successfully',
        'bid_id' => $bidId,
        'uploaded_files' => $uploadedFiles,
        'errors' => $errors
    ], 201);
    
} catch (PDOException $e) {
    sendJsonResponse(['error' => 'Database error'], 500);
}
?>
