<?php
require_once __DIR__ . '/../config/Cors.php';
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error("Method not allowed", 405);
}

// Admin only
$user = AuthMiddleware::enforceRole('admin');

// Get JSON input
$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    Response::error("Invalid JSON input", 400);
}

$requiredFields = ['name', 'email', 'password'];
foreach ($requiredFields as $field) {
    if (!isset($data[$field]) || empty(trim($data[$field]))) {
        Response::error("Missing required field: {$field}", 400);
    }
}

$name = trim($data['name']);
$email = trim(filter_var($data['email'], FILTER_SANITIZE_EMAIL));
$password = $data['password'];
$phone = isset($data['phone']) ? trim($data['phone']) : null;
$company_name = isset($data['company_name']) ? trim($data['company_name']) : null;

// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    Response::error("Invalid email format", 400);
}

// Validate password length
if (strlen($password) < 6) {
    Response::error("Password must be at least 6 characters long", 400);
}

$db = (new Database())->getConnection();

try {
    // Check if email already exists
    $checkQuery = "SELECT id FROM users WHERE email = :email LIMIT 1";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->bindParam(':email', $email);
    $checkStmt->execute();
    
    if ($checkStmt->rowCount() > 0) {
        Response::error("An account with this email address already exists", 409);
    }
    
    // Hash password
    $password_hash = password_hash($password, PASSWORD_BCRYPT);
    
    // Check if status column exists
    $columnCheck = $db->query("SHOW COLUMNS FROM users LIKE 'status'");
    $hasStatusColumn = $columnCheck->rowCount() > 0;
    
    // Insert new admin
    if ($hasStatusColumn) {
        $insertQuery = "INSERT INTO users (name, email, password_hash, role, status, phone, company_name) 
                       VALUES (:name, :email, :password_hash, 'admin', 'active', :phone, :company_name)";
        
        $stmt = $db->prepare($insertQuery);
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':password_hash', $password_hash);
        $stmt->bindParam(':phone', $phone);
        $stmt->bindParam(':company_name', $company_name);
    } else {
        $insertQuery = "INSERT INTO users (name, email, password_hash, role, phone, company_name) 
                       VALUES (:name, :email, :password_hash, 'admin', :phone, :company_name)";
        
        $stmt = $db->prepare($insertQuery);
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':password_hash', $password_hash);
        $stmt->bindParam(':phone', $phone);
        $stmt->bindParam(':company_name', $company_name);
    }
    
    if ($stmt->execute()) {
        $adminId = $db->lastInsertId();
        
        Response::success("Admin created successfully", [
            'admin_id' => $adminId,
            'name' => $name,
            'email' => $email
        ], 201);
    } else {
        Response::error("Failed to create admin", 500);
    }
    
} catch (Exception $e) {
    Response::error("Database Error: " . $e->getMessage(), 500);
}
?>
