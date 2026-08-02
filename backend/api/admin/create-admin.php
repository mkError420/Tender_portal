<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/middleware.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(['error' => 'Method not allowed'], 405);
}

// Admin only
$user = requireAdmin();

$data = getJsonInput();

$requiredFields = ['name', 'email', 'password'];
$missing = validateRequired($data, $requiredFields);

if (!empty($missing)) {
    sendJsonResponse(['error' => 'Missing required fields', 'fields' => $missing], 400);
}

$name = trim($data['name']);
$email = trim(filter_var($data['email'], FILTER_SANITIZE_EMAIL));
$password = $data['password'];
$phone = isset($data['phone']) ? trim($data['phone']) : null;
$company_name = isset($data['company_name']) ? trim($data['company_name']) : null;

// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendJsonResponse(['error' => 'Invalid email format'], 400);
}

// Validate password length
if (strlen($password) < 6) {
    sendJsonResponse(['error' => 'Password must be at least 6 characters long'], 400);
}

$database = new Database();
$conn = $database->getConnection();

try {
    // Check if email already exists
    $checkQuery = "SELECT id FROM users WHERE email = :email LIMIT 1";
    $checkStmt = $conn->prepare($checkQuery);
    $checkStmt->bindParam(':email', $email);
    $checkStmt->execute();
    
    if ($checkStmt->rowCount() > 0) {
        sendJsonResponse(['error' => 'An account with this email address already exists'], 409);
    }
    
    // Hash password
    $password_hash = password_hash($password, PASSWORD_DEFAULT);
    
    // Check if status column exists
    $columnCheck = $conn->query("SHOW COLUMNS FROM users LIKE 'status'");
    $hasStatusColumn = $columnCheck->rowCount() > 0;
    
    // Insert new admin
    if ($hasStatusColumn) {
        $query = "INSERT INTO users (name, email, password_hash, role, status, phone, company_name) 
                  VALUES (:name, :email, :password_hash, 'admin', 'active', :phone, :company_name)";
        
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':password_hash', $password_hash);
        $stmt->bindParam(':phone', $phone);
        $stmt->bindParam(':company_name', $company_name);
    } else {
        $query = "INSERT INTO users (name, email, password_hash, role, phone, company_name) 
                  VALUES (:name, :email, :password_hash, 'admin', :phone, :company_name)";
        
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':password_hash', $password_hash);
        $stmt->bindParam(':phone', $phone);
        $stmt->bindParam(':company_name', $company_name);
    }
    
    if ($stmt->execute()) {
        $adminId = $conn->lastInsertId();
        
        sendJsonResponse([
            'message' => 'Admin created successfully',
            'admin_id' => $adminId,
            'name' => $name,
            'email' => $email
        ], 201);
    } else {
        sendJsonResponse(['error' => 'Failed to create admin'], 500);
    }
    
} catch (PDOException $e) {
    sendJsonResponse(['error' => 'Database error'], 500);
}
?>
