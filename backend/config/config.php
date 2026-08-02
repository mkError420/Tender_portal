<?php
// General Configuration
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Error Reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Timezone
date_default_timezone_set('UTC');

// File Upload Configuration
define('UPLOAD_DIR', __DIR__ . '/../uploads/');
define('MAX_FILE_SIZE', 5 * 1024 * 1024); // 5MB
define('ALLOWED_EXTENSIONS', ['pdf', 'doc', 'docx', 'zip']);

// JWT Secret (In production, use environment variable)
define('JWT_SECRET', 'your-secret-key-change-in-production');

// Helper function to send JSON response
function sendJsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit();
}

// Helper function to get input data
function getJsonInput() {
    $input = file_get_contents('php://input');
    return json_decode($input, true) ?? [];
}

// Helper function to validate required fields
function validateRequired($data, $fields) {
    $missing = [];
    foreach ($fields as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            $missing[] = $field;
        }
    }
    return $missing;
}

// Helper function for file upload validation
function validateFileUpload($file) {
    if ($file['error'] !== UPLOAD_ERR_OK) {
        return ['valid' => false, 'message' => 'File upload error'];
    }
    
    if ($file['size'] > MAX_FILE_SIZE) {
        return ['valid' => false, 'message' => 'File size exceeds limit'];
    }
    
    $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($extension, ALLOWED_EXTENSIONS)) {
        return ['valid' => false, 'message' => 'Invalid file type'];
    }
    
    return ['valid' => true];
}

// Helper function to sanitize file name
function sanitizeFileName($fileName) {
    $extension = pathinfo($fileName, PATHINFO_EXTENSION);
    $baseName = pathinfo($fileName, PATHINFO_FILENAME);
    $baseName = preg_replace('/[^a-zA-Z0-9_-]/', '_', $baseName);
    return $baseName . '_' . time() . '.' . $extension;
}
?>
