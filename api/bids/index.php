<?php
/**
 * GET /api/bids/index.php
 * List bids with optional filtering by tender_id
 * Admins see all bids. Vendors see only their own bids.
 */

require_once __DIR__ . '/../config/Cors.php';
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Response::error("Method not allowed", 405);
}

// Authenticate user
$user = AuthMiddleware::authenticate();

$db = (new Database())->getConnection();

$tenderId = isset($_GET['tender_id']) ? (int)$_GET['tender_id'] : null;

$whereClauses = [];
$params = [];

// If user is a vendor, only show their bids
if ($user['role'] === 'vendor') {
    $whereClauses[] = "b.vendor_id = :vendor_id";
    $params[':vendor_id'] = $user['id'];
}

// Optional filter by tender_id
if ($tenderId) {
    $whereClauses[] = "b.tender_id = :tender_id";
    $params[':tender_id'] = $tenderId;
}

$sql = "
    SELECT b.id, b.tender_id, b.vendor_id, b.bid_amount, b.proposal_summary, 
           b.attachment_url, b.status, b.submitted_at, b.updated_at,
           t.title as tender_title, t.reference_no, t.status as tender_status,
           u.name as vendor_name, u.email as vendor_email, u.company_name
    FROM bids b
    JOIN tenders t ON b.tender_id = t.id
    JOIN users u ON b.vendor_id = u.id
";

try {
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $bids = $stmt->fetchAll();

    // Convert relative attachment URLs to absolute URLs
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'];
    $baseUrl = $protocol . '://' . $host;
    
    foreach ($bids as &$bid) {
        if ($bid['attachment_url'] && !preg_match('/^https?:\/\//', $bid['attachment_url'])) {
            $bid['attachment_url'] = $baseUrl . '/' . ltrim($bid['attachment_url'], '/');
        }
    }

    Response::success("Bids fetched successfully", [
        "count" => count($bids),
        "bids" => $bids
    ]);
} catch (Exception $e) {
    Response::error("Database Error: " . $e->getMessage(), 500);
}

if (!empty($whereClauses)) {
    $sql .= " WHERE " . implode(" AND ", $whereClauses);
}

$sql .= " ORDER BY b.submitted_at DESC";

try {
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $bids = $stmt->fetchAll();

    Response::success("Bids fetched successfully", [
        "count" => count($bids),
        "bids" => $bids
    ]);
} catch (Exception $e) {
    Response::error("Database Error: " . $e->getMessage(), 500);
}
