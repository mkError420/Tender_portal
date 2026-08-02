<?php
require_once __DIR__ . '/../config/Cors.php';
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    Response::error("Method not allowed", 405);
}

// Admin only
$user = AuthMiddleware::enforceRole('admin');

$data = json_decode(file_get_contents('php://input'), true);
if (!$data || !isset($data['vendor_id'])) {
    Response::error("Missing vendor_id", 400);
}

$vendorId = (int) $data['vendor_id'];
if ($vendorId <= 0) {
    Response::error("Invalid vendor_id", 400);
}

$database = new Database();
$conn = $database->getConnection();

try {
    $stmt = $conn->prepare("SELECT id FROM users WHERE id = :vendor_id AND role = 'vendor'");
    $stmt->bindParam(':vendor_id', $vendorId);
    $stmt->execute();
    $vendor = $stmt->fetch();

    if (!$vendor) {
        Response::error("Vendor not found", 404);
    }

    $deleteStmt = $conn->prepare("DELETE FROM users WHERE id = :vendor_id AND role = 'vendor'");
    $deleteStmt->bindParam(':vendor_id', $vendorId);

    if ($deleteStmt->execute()) {
        Response::success("Vendor deleted successfully", ['vendor_id' => $vendorId]);
    } else {
        Response::error("Failed to delete vendor", 500);
    }
} catch (PDOException $e) {
    Response::error("Database Error: " . $e->getMessage(), 500);
}
