<?php
/**
 * Rangpur Group Tender Management Portal
 * Database Connection Helper (PDO)
 */

class Database {
    private $host = "sql200.infinityfree.com";
    private $db_name = "if0_42423300_rcmc_tender";
    private $username = "if0_42423300";
    private $password = "rcmc123456789";
    private $conn = null;

    public function getConnection() {
        $this->conn = null;

        try {
            $dsn = "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8mb4";
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];
            
            $this->conn = new PDO($dsn, $this->username, $this->password, $options);
        } catch (PDOException $exception) {
            // Echo JSON error response if connection fails
            http_response_code(500);
            echo json_encode([
                "status" => "error",
                "message" => "Database Connection Failed: " . $exception->getMessage()
            ]);
            exit;
        }

        return $this->conn;
    }
}
