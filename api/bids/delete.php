<?php
/**
 * DELETE /api/bids/delete.php
 * Delete a bid and its documents (Admin Only)
 */

require_once __DIR__ . '/../config/Cors.php';
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    Response::error("Method not allowed", 405);
}

// Admin only
$user = AuthMiddleware::enforceRole('admin');

$data = json_decode(file_get_contents('php://input'), true);
if (!$data || !isset($data['bid_id'])) {
    Response::error("Missing bid_id", 400);
}

$bidId = (int) $data['bid_id'];
if ($bidId <= 0) {
    Response::error("Invalid bid_id", 400);
}

$db = (new Database())->getConnection();

try {
    // Verify bid exists
    $stmt = $db->prepare("SELECT id, vendor_id, tender_id FROM bids WHERE id = :id LIMIT 1");
    $stmt->execute([':id' => $bidId]);
    $bid = $stmt->fetch();

    if (!$bid) {
        Response::error("Bid not found", 404);
    }

    // Delete the bid (bid_documents cascade via FK ON DELETE CASCADE)
    $deleteStmt = $db->prepare("DELETE FROM bids WHERE id = :id");
    $deleteStmt->execute([':id' => $bidId]);

    Response::success("Bid deleted successfully.", ['bid_id' => $bidId]);
} catch (PDOException $e) {
    Response::error("Database Error: " . $e->getMessage(), 500);
}
