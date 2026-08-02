<?php
/**
 * Rangpur Group Tender Management Portal
 * Standardized Response Helper
 */

class Response {
    public static function json($data, $statusCode = 200) {
        http_response_code($statusCode);
        echo json_encode($data);
        exit;
    }

    public static function error($message, $statusCode = 400, $errors = []) {
        http_response_code($statusCode);
        echo json_encode([
            "success" => false,
            "error" => $message,
            "details" => $errors
        ]);
        exit;
    }

    public static function success($message, $data = [], $statusCode = 200) {
        http_response_code($statusCode);
        echo json_encode([
            "success" => true,
            "message" => $message,
            "data" => $data
        ]);
        exit;
    }
}
