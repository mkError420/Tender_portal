<?php
/**
 * POST /api/tenders/create.php
 * Create a new tender (Admin Only)
 */

require_once __DIR__ . '/../config/Cors.php';
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error("Method not allowed", 405);
}

// Ensure Admin permissions
$currentUser = AuthMiddleware::enforceRole('admin');

$input = json_decode(file_get_contents('php://input'), true);

$title = isset($input['title']) ? trim($input['title']) : '';
$reference_no = isset($input['reference_no']) ? trim($input['reference_no']) : '';
$description = isset($input['description']) ? trim($input['description']) : '';
$category = isset($input['category']) ? trim($input['category']) : '';
$estimated_budget = isset($input['estimated_budget']) ? (float)$input['estimated_budget'] : 0.00;
$publish_date = isset($input['publish_date']) ? $input['publish_date'] : date('Y-m-d H:i:s');
$closing_date = isset($input['closing_date']) ? $input['closing_date'] : '';
$status = isset($input['status']) && in_array($input['status'], ['draft', 'active', 'under_review', 'awarded', 'cancelled']) ? $input['status'] : 'draft';

if (empty($title) || empty($reference_no) || empty($description) || empty($category) || empty($closing_date)) {
    Response::error("Title, reference_no, description, category, and closing_date are required.");
}

$db = (new Database())->getConnection();

// Check if reference_no unique
$chkStmt = $db->prepare("SELECT id FROM tenders WHERE reference_no = :ref LIMIT 1");
$chkStmt->execute([':ref' => $reference_no]);
if ($chkStmt->fetch()) {
    Response::error("A tender with reference number '{$reference_no}' already exists.", 409);
}

try {
    $stmt = $db->prepare("
        INSERT INTO tenders (title, reference_no, description, category, estimated_budget, publish_date, closing_date, status, created_by)
        VALUES (:title, :reference_no, :description, :category, :estimated_budget, :publish_date, :closing_date, :status, :created_by)
    ");

    $stmt->execute([
        ':title' => $title,
        ':reference_no' => $reference_no,
        ':description' => $description,
        ':category' => $category,
        ':estimated_budget' => $estimated_budget,
        ':publish_date' => $publish_date,
        ':closing_date' => $closing_date,
        ':status' => $status,
        ':created_by' => $currentUser['id']
    ]);

    $tenderId = $db->lastInsertId();

    Response::success("Tender created successfully", [
        "id" => (int)$tenderId,
        "reference_no" => $reference_no
    ], 201);
} catch (Exception $e) {
    Response::error("Database Error: " . $e->getMessage(), 500);
}
