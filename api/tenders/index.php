<?php
/**
 * GET /api/tenders/index.php
 * List tenders with optional search, category, status, and pagination
 */

require_once __DIR__ . '/../config/Cors.php';
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../helpers/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Response::error("Method not allowed", 405);
}

$db = (new Database())->getConnection();

$vendor = AuthMiddleware::optionalAuthenticate();
$vendorId = ($vendor && $vendor['role'] === 'vendor') ? $vendor['id'] : null;

$status = isset($_GET['status']) ? trim($_GET['status']) : '';
$category = isset($_GET['category']) ? trim($_GET['category']) : '';
$search = isset($_GET['search']) ? trim($_GET['search']) : '';
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;

$whereClauses = [];
$params = [];

if (!empty($status)) {
    $whereClauses[] = "t.status = :status";
    $params[':status'] = $status;
}

if (!empty($category)) {
    $whereClauses[] = "t.category = :category";
    $params[':category'] = $category;
}

if (!empty($search)) {
    $whereClauses[] = "(t.title LIKE :search OR t.reference_no LIKE :search OR t.description LIKE :search)";
    $params[':search'] = '%' . $search . '%';
}

$sql = "
    SELECT t.id, t.title, t.reference_no, t.description, t.category, 
           t.estimated_budget, t.publish_date, t.closing_date, t.status, 
           t.created_at, u.name as creator_name,
           (SELECT COUNT(*) FROM bids b WHERE b.tender_id = t.id) as bid_count,
           ((SELECT COUNT(*) FROM bids b2 WHERE b2.tender_id = t.id AND b2.vendor_id = :vendor_id) > 0) as has_bid
    FROM tenders t
    LEFT JOIN users u ON t.created_by = u.id
";

if (!empty($whereClauses)) {
    $sql .= " WHERE " . implode(" AND ", $whereClauses);
}

$sql .= " ORDER BY t.created_at DESC LIMIT " . $limit;

try {
    $stmt = $db->prepare($sql);
    $params[':vendor_id'] = $vendorId;
    $stmt->execute($params);
    $tenders = $stmt->fetchAll();

    Response::success("Tenders fetched successfully", [
        "count" => count($tenders),
        "tenders" => $tenders
    ]);
} catch (Exception $e) {
    Response::error("Database Error: " . $e->getMessage(), 500);
}
