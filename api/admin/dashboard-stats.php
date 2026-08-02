<?php
/**
 * GET /api/admin/dashboard-stats.php
 * Aggregated metric counts for Admin Dashboard
 */

require_once __DIR__ . '/../config/Cors.php';
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Response::error("Method not allowed", 405);
}

// Enforce Admin Access
AuthMiddleware::enforceRole('admin');

$db = (new Database())->getConnection();

try {
    // 1. Total Tenders Count
    $tendersCountStmt = $db->query("SELECT COUNT(*) as total, SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active FROM tenders");
    $tenderMetrics = $tendersCountStmt->fetch();

    // 2. Bids Count
    $bidsCountStmt = $db->query("
        SELECT COUNT(*) as total, 
               SUM(CASE WHEN status = 'submitted' THEN 1 ELSE 0 END) as pending_review,
               SUM(CASE WHEN status = 'shortlisted' THEN 1 ELSE 0 END) as shortlisted,
               SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) as accepted
        FROM bids
    ");
    $bidMetrics = $bidsCountStmt->fetch();

    // 3. Vendors Count
    $vendorsCountStmt = $db->query("SELECT COUNT(*) as total_vendors FROM users WHERE role = 'vendor'");
    $vendorMetrics = $vendorsCountStmt->fetch();

    // 4. Recent Bids Activity Stream
    $recentBidsStmt = $db->query("
        SELECT b.id, b.bid_amount, b.status, b.submitted_at, 
               t.title as tender_title, t.reference_no,
               u.name as vendor_name, u.company_name
        FROM bids b
        JOIN tenders t ON b.tender_id = t.id
        JOIN users u ON b.vendor_id = u.id
        ORDER BY b.submitted_at DESC
        LIMIT 6
    ");
    $recentBids = $recentBidsStmt->fetchAll();

    // 5. Recent Tenders Stream
    $recentTendersStmt = $db->query("
        SELECT id, title, reference_no, status, created_at, closing_date
        FROM tenders
        ORDER BY created_at DESC
        LIMIT 6
    ");
    $recentTenders = $recentTendersStmt->fetchAll();

    Response::success("Dashboard metrics fetched", [
        "metrics" => [
            "total_tenders" => (int)$tenderMetrics['total'],
            "active_tenders" => (int)$tenderMetrics['active'],
            "total_bids" => (int)$bidMetrics['total'],
            "pending_bids" => (int)$bidMetrics['pending_review'],
            "pending_reviews" => (int)$bidMetrics['pending_review'],
            "shortlisted_bids" => (int)$bidMetrics['shortlisted'],
            "accepted_bids" => (int)$bidMetrics['accepted'],
            "total_vendors" => (int)$vendorMetrics['total_vendors']
        ],
        "recent_bids" => $recentBids,
        "recent_tenders" => $recentTenders
    ]);

} catch (Exception $e) {
    Response::error("Database Error: " . $e->getMessage(), 500);
}
