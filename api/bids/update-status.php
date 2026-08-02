<?php
/**
 * PUT /api/bids/update-status.php
 * Change bid status to shortlisted, accepted, or rejected (Admin Only)
 */

require_once __DIR__ . '/../config/Cors.php';
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

if ($_SERVER['REQUEST_METHOD'] !== 'PUT' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error("Method not allowed", 405);
}

// Enforce Admin permissions
AuthMiddleware::enforceRole('admin');

$input = json_decode(file_get_contents('php://input'), true);

$bid_id = isset($input['bid_id']) ? (int)$input['bid_id'] : 0;
$status = isset($input['status']) ? trim($input['status']) : '';
$admin_feedback = isset($input['admin_feedback']) ? trim($input['admin_feedback']) : null;

$allowedStatuses = ['submitted', 'shortlisted', 'accepted', 'rejected'];

if ($bid_id <= 0 || !in_array($status, $allowedStatuses)) {
    Response::error("Bid ID and a valid status ('submitted', 'shortlisted', 'accepted', 'rejected') are required.");
}

$db = (new Database())->getConnection();

// Check if bid exists
$stmt = $db->prepare("SELECT id, tender_id FROM bids WHERE id = :id LIMIT 1");
$stmt->execute([':id' => $bid_id]);
$bid = $stmt->fetch();

if (!$bid) {
    Response::error("Bid proposal not found.", 404);
}

try {
    $db->beginTransaction();

    $updateStmt = $db->prepare("
        UPDATE bids 
        SET status = :status, admin_feedback = :admin_feedback 
        WHERE id = :id
    ");

    $updateStmt->execute([
        ':status' => $status,
        ':admin_feedback' => $admin_feedback,
        ':id' => $bid_id
    ]);

    // If bid is accepted, set tender status to 'awarded'
    if ($status === 'accepted') {
        $tenderStmt = $db->prepare("UPDATE tenders SET status = 'awarded' WHERE id = :tender_id");
        $tenderStmt->execute([':tender_id' => $bid['tender_id']]);
    }

    $db->commit();

    Response::success("Bid status updated successfully to '{$status}'", [
        "bid_id" => $bid_id,
        "new_status" => $status
    ]);
} catch (Exception $e) {
    $db->rollBack();
    Response::error("Database Error: " . $e->getMessage(), 500);
}
