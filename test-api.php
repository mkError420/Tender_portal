<?php
/**
 * API Test Script for RCMC Tender Portal
 * This script tests the API endpoints without needing a frontend
 */

// Test configuration
$apiBaseUrl = 'https://rcmctender.free.je/api';
$testEmail = 'admin@rangpurgroup.com';
$testPassword = 'admin123';

echo "RCMC Tender Portal API Test Script\n";
echo "====================================\n\n";

// Test 1: Login API
echo "Test 1: Testing Login API\n";
echo "Endpoint: {$apiBaseUrl}/auth/login.php\n";
echo "Email: {$testEmail}\n";
echo "Password: {$testPassword}\n\n";

$loginData = [
    'email' => $testEmail,
    'password' => $testPassword
];

$ch = curl_init("{$apiBaseUrl}/auth/login.php");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($loginData));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($curlError) {
    echo "❌ CURL Error: {$curlError}\n";
} else {
    echo "HTTP Status Code: {$httpCode}\n";
    echo "Response: {$response}\n\n";
    
    if ($httpCode === 200) {
        $responseData = json_decode($response, true);
        if (isset($responseData['success']) && $responseData['success']) {
            echo "✅ Login successful!\n";
            if (isset($responseData['data']['token'])) {
                echo "Token received: " . substr($responseData['data']['token'], 0, 20) . "...\n";
            }
            if (isset($responseData['data']['user'])) {
                echo "User data: " . json_encode($responseData['data']['user'], JSON_PRETTY_PRINT) . "\n";
            }
        } else {
            echo "❌ Login failed: " . ($responseData['error'] ?? 'Unknown error') . "\n";
        }
    } else {
        echo "❌ HTTP Error: Status code {$httpCode}\n";
    }
}

// Test 2: Check API health
echo "\n\nTest 2: Testing API Health\n";
echo "Endpoint: {$apiBaseUrl}/\n\n";

$ch = curl_init("{$apiBaseUrl}/");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($curlError) {
    echo "❌ CURL Error: {$curlError}\n";
} else {
    echo "HTTP Status Code: {$httpCode}\n";
    echo "Response: {$response}\n";
}

echo "\n\n====================================\n";
echo "Test completed.\n";
?>
