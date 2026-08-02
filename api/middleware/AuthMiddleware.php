<?php
/**
 * Rangpur Group Tender Management Portal
 * Authentication & Role-Based Access Control Guard
 */

require_once __DIR__ . '/../helpers/JWT.php';
require_once __DIR__ . '/../helpers/Response.php';

class AuthMiddleware {
    public static function authenticate() {
        $authHeader = '';
        if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $authHeader = trim($_SERVER['HTTP_AUTHORIZATION']);
        } elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
            $authHeader = trim($_SERVER['REDIRECT_HTTP_AUTHORIZATION']);
        } elseif (function_exists('getallheaders')) {
            $headers = getallheaders();
            $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : (isset($headers['authorization']) ? $headers['authorization'] : '');
        }

        if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            Response::error("Authorization header missing or invalid. Bearer token required.", 401);
        }

        $jwtToken = $matches[1];
        $userData = JWT::decode($jwtToken);

        if (!$userData) {
            Response::error("Invalid or expired authentication token.", 401);
        }

        return $userData;
    }

    public static function enforceRole($requiredRole) {
        $user = self::authenticate();

        if ($user['role'] !== $requiredRole) {
            Response::error("Forbidden: Access restricted to {$requiredRole}s only.", 403);
        }

        return $user;
    }
}
