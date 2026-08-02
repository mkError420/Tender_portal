<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(['error' => 'Method not allowed'], 405);
}

$data = getJsonInput();

$requiredFields = ['name', 'email', 'password', 'role'];
$missing = validateRequired($data, $requiredFields);

if (!empty($missing)) {
    sendJsonResponse(['error' => 'Missing required fields', 'fields' => $missing], 400);
}

if (!in_array($data['role'], ['admin', 'vendor'])) {
    sendJsonResponse(['error' => 'Invalid role'], 400);
}

$database = new Database();
$conn = $database->getConnection();

try {
    // Check if email already exists
    $checkQuery = "SELECT id FROM users WHERE email = :email";
    $checkStmt = $conn->prepare($checkQuery);
    $checkStmt->bindParam(':email', $data['email']);
    $checkStmt->execute();
    
    if ($checkStmt->rowCount() > 0) {
        sendJsonResponse(['error' => 'Email already registered'], 409);
    }
    
    // Hash password
    $passwordHash = password_hash($data['password'], PASSWORD_DEFAULT);
    
    // Insert user with default status based on role
    $status = ($data['role'] === 'vendor') ? 'pending' : 'active';
    $query = "INSERT INTO users (name, email, password_hash, role, status, phone, company_name, trade_license_no, address)
              VALUES (:name, :email, :password_hash, :role, :status, :phone, :company_name, :trade_license_no, :address)";

    $stmt = $conn->prepare($query);
    $stmt->bindParam(':name', $data['name']);
    $stmt->bindParam(':email', $data['email']);
    $stmt->bindParam(':password_hash', $passwordHash);
    $stmt->bindParam(':role', $data['role']);
    $stmt->bindParam(':status', $status);
    $stmt->bindParam(':phone', $data['phone'] ?? null);
    $stmt->bindParam(':company_name', $data['company_name'] ?? null);
    $stmt->bindParam(':trade_license_no', $data['trade_license_no'] ?? null);
    $stmt->bindParam(':address', $data['address'] ?? null);
    
    if ($stmt->execute()) {
        $message = ($data['role'] === 'vendor') 
            ? 'Vendor registration successful! Your account is pending admin approval.'
            : 'User registered successfully';
        
        sendJsonResponse([
            'message' => $message,
            'user_id' => $conn->lastInsertId()
        ], 201);
    } else {
        sendJsonResponse(['error' => 'Registration failed'], 500);
    }
    
} catch (PDOException $e) {
    sendJsonResponse(['error' => 'Database error'], 500);
}
?>
