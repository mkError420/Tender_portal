<?php
require_once '../config/Database.php';

$database = new Database();
$db = $database->getConnection();

// Create table if it doesn't exist
$createTableQuery = "
CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(50) UNIQUE NOT NULL,
    setting_value TEXT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
";

try {
    $db->exec($createTableQuery);

    // Insert default settings if table is empty
    $checkQuery = "SELECT COUNT(*) as count FROM settings";
    $stmt = $db->query($checkQuery);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($row['count'] == 0) {
        $defaultSettings = [
            'website_name' => 'Rangpur Group',
            'logo_url' => '',
            'about_text' => 'Rangpur Group is a leading organization committed to transparency and efficiency in procurement processes. Our tender management portal provides a secure and user-friendly platform for vendors to participate in our procurement opportunities.',
            'contact_email' => 'elearning.rcnc@gmail.com',
            'contact_phone' => '+880 17**-******',
            'contact_address' => 'Rangpur, Bangladesh',
            'projects_count' => '500+',
            'vendors_count' => '200+',
            'experience_years' => '15+',
            'client_satisfaction' => '98%'
        ];

        $insertQuery = "INSERT INTO settings (setting_key, setting_value) VALUES (:key, :value)";
        $stmt = $db->prepare($insertQuery);
        
        foreach ($defaultSettings as $key => $value) {
            $stmt->execute([':key' => $key, ':value' => $value]);
        }
    }

    // Fetch all settings
    $fetchQuery = "SELECT setting_key, setting_value FROM settings";
    $stmt = $db->query($fetchQuery);
    $settingsList = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $settings = [];
    foreach ($settingsList as $row) {
        $settings[$row['setting_key']] = $row['setting_value'];
    }

    echo json_encode([
        "status" => "success",
        "data" => $settings
    ]);

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Database error: " . $e->getMessage()
    ]);
}
?>
