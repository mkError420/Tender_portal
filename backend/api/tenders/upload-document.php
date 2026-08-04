<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/middleware.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(['error' => 'Method not allowed'], 405);
}

// Admin only
$user = requireAdmin();

// Check for files - handle both 'file' and 'file[]' formats
if (!isset($_FILES['file']) && !isset($_FILES['file[]'])) {
    sendJsonResponse(['error' => 'No files uploaded'], 400);
}

if (!isset($_POST['tender_id'])) {
    sendJsonResponse(['error' => 'tender_id is required'], 400);
}

$files = isset($_FILES['file']) ? $_FILES['file'] : $_FILES['file[]'];
$tenderId = $_POST['tender_id'];

$database = new Database();
$conn = $database->getConnection();

try {
    // Check if tender exists
    $checkQuery = "SELECT id FROM tenders WHERE id = :id";
    $checkStmt = $conn->prepare($checkQuery);
    $checkStmt->bindParam(':id', $tenderId);
    $checkStmt->execute();
    
    if ($checkStmt->rowCount() === 0) {
        sendJsonResponse(['error' => 'Tender not found with ID: ' . $tenderId], 404);
    }
    
    $tenderUploadDir = UPLOAD_DIR . 'tenders/' . $tenderId . '/';
    
    // Check if upload directory exists and is writable
    if (!is_dir($tenderUploadDir)) {
        if (!mkdir($tenderUploadDir, 0777, true)) {
            sendJsonResponse(['error' => 'Failed to create upload directory'], 500);
        }
    }
    
    // Reorganize files array for multiple uploads
    $filesArray = [];
    
    // Handle different upload formats
    if (is_array($files['name'])) {
        // Multiple files uploaded as file[]
        for ($i = 0; $i < count($files['name']); $i++) {
            if ($files['error'][$i] === UPLOAD_ERR_OK) {
                $filesArray[] = [
                    'name' => $files['name'][$i],
                    'type' => $files['type'][$i],
                    'tmp_name' => $files['tmp_name'][$i],
                    'error' => $files['error'][$i],
                    'size' => $files['size'][$i]
                ];
            }
        }
    } elseif ($files['error'] === UPLOAD_ERR_OK) {
        // Single file uploaded
        $filesArray[] = $files;
    }
    
    if (empty($filesArray)) {
        sendJsonResponse(['error' => 'No valid files to upload'], 400);
    }
    
    // Handle single file or multiple files
    $uploadedFiles = [];
    $errors = [];
    
    foreach ($filesArray as $file) {
        // Check for upload errors
        if ($file['error'] !== UPLOAD_ERR_OK) {
            $errors[] = $file['name'] . ': Upload error code ' . $file['error'];
            continue;
        }
        
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
        $uploadPath = $tenderUploadDir . $safeFileName;
        
        // Move uploaded file
        if (!move_uploaded_file($file['tmp_name'], $uploadPath)) {
            $errors[] = $file['name'] . ': Failed to upload file - move_uploaded_file failed';
            continue;
        }
        
        // Store in database
        $fileUrl = '/uploads/tenders/' . $tenderId . '/' . $safeFileName;
        $query = "INSERT INTO tender_documents (tender_id, file_name, file_url, file_size) 
                  VALUES (:tender_id, :file_name, :file_url, :file_size)";
        
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':tender_id', $tenderId);
        $stmt->bindParam(':file_name', $file['name']);
        $stmt->bindParam(':file_url', $fileUrl);
        $stmt->bindParam(':file_size', $file['size']);
        
        if ($stmt->execute()) {
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
    
    if (!empty($uploadedFiles)) {
        sendJsonResponse([
            'message' => count($uploadedFiles) . ' document(s) uploaded successfully',
            'uploaded_files' => $uploadedFiles,
            'errors' => $errors
        ], 201);
    } else {
        sendJsonResponse(['error' => 'No files uploaded successfully', 'errors' => $errors], 500);
    }
    
} catch (PDOException $e) {
    sendJsonResponse(['error' => 'Database error: ' . $e->getMessage()], 500);
}
?>
