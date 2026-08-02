<?php
/**
 * POST /api/bids/submit.php
 * Submit a bid proposal for a tender (Vendor Only)
 * Handles optional file upload (PDF, DOCX, ZIP)
 */

require_once __DIR__ . '/../config/Cors.php';
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error("Method not allowed", 405);
}

// Enforce Vendor authentication
$vendor = AuthMiddleware::enforceRole('vendor');

// Support both JSON body and multipart/form-data
$tender_id = isset($_POST['tender_id']) ? (int)$_POST['tender_id'] : 0;
$bid_amount = isset($_POST['bid_amount']) ? (float)$_POST['bid_amount'] : 0.00;
$proposal_summary = isset($_POST['proposal_summary']) ? trim($_POST['proposal_summary']) : '';

if (!$tender_id) {
    $rawInput = json_decode(file_get_contents('php://input'), true);
    if ($rawInput) {
        $tender_id = isset($rawInput['tender_id']) ? (int)$rawInput['tender_id'] : 0;
        $bid_amount = isset($rawInput['bid_amount']) ? (float)$rawInput['bid_amount'] : 0.00;
        $proposal_summary = isset($rawInput['proposal_summary']) ? trim($rawInput['proposal_summary']) : '';
    }
}

if ($tender_id <= 0 || $bid_amount <= 0 || empty($proposal_summary)) {
    Response::error("Tender ID, valid positive Bid Amount, and Proposal Summary are required.");
}

$db = (new Database())->getConnection();

// 1. Verify Tender existence and check if active
$tenderStmt = $db->prepare("SELECT id, status, closing_date FROM tenders WHERE id = :id LIMIT 1");
$tenderStmt->execute([':id' => $tender_id]);
$tender = $tenderStmt->fetch();

if (!$tender) {
    Response::error("Tender not found.", 404);
}

if ($tender['status'] !== 'active') {
    Response::error("Bids can only be submitted for active tenders.", 400);
}

if (strtotime($tender['closing_date']) < time()) {
    Response::error("The deadline for this tender has expired.", 400);
}

// 2. Check if Vendor already submitted a bid for this tender
$existingBidStmt = $db->prepare("SELECT id FROM bids WHERE tender_id = :t_id AND vendor_id = :v_id LIMIT 1");
$existingBidStmt->execute([':t_id' => $tender_id, ':v_id' => $vendor['id']]);
if ($existingBidStmt->fetch()) {
    Response::error("You have already submitted a bid for this tender.", 409);
}

// 3. Handle Proposal Document File Upload (Safe Handling)
$attachment_urls = [];

$allowedExtensions = ['pdf', 'docx', 'doc', 'zip'];
$allowedMimeTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'application/zip',
    'application/x-zip-compressed'
];

$uploadFileDir = __DIR__ . '/../../uploads/proposals/';
if (!is_dir($uploadFileDir)) {
    mkdir($uploadFileDir, 0755, true);
}

$processFile = function ($fileTmpPath, $fileName, $fileSize, $fileType) use ($allowedExtensions, $allowedMimeTypes, $uploadFileDir, &$attachment_urls) {
    $fileNameCmps = explode('.', $fileName);
    $fileExtension = strtolower(end($fileNameCmps));

    if (!in_array($fileExtension, $allowedExtensions)) {
        Response::error("Invalid file format. Allowed extensions: PDF, DOCX, DOC, ZIP.", 400);
    }

    if ($fileSize > 10 * 1024 * 1024) {
        Response::error("File size exceeds 10MB maximum limit.", 400);
    }

    $newFileName = md5(time() . $fileName . random_bytes(6)) . '.' . $fileExtension;
    $dest_path = $uploadFileDir . $newFileName;

    if (!move_uploaded_file($fileTmpPath, $dest_path)) {
        Response::error("Failed to save uploaded attachment on server.", 500);
    }

    $attachment_urls[] = 'uploads/proposals/' . $newFileName;
};

if (isset($_FILES['attachments'])) {
    $files = $_FILES['attachments'];
    $fileCount = is_array($files['name']) ? count($files['name']) : 0;

    for ($i = 0; $i < $fileCount; $i++) {
        if ($files['error'][$i] === UPLOAD_ERR_OK) {
            $processFile($files['tmp_name'][$i], $files['name'][$i], $files['size'][$i], $files['type'][$i]);
        } elseif ($files['error'][$i] !== UPLOAD_ERR_NO_FILE) {
            Response::error("One or more attachments failed to upload.", 400);
        }
    }
} elseif (isset($_FILES['attachment']) && $_FILES['attachment']['error'] === UPLOAD_ERR_OK) {
    $processFile($_FILES['attachment']['tmp_name'], $_FILES['attachment']['name'], $_FILES['attachment']['size'], $_FILES['attachment']['type']);
}

$attachment_url = !empty($attachment_urls) ? json_encode($attachment_urls) : null;

try {
    $stmt = $db->prepare("
        INSERT INTO bids (tender_id, vendor_id, bid_amount, proposal_summary, attachment_url, status)
        VALUES (:tender_id, :vendor_id, :bid_amount, :proposal_summary, :attachment_url, 'submitted')
    ");

    $stmt->execute([
        ':tender_id' => $tender_id,
        ':vendor_id' => $vendor['id'],
        ':bid_amount' => $bid_amount,
        ':proposal_summary' => $proposal_summary,
        ':attachment_url' => $attachment_url
    ]);

    $bidId = $db->lastInsertId();

    Response::success("Bid proposal submitted successfully", [
        "bid_id" => (int)$bidId,
        "status" => "submitted"
    ], 201);
} catch (Exception $e) {
    Response::error("Database Error: " . $e->getMessage(), 500);
}
