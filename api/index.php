<?php
/**
 * Rangpur Group Tender Management Portal
 * API Router - Main Entry Point
 */

// Set headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Get the request path
$requestUri = $_SERVER['REQUEST_URI'];
$scriptName = $_SERVER['SCRIPT_NAME'];

// Debug logging
error_log("Request URI: " . $requestUri);
error_log("Script Name: " . $scriptName);

// Remove script name from request URI to get the path
$path = str_replace(dirname($scriptName), '', $requestUri);
$path = str_replace('/index.php', '', $path);
$path = str_replace('/api', '', $path); // Remove /api prefix if present
$path = trim($path, '/');

error_log("Final path: " . $path);

// If path is empty, return API info
if (empty($path)) {
    echo json_encode([
        "status" => "success",
        "message" => "RCMC Tender Portal API",
        "version" => "1.0.0",
        "endpoints" => [
            "POST /api/auth/login.php" => "User login",
            "POST /api/auth/register.php" => "User registration",
            "GET /api/tenders/index.php" => "List all tenders",
            "GET /api/tenders/show.php" => "Get specific tender",
            "POST /api/tenders/create.php" => "Create new tender",
            "POST /api/bids/submit.php" => "Submit bid",
            "GET /api/admin/dashboard-stats.php" => "Admin dashboard statistics"
        ]
    ]);
    exit;
}

// Simple routing - just include the file if it exists
$filePath = __DIR__ . '/' . $path;

if (file_exists($filePath) && is_file($filePath)) {
    include $filePath;
} else {
    http_response_code(404);
    echo json_encode([
        "status" => "error",
        "message" => "Endpoint not found",
        "path" => $path
    ]);
}
?>
