<?php
require_once '../config/Database.php';

// Allow only POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed"]);
    exit;
}

$database = new Database();
$db = $database->getConnection();

// Ensure the settings table exists (defensive - in case get.php was never called)
try {
    $db->exec("
        CREATE TABLE IF NOT EXISTS settings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            setting_key VARCHAR(50) UNIQUE NOT NULL,
            setting_value TEXT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
} catch (PDOException $e) {
    // Table may already exist, continue
}

$settingsToUpdate = [];
$errors = [];

// Handle normal text fields
$textFields = [
    'website_name', 'about_text', 'contact_email', 'contact_phone',
    'contact_address', 'projects_count', 'vendors_count',
    'experience_years', 'client_satisfaction'
];

foreach ($textFields as $field) {
    if (isset($_POST[$field])) {
        $settingsToUpdate[$field] = trim($_POST[$field]);
    }
}

// Handle logo upload (non-blocking: if it fails, still save text fields)
if (isset($_FILES['logo']) && $_FILES['logo']['error'] === UPLOAD_ERR_OK) {
    $uploadDir = __DIR__ . '/../uploads/logo/';

    // Create directory if it doesn't exist
    if (!file_exists($uploadDir)) {
        @mkdir($uploadDir, 0755, true);
    }

    $fileExtension = strtolower(pathinfo($_FILES['logo']['name'], PATHINFO_EXTENSION));
    $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

    if (in_array($fileExtension, $allowedExtensions) && in_array($_FILES['logo']['type'], $allowedTypes)) {
        $fileName = 'logo_' . time() . '.' . $fileExtension;
        $uploadPath = $uploadDir . $fileName;

        if (move_uploaded_file($_FILES['logo']['tmp_name'], $uploadPath)) {
            // Try to delete old logo
            try {
                $stmt = $db->prepare("SELECT setting_value FROM settings WHERE setting_key = 'logo_url'");
                $stmt->execute();
                $oldLogo = $stmt->fetchColumn();
                if ($oldLogo) {
                    $oldLogoPath = __DIR__ . '/../' . $oldLogo;
                    if (file_exists($oldLogoPath)) {
                        @unlink($oldLogoPath);
                    }
                }
            } catch (Exception $e) {
                // Non-fatal, continue
            }

            $settingsToUpdate['logo_url'] = 'uploads/logo/' . $fileName;
        } else {
            $errors[] = 'Logo upload failed. Text settings were saved.';
        }
    } else {
        $errors[] = 'Invalid logo file type. Only JPG, PNG, GIF, WEBP, SVG allowed.';
    }
}

// Update settings in DB one by one (no transaction for broader compatibility)
$updateStmt = $db->prepare("
    INSERT INTO settings (setting_key, setting_value)
    VALUES (:key, :value)
    ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
");

$failed = false;
foreach ($settingsToUpdate as $key => $value) {
    try {
        $updateStmt->execute([':key' => $key, ':value' => $value]);
    } catch (PDOException $e) {
        $failed = true;
        $errors[] = "Failed to save '{$key}': " . $e->getMessage();
    }
}

if ($failed && empty(array_diff(array_keys($settingsToUpdate), ['logo_url']))) {
    // All text fields failed
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Failed to save settings: " . implode('; ', $errors)
    ]);
} else {
    echo json_encode([
        "status" => "success",
        "message" => count($errors) > 0
            ? "Settings saved. Note: " . implode('; ', $errors)
            : "Settings updated successfully",
        "warnings" => $errors
    ]);
}
?>
