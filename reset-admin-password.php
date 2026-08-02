<?php
/**
 * Reset Admin Password Script
 * This script resets the admin password to 'admin123'
 */

$host = 'sql200.infinityfree.com';
$db_name = 'if0_42423300_rcmc_tender';
$username = 'if0_42423300';
$password = 'rcmc123456789';

echo "Reset Admin Password\n";
echo "====================\n\n";

try {
    $dsn = "mysql:host=" . $host . ";dbname=" . $db_name . ";charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];
    
    $conn = new PDO($dsn, $username, $password, $options);
    echo "✓ Database Connection Successful!\n\n";
    
    // Generate new password hash for 'admin123'
    $newPassword = 'admin123';
    $newPasswordHash = password_hash($newPassword, PASSWORD_DEFAULT);
    
    echo "New password: {$newPassword}\n";
    echo "New hash: {$newPasswordHash}\n\n";
    
    // Update admin password
    $stmt = $conn->prepare("UPDATE users SET password_hash = :password_hash WHERE email = :email");
    $stmt->execute([
        ':password_hash' => $newPasswordHash,
        ':email' => 'admin@rangpurgroup.com'
    ]);
    
    if ($stmt->rowCount() > 0) {
        echo "✓ Admin password updated successfully!\n\n";
        
        // Verify the update
        $stmt = $conn->prepare("SELECT password_hash FROM users WHERE email = :email");
        $stmt->execute([':email' => 'admin@rangpurgroup.com']);
        $user = $stmt->fetch();
        
        if ($user && password_verify($newPassword, $user['password_hash'])) {
            echo "✓ Password verification successful!\n";
            echo "You can now login with:\n";
            echo "  Email: admin@rangpurgroup.com\n";
            echo "  Password: admin123\n";
        } else {
            echo "❌ Password verification failed after update.\n";
        }
    } else {
        echo "❌ No rows updated. Admin user may not exist.\n";
    }
    
} catch (PDOException $e) {
    echo "❌ Database Error: " . $e->getMessage() . "\n";
}
?>
