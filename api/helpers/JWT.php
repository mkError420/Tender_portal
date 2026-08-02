<?php
/**
 * Rangpur Group Tender Management Portal
 * Lightweight JWT Helper Class for Bearer Tokens
 */

class JWT {
    private static $secret_key = "RangpurGroup_TenderPortal_SecretKey_2026";
    private static $alg = 'sha256';

    public static function encode($payload) {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $base64UrlHeader = self::base64UrlEncode($header);
        
        // Add default expiry (24 hours) if not present
        if (!isset($payload['exp'])) {
            $payload['exp'] = time() + (24 * 3600);
        }
        
        $base64UrlPayload = self::base64UrlEncode(json_encode($payload));
        $signature = hash_hmac(self::$alg, $base64UrlHeader . "." . $base64UrlPayload, self::$secret_key, true);
        $base64UrlSignature = self::base64UrlEncode($signature);

        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }

    public static function decode($token) {
        $tokenParts = explode('.', $token);
        if (count($tokenParts) !== 3) {
            return false;
        }

        $header = self::base64UrlDecode($tokenParts[0]);
        $payload = self::base64UrlDecode($tokenParts[1]);
        $providedSignature = $tokenParts[2];

        $base64UrlHeader = self::base64UrlEncode($header);
        $base64UrlPayload = self::base64UrlEncode($payload);
        $signature = hash_hmac(self::$alg, $base64UrlHeader . "." . $base64UrlPayload, self::$secret_key, true);
        $expectedSignature = self::base64UrlEncode($signature);

        if (!hash_equals($expectedSignature, $providedSignature)) {
            return false;
        }

        $decodedPayload = json_decode($payload, true);

        // Check token expiration
        if (isset($decodedPayload['exp']) && $decodedPayload['exp'] < time()) {
            return false;
        }

        return $decodedPayload;
    }

    private static function base64UrlEncode($data) {
        return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($data));
    }

    private static function base64UrlDecode($data) {
        $b64 = str_replace(['-', '_'], ['+', '/'], $data);
        return base64_decode($b64);
    }
}
