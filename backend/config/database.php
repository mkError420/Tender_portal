<?php
// Database Configuration
class Database {
    private $host = 'sql200.infinityfree.com';
    private $db_name = 'if0_42423300_rcmc_tender';
    private $username = 'if0_42423300';
    private $password = 'rcmc123456789';
    private $conn;

    public function getConnection() {
        $this->conn = null;
        
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8mb4",
                $this->username,
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch(PDOException $e) {
            echo "Connection Error: " . $e->getMessage();
        }
        
        return $this->conn;
    }
}
?>
