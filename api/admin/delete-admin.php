<?php
/**
 * DELETE /api/admin/delete-admin.php
 * Delete an admin user account (Admin Only)
 * Cannot delete yourself (the currently authenticated admin)
 */

require_once __DIR__ . '/../config/Cors.php';
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    Response::error("Method not allowed", 405);
}

// Admin only
$currentUser = AuthMiddleware::enforceRole('admin');

$data = json_decode(file_get_contents('php://input'), true);
if (!$data || !isset($data['admin_id'])) {
    Response::error("Missing admin_id", 400);
}

$adminId = (int) $data['admin_id'];
if ($adminId <= 0) {
    Response::error("Invalid admin_id", 400);
}

// Prevent self-deletion
if ($adminId === (int) $currentUser['id']) {
    Response::error("You cannot delete your own account.", 403);
}

$db = (new Database())->getConnection();

try {
    // Verify the target user is an admin
    $stmt = $db->prepare("SELECT id, name FROM users WHERE id = :id AND role = 'admin' LIMIT 1");
    $stmt->execute([':id' => $adminId]);
    $admin = $stmt->fetch();

    if (!$admin) {
        Response::error("Admin not found", 404);
    }

    $deleteStmt = $db->prepare("DELETE FROM users WHERE id = :id AND role = 'admin'");
    $deleteStmt->execute([':id' => $adminId]);

    Response::success("Admin '{$admin['name']}' deleted successfully.", ['admin_id' => $adminId]);
} catch (PDOException $e) {
    Response::error("Database Error: " . $e->getMessage(), 500);
}
