<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/middleware.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJsonResponse(['error' => 'Method not allowed'], 405);
}

// Admin only
$user = requireAdmin();

$database = new Database();
$conn = $database->getConnection();

try {
    // Get total tenders by status
    $tenderStatsQuery = "SELECT status, COUNT(*) as count FROM tenders GROUP BY status";
    $tenderStatsStmt = $conn->prepare($tenderStatsQuery);
    $tenderStatsStmt->execute();
    $tenderStats = $tenderStatsStmt->fetchAll();
    
    // Get total bids by status
    $bidStatsQuery = "SELECT status, COUNT(*) as count FROM bids GROUP BY status";
    $bidStatsStmt = $conn->prepare($bidStatsQuery);
    $bidStatsStmt->execute();
    $bidStats = $bidStatsStmt->fetchAll();
    
    // Get total vendors by status (check if status column exists)
    $columnCheck = $conn->query("SHOW COLUMNS FROM users LIKE 'status'");
    if ($columnCheck->rowCount() > 0) {
        $vendorStatsQuery = "SELECT status, COUNT(*) as count FROM users WHERE role = 'vendor' GROUP BY status";
        $vendorStatsStmt = $conn->prepare($vendorStatsQuery);
        $vendorStatsStmt->execute();
        $vendorStats = $vendorStatsStmt->fetchAll();
    } else {
        $vendorStats = [];
        $vendorCountQuery = "SELECT COUNT(*) as count FROM users WHERE role = 'vendor'";
        $vendorCountStmt = $conn->prepare($vendorCountQuery);
        $vendorCountStmt->execute();
        $count = $vendorCountStmt->fetch()['count'];
        $vendorStats[] = ['status' => 'active', 'count' => $count];
    }
    
    // Get total admins
    $adminCountQuery = "SELECT COUNT(*) as count FROM users WHERE role = 'admin'";
    $adminCountStmt = $conn->prepare($adminCountQuery);
    $adminCountStmt->execute();
    $adminCount = $adminCountStmt->fetch()['count'];
    
    // Get recent activity (last 10 tenders and bids)
    $recentTendersQuery = "SELECT id, title, reference_no, status, created_at 
                          FROM tenders ORDER BY created_at DESC LIMIT 5";
    $recentTendersStmt = $conn->prepare($recentTendersQuery);
    $recentTendersStmt->execute();
    $recentTenders = $recentTendersStmt->fetchAll();
    
    $recentBidsQuery = "SELECT b.id, b.bid_amount, b.status, b.submitted_at,
                       t.title as tender_title, u.name as vendor_name
                       FROM bids b
                       JOIN tenders t ON b.tender_id = t.id
                       JOIN users u ON b.vendor_id = u.id
                       ORDER BY b.submitted_at DESC LIMIT 5";
    $recentBidsStmt = $conn->prepare($recentBidsQuery);
    $recentBidsStmt->execute();
    $recentBids = $recentBidsStmt->fetchAll();
    
    // Format stats
    $tenderStatsByStatus = [];
    foreach ($tenderStats as $stat) {
        $tenderStatsByStatus[$stat['status']] = $stat['count'];
    }
    
    $bidStatsByStatus = [];
    foreach ($bidStats as $stat) {
        $bidStatsByStatus[$stat['status']] = $stat['count'];
    }
    
    $vendorStatsByStatus = [];
    foreach ($vendorStats as $stat) {
        $vendorStatsByStatus[$stat['status']] = $stat['count'];
    }
    
    sendJsonResponse([
        'tender_stats' => $tenderStatsByStatus,
        'bid_stats' => $bidStatsByStatus,
        'vendor_stats' => $vendorStatsByStatus,
        'total_vendors' => array_sum($vendorStatsByStatus),
        'total_tenders' => array_sum($tenderStatsByStatus),
        'total_bids' => array_sum($bidStatsByStatus),
        'total_admins' => $adminCount,
        'active_tenders' => $tenderStatsByStatus['active'] ?? 0,
        'pending_reviews' => $bidStatsByStatus['submitted'] ?? 0,
        'pending_vendors' => $vendorStatsByStatus['pending'] ?? 0,
        'recent_tenders' => $recentTenders,
        'recent_bids' => $recentBids
    ]);
    
} catch (PDOException $e) {
    sendJsonResponse(['error' => 'Database error'], 500);
}
?>
