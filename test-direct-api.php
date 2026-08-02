<?php
/**
 * Direct API Test - Bypasses routing to test if PHP files work directly
 */

$apiBaseUrl = 'https://rcmctender.free.je/api';
$testEmail = 'admin@rangpurgroup.com';
$testPassword = 'admin123';

echo "Direct API Access Test\n";
echo "======================\n\n";

// Test direct access to login.php file
echo "Test 1: Direct access to login.php\n";
echo "URL: {$apiBaseUrl}/auth/login.php\n\n";

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
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false); // Don't follow redirects

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$redirectUrl = curl_getinfo($ch, CURLINFO_REDIRECT_URL);
$curlError = curl_error($ch);
curl_close($ch);

echo "HTTP Status Code: {$httpCode}\n";
if ($redirectUrl) {
    echo "Redirect URL: {$redirectUrl}\n";
}
if ($curlError) {
    echo "CURL Error: {$curlError}\n";
}
echo "Response: {$response}\n\n";

// Check if we need to use index.php routing
if ($httpCode === 302 || $httpCode === 301) {
    echo "❌ Still getting redirected. Trying alternative approach...\n\n";
    
    echo "Test 2: Access through index.php router\n";
    echo "URL: {$apiBaseUrl}/index.php/auth/login.php\n\n";
    
    $ch = curl_init("{$apiBaseUrl}/index.php/auth/login.php");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($loginData));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Accept: application/json'
    ]);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);
    
    echo "HTTP Status Code: {$httpCode}\n";
    if ($curlError) {
        echo "CURL Error: {$curlError}\n";
    }
    echo "Response: {$response}\n\n";
}

echo "======================\n";
echo "Test completed.\n";
?>