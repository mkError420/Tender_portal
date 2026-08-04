<?php
/**
 * GET /api/tenders/show.php?id={id}
 * Single tender details with attached documents & bids count
 */

require_once __DIR__ . '/../config/Cors.php';
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../helpers/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Response::error("Method not allowed", 405);
}

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
if ($id <= 0) {
    Response::error("Invalid or missing Tender ID.");
}

$db = (new Database())->getConnection();

try {
    $vendor = AuthMiddleware::optionalAuthenticate();
    $vendorId = ($vendor && $vendor['role'] === 'vendor') ? $vendor['id'] : null;

    $stmt = $db->prepare("SELECT t.*, u.name as creator_name, u.email as creator_email,
               (SELECT COUNT(*) FROM bids b WHERE b.tender_id = t.id) as bid_count,
               ((SELECT COUNT(*) FROM bids b2 WHERE b2.tender_id = t.id AND b2.vendor_id = :vendor_id) > 0) as has_bid
        FROM tenders t
        LEFT JOIN users u ON t.created_by = u.id
        WHERE t.id = :id
        LIMIT 1");
    $stmt->execute([':id' => $id, ':vendor_id' => $vendorId]);
    $tender = $stmt->fetch();

    if (!$tender) {
        Response::error("Tender not found.", 404);
    }

    // Fetch official documents attached to this tender
    $docStmt = $db->prepare("SELECT id, file_name, file_url, file_size, uploaded_at FROM tender_documents WHERE tender_id = :id");
    $docStmt->execute([':id' => $id]);
    $documents = $docStmt->fetchAll();

    $baseUrl = '';

    foreach ($documents as &$document) {
        if (!preg_match('/^https?:\/\//', $document['file_url'])) {
            $document['file_url'] = $baseUrl . '/' . ltrim($document['file_url'], '/');
        }
    }

    $tender['documents'] = $documents;
    $tender['can_submit'] = $tender['status'] === 'active' && strtotime($tender['closing_date']) >= time() && empty($tender['has_bid']) ? true : false;

    Response::success("Tender details retrieved", [
        "tender" => $tender
    ]);
} catch (Exception $e) {
    Response::error("Database Error: " . $e->getMessage(), 500);
}
