<?php
/**
 * PUT /api/tenders/update.php
 * Update tender details or status (Admin Only)
 */

require_once __DIR__ . '/../config/Cors.php';
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

if ($_SERVER['REQUEST_METHOD'] !== 'PUT' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error("Method not allowed", 405);
}

// Ensure Admin permissions
AuthMiddleware::enforceRole('admin');

$input = json_decode(file_get_contents('php://input'), true);

$id = isset($input['id']) ? (int)$input['id'] : 0;
if ($id <= 0) {
    Response::error("Tender ID is required.");
}

$db = (new Database())->getConnection();

// Check if tender exists
$stmt = $db->prepare("SELECT id FROM tenders WHERE id = :id LIMIT 1");
$stmt->execute([':id' => $id]);
if (!$stmt->fetch()) {
    Response::error("Tender not found.", 404);
}

$fields = [];
$params = [':id' => $id];

if (isset($input['title'])) { $fields[] = "title = :title"; $params[':title'] = trim($input['title']); }
if (isset($input['description'])) { $fields[] = "description = :description"; $params[':description'] = trim($input['description']); }
if (isset($input['category'])) { $fields[] = "category = :category"; $params[':category'] = trim($input['category']); }
if (isset($input['estimated_budget'])) { $fields[] = "estimated_budget = :estimated_budget"; $params[':estimated_budget'] = (float)$input['estimated_budget']; }
if (isset($input['closing_date'])) { $fields[] = "closing_date = :closing_date"; $params[':closing_date'] = $input['closing_date']; }
if (isset($input['status'])) { 
    if (in_array($input['status'], ['draft', 'active', 'under_review', 'awarded', 'cancelled'])) {
        $fields[] = "status = :status"; 
        $params[':status'] = $input['status']; 
    }
}

if (empty($fields)) {
    Response::error("No fields specified to update.");
}

try {
    $sql = "UPDATE tenders SET " . implode(", ", $fields) . " WHERE id = :id";
    $updateStmt = $db->prepare($sql);
    $updateStmt->execute($params);

    Response::success("Tender updated successfully");
} catch (Exception $e) {
    Response::error("Database Error: " . $e->getMessage(), 500);
}
