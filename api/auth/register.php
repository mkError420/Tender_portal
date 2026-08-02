<?php
/**
 * POST /api/auth/register.php
 * Register a new Vendor or Admin user
 */

require_once __DIR__ . '/../config/Cors.php';
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../helpers/Response.php';
require_once __DIR__ . '/../helpers/JWT.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error("Method not allowed", 405);
}

$input = json_decode(file_get_contents('php://input'), true);

$name = isset($input['name']) ? trim($input['name']) : '';
$email = isset($input['email']) ? trim(filter_var($input['email'], FILTER_SANITIZE_EMAIL)) : '';
$password = isset($input['password']) ? $input['password'] : '';
$role = isset($input['role']) && in_array($input['role'], ['admin', 'vendor']) ? $input['role'] : 'vendor';
$phone = isset($input['phone']) ? trim($input['phone']) : null;
$company_name = isset($input['company_name']) ? trim($input['company_name']) : null;
$trade_license_no = isset($input['trade_license_no']) ? trim($input['trade_license_no']) : null;
$address = isset($input['address']) ? trim($input['address']) : null;

// Validation
if (empty($name) || empty($email) || empty($password)) {
    Response::error("Name, email, and password are required fields.");
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    Response::error("Invalid email format.");
}

if (strlen($password) < 6) {
    Response::error("Password must be at least 6 characters long.");
}

$db = (new Database())->getConnection();

// Check if email already exists
$stmt = $db->prepare("SELECT id FROM users WHERE email = :email LIMIT 1");
$stmt->execute([':email' => $email]);
if ($stmt->fetch()) {
    Response::error("An account with this email address already exists.", 409);
}

// Hash password securely
$password_hash = password_hash($password, PASSWORD_BCRYPT);

try {
    // Set default status based on role
    $status = ($role === 'vendor') ? 'pending' : 'active';
    
    // Check if status column exists
    $columnCheck = $db->query("SHOW COLUMNS FROM users LIKE 'status'");
    $hasStatusColumn = $columnCheck->rowCount() > 0;
    
    if ($hasStatusColumn) {
        $insertStmt = $db->prepare("
            INSERT INTO users (name, email, password_hash, role, status, phone, company_name, trade_license_no, address)
            VALUES (:name, :email, :password_hash, :role, :status, :phone, :company_name, :trade_license_no, :address)
        ");

        $insertStmt->execute([
            ':name' => $name,
            ':email' => $email,
            ':password_hash' => $password_hash,
            ':role' => $role,
            ':status' => $status,
            ':phone' => $phone,
            ':company_name' => $company_name,
            ':trade_license_no' => $trade_license_no,
            ':address' => $address
        ]);
    } else {
        $insertStmt = $db->prepare("
            INSERT INTO users (name, email, password_hash, role, phone, company_name, trade_license_no, address)
            VALUES (:name, :email, :password_hash, :role, :phone, :company_name, :trade_license_no, :address)
        ");

        $insertStmt->execute([
            ':name' => $name,
            ':email' => $email,
            ':password_hash' => $password_hash,
            ':role' => $role,
            ':phone' => $phone,
            ':company_name' => $company_name,
            ':trade_license_no' => $trade_license_no,
            ':address' => $address
        ]);
    }

    $userId = $db->lastInsertId();

    // Create JWT token
    $payload = [
        'id' => (int)$userId,
        'name' => $name,
        'email' => $email,
        'role' => $role,
        'company_name' => $company_name
    ];
    $token = JWT::encode($payload);

    $message = ($role === 'vendor') 
        ? "Vendor registration successful! Your account is pending admin approval." 
        : "Registration successful";

    Response::success($message, [
        "token" => $token,
        "user" => $payload
    ], 201);

} catch (Exception $e) {
    Response::error("Server Error: " . $e->getMessage(), 500);
}
