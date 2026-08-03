<?php
/**
 * Upload System Diagnostics
 * Hit this URL in browser: https://rcmctender.free.je/api/test-upload-config.php
 * DELETE this file from the server after debugging!
 */
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");

$uploadDir = __DIR__ . '/uploads/tenders/test_diag';

$report = [
    "php_version"          => PHP_VERSION,
    "file_uploads_enabled" => (bool)ini_get('file_uploads'),
    "upload_max_filesize"  => ini_get('upload_max_filesize'),
    "post_max_size"        => ini_get('post_max_size'),
    "max_file_uploads"     => ini_get('max_file_uploads'),
    "tmp_dir"              => sys_get_temp_dir(),
    "tmp_dir_writable"     => is_writable(sys_get_temp_dir()),
    "finfo_available"      => class_exists('finfo'),
    "mime_content_type_available" => function_exists('mime_content_type'),
    "upload_dir_target"    => $uploadDir,
];

// Test directory creation
if (!is_dir($uploadDir)) {
    $created = @mkdir($uploadDir, 0755, true);
    $report["mkdir_result"]  = $created ? "SUCCESS" : "FAILED";
    $report["mkdir_error"]   = $created ? null : error_get_last();
} else {
    $report["mkdir_result"]  = "ALREADY_EXISTS";
}

$report["upload_dir_exists"]   = is_dir($uploadDir);
$report["upload_dir_writable"] = is_dir($uploadDir) ? is_writable($uploadDir) : false;

// Test writing a file
if ($report["upload_dir_writable"]) {
    $testFile = $uploadDir . '/write_test_' . time() . '.txt';
    $written  = @file_put_contents($testFile, "write test");
    $report["write_test"] = ($written !== false) ? "SUCCESS" : "FAILED";
    if ($written !== false) @unlink($testFile);
} else {
    $report["write_test"] = "SKIPPED (dir not writable)";
}

// Cleanup test dir if empty
@rmdir($uploadDir);

echo json_encode($report, JSON_PRETTY_PRINT);
