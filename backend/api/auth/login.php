<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(['error' => 'Method not allowed'], 405);
}

$data = getJsonInput();

$requiredFields = ['email', 'password'];
$missing = validateRequired($data, $requiredFields);

if (!empty($missing)) {
    sendJsonResponse(['error' => 'Missing required fields', 'fields' => $missing], 400);
}

$database = new Database();
$conn = $database->getConnection();

try {
    $query = "SELECT id, name, email, password_hash, role, phone, company_name 
              FROM users WHERE email = :email";
    
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':email', $data['email']);
    $stmt->execute();
    
    $user = $stmt->fetch();
    
    if (!$user || !password_verify($data['password'], $user['password_hash'])) {
        sendJsonResponse(['error' => 'Invalid credentials'], 401);
    }
    
    // Remove password hash from response
    unset($user['password_hash']);
    
    // Generate JWT token
    $payload = [
        'user_id' => $user['id'],
        'email' => $user['email'],
        'role' => $user['role'],
        'exp' => time() + (24 * 60 * 60) // 24 hours
    ];
    
    $token = JWT::encode($payload);
    
    sendJsonResponse([
        'message' => 'Login successful',
        'token' => $token,
        'user' => $user
    ]);
    
} catch (PDOException $e) {
    sendJsonResponse(['error' => 'Database error'], 500);
}
?>
