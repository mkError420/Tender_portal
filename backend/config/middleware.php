<?php
require_once __DIR__ . '/jwt.php';

// Authentication Middleware
function authenticate() {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? '';
    
    if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        sendJsonResponse(['error' => 'Unauthorized'], 401);
    }
    
    $token = $matches[1];
    $payload = JWT::decode($token);
    
    if (!$payload) {
        sendJsonResponse(['error' => 'Invalid or expired token'], 401);
    }
    
    return $payload;
}

// Role-based access control
function requireRole($allowedRoles) {
    $user = authenticate();
    
    if (!in_array($user['role'], $allowedRoles)) {
        sendJsonResponse(['error' => 'Forbidden - Insufficient permissions'], 403);
    }
    
    return $user;
}

// Admin only middleware
function requireAdmin() {
    return requireRole(['admin']);
}

// Vendor only middleware
function requireVendor() {
    $user = requireRole(['vendor']);
    
    // Check if vendor account is active
    if (isset($user['status']) && $user['status'] !== 'active') {
        sendJsonResponse(['error' => 'Vendor account is not active'], 403);
    }
    
    return $user;
}
?>
