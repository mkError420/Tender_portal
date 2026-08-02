<?php
/**
 * POST /api/auth/login.php
 * User Login Endpoint
 */

require_once __DIR__ . '/../config/Cors.php';
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../helpers/Response.php';
require_once __DIR__ . '/../helpers/JWT.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error("Method not allowed", 405);
}

$input = json_decode(file_get_contents('php://input'), true);

$email = isset($input['email']) ? trim($input['email']) : '';
$password = isset($input['password']) ? $input['password'] : '';

if (empty($email) || empty($password)) {
    Response::error("Email and password are required.");
}

$db = (new Database())->getConnection();

// Check if status column exists
$columnCheck = $db->query("SHOW COLUMNS FROM users LIKE 'status'");
$hasStatusColumn = $columnCheck->rowCount() > 0;

if ($hasStatusColumn) {
    $stmt = $db->prepare("SELECT id, name, email, password_hash, role, status, company_name, phone FROM users WHERE email = :email LIMIT 1");
} else {
    $stmt = $db->prepare("SELECT id, name, email, password_hash, role, company_name, phone FROM users WHERE email = :email LIMIT 1");
}
$stmt->execute([':email' => $email]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password_hash'])) {
    Response::error("Invalid email or password.", 401);
}

// Check if vendor account is active (if status column exists)
if ($hasStatusColumn && $user['role'] === 'vendor' && $user['status'] !== 'active') {
    Response::error("Your vendor account is not active. Please contact admin for approval.", 403);
}

$payload = [
    'id' => (int)$user['id'],
    'name' => $user['name'],
    'email' => $user['email'],
    'role' => $user['role'],
    'status' => $hasStatusColumn ? ($user['status'] ?? 'active') : 'active',
    'company_name' => $user['company_name']
];

$token = JWT::encode($payload);

Response::success("Login successful", [
    "token" => $token,
    "user" => $payload
]);
