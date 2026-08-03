<?php
/**
 * DELETE /api/tenders/delete.php
 * Delete a tender and all its documents/bids (Admin Only)
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
if (!$data || !isset($data['id'])) {
    Response::error("Missing tender id", 400);
}

$tenderId = (int) $data['id'];
if ($tenderId <= 0) {
    Response::error("Invalid tender id", 400);
}

$db = (new Database())->getConnection();

try {
    // Verify tender exists
    $stmt = $db->prepare("SELECT id, title FROM tenders WHERE id = :id LIMIT 1");
    $stmt->execute([':id' => $tenderId]);
    $tender = $stmt->fetch();

    if (!$tender) {
        Response::error("Tender not found", 404);
    }

    // Delete the tender (bids, tender_documents cascade via FK ON DELETE CASCADE)
    $deleteStmt = $db->prepare("DELETE FROM tenders WHERE id = :id");
    $deleteStmt->execute([':id' => $tenderId]);

    Response::success("Tender '{$tender['title']}' deleted successfully.", ['id' => $tenderId]);
} catch (PDOException $e) {
    Response::error("Database Error: " . $e->getMessage(), 500);
}
