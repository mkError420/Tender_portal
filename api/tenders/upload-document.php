<?php
/**
 * POST /api/tenders/upload-document.php
 * Upload one or more documents for a tender (Admin Only)
 *
 * Expected multipart/form-data fields:
 *   - file[]       : One or more files
 *   - tender_id    : The ID of the tender to attach documents to
 */

require_once __DIR__ . '/../config/Cors.php';
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error("Method not allowed", 405);
}

// -----------------------------------------------------------------------
// Phase 0 – Server capability checks (return actionable errors early)
// -----------------------------------------------------------------------
if (!ini_get('file_uploads')) {
    Response::error("PHP file uploads are disabled on this server (file_uploads = Off). Contact your hosting provider.", 500);
}

// Require admin authentication
$currentUser = AuthMiddleware::enforceRole('admin');

// -----------------------------------------------------------------------
// Phase 1 – Input validation
// -----------------------------------------------------------------------
$tenderId = isset($_POST['tender_id']) ? (int)$_POST['tender_id'] : 0;
if ($tenderId <= 0) {
    Response::error("tender_id is required and must be a positive integer.", 400);
}

$db = (new Database())->getConnection();
$checkStmt = $db->prepare("SELECT id FROM tenders WHERE id = :id LIMIT 1");
$checkStmt->execute([':id' => $tenderId]);
if (!$checkStmt->fetch()) {
    Response::error("Tender with id {$tenderId} not found.", 404);
}

if (empty($_FILES['file']) || !isset($_FILES['file']['name']) || (is_array($_FILES['file']['name']) && empty($_FILES['file']['name'][0])) || (!is_array($_FILES['file']['name']) && empty($_FILES['file']['name']))) {
    Response::error("No files were uploaded. Please attach at least one file. (FILES array was empty)", 400);
}

// -----------------------------------------------------------------------
// Phase 2 – Upload directory setup
// -----------------------------------------------------------------------
$uploadBaseDir = __DIR__ . '/../uploads/tenders/' . $tenderId;

if (!is_dir($uploadBaseDir)) {
    $created = @mkdir($uploadBaseDir, 0755, true);
    if (!$created) {
        // Try parent directory first
        $parentDir = __DIR__ . '/../uploads/tenders';
        if (!is_dir($parentDir)) {
            @mkdir($parentDir, 0755, true);
        }
        $uploadsRoot = __DIR__ . '/../uploads';
        if (!is_dir($uploadsRoot)) {
            @mkdir($uploadsRoot, 0755, true);
        }
        // Try again after ensuring parents exist
        $created = @mkdir($uploadBaseDir, 0755, true);
        if (!$created) {
            Response::error(
                "Failed to create upload directory: {$uploadBaseDir}. " .
                "Please create the directory 'api/uploads/tenders/{$tenderId}/' manually via cPanel File Manager and set permissions to 755.",
                500
            );
        }
    }
}

if (!is_writable($uploadBaseDir)) {
    Response::error(
        "Upload directory exists but is not writable: {$uploadBaseDir}. " .
        "Please set directory permissions to 755 via cPanel File Manager.",
        500
    );
}

// -----------------------------------------------------------------------
// Phase 3 – Build public URL base
// -----------------------------------------------------------------------
$protocol      = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host          = $_SERVER['HTTP_HOST'] ?? 'rcmctender.free.je';
$uploadBaseUrl = $protocol . '://' . $host . '/api/uploads/tenders/' . $tenderId;

// -----------------------------------------------------------------------
// Phase 4 – Allowed types (extension-based fallback if finfo unavailable)
// -----------------------------------------------------------------------
$allowedExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'txt'];
$allowedMimeTypes  = [
    'application/pdf'                                                          => 'pdf',
    'application/msword'                                                       => 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => 'docx',
    'application/vnd.ms-excel'                                                 => 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'       => 'xlsx',
    'image/jpeg'                                                               => 'jpg',
    'image/png'                                                                => 'png',
    'text/plain'                                                               => 'txt',
];
$maxFileSizeBytes = 10 * 1024 * 1024; // 10 MB

/**
 * Detect MIME type using finfo if available, otherwise mime_content_type(),
 * otherwise fall back to extension-based detection.
 */
function detectMimeType($tmpPath, $originalName) {
    if (class_exists('finfo')) {
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mime  = $finfo->file($tmpPath);
        if ($mime) return $mime;
    }
    if (function_exists('mime_content_type')) {
        $mime = mime_content_type($tmpPath);
        if ($mime) return $mime;
    }
    // Extension fallback (last resort)
    $extMap = [
        'pdf'  => 'application/pdf',
        'doc'  => 'application/msword',
        'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'xls'  => 'application/vnd.ms-excel',
        'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'jpg'  => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'png'  => 'image/png',
        'txt'  => 'text/plain',
    ];
    $ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
    return isset($extMap[$ext]) ? $extMap[$ext] : 'application/octet-stream';
}

// -----------------------------------------------------------------------
// Phase 5 – Normalise $_FILES['file'] into an array of individual files
// -----------------------------------------------------------------------
$files = [];
if (is_array($_FILES['file']['name'])) {
    $fileCount = count($_FILES['file']['name']);
    for ($i = 0; $i < $fileCount; $i++) {
        $files[] = [
            'name'     => $_FILES['file']['name'][$i],
            'type'     => $_FILES['file']['type'][$i],
            'tmp_name' => $_FILES['file']['tmp_name'][$i],
            'error'    => $_FILES['file']['error'][$i],
            'size'     => $_FILES['file']['size'][$i],
        ];
    }
} else {
    // Single file not wrapped in array
    $files[] = [
        'name'     => $_FILES['file']['name'],
        'type'     => $_FILES['file']['type'],
        'tmp_name' => $_FILES['file']['tmp_name'],
        'error'    => $_FILES['file']['error'],
        'size'     => $_FILES['file']['size'],
    ];
}

// -----------------------------------------------------------------------
// Phase 6 – Process each file
// -----------------------------------------------------------------------
$uploaded   = [];
$errors     = [];

$insertStmt = $db->prepare(
    "INSERT INTO tender_documents (tender_id, file_name, file_url, file_size)
     VALUES (:tender_id, :file_name, :file_url, :file_size)"
);

foreach ($files as $file) {
    // Skip truly empty slots
    if ($file['error'] === UPLOAD_ERR_NO_FILE || empty($file['name'])) {
        continue;
    }

    // PHP upload error codes
    if ($file['error'] !== UPLOAD_ERR_OK) {
        $phpErrors = [
            UPLOAD_ERR_INI_SIZE   => "File exceeds the server's upload_max_filesize limit.",
            UPLOAD_ERR_FORM_SIZE  => "File exceeds the form's MAX_FILE_SIZE limit.",
            UPLOAD_ERR_PARTIAL    => "File was only partially uploaded.",
            UPLOAD_ERR_NO_TMP_DIR => "Server is missing a temporary upload folder.",
            UPLOAD_ERR_CANT_WRITE => "Server failed to write file to disk.",
            UPLOAD_ERR_EXTENSION  => "A PHP extension blocked the upload.",
        ];
        $errMsg = isset($phpErrors[$file['error']]) ? $phpErrors[$file['error']] : "Unknown PHP upload error code {$file['error']}.";
        $errors[] = "'{$file['name']}': {$errMsg}";
        continue;
    }

    // Size check (also catches server-side ini limits above)
    if ($file['size'] > $maxFileSizeBytes) {
        $sizeMb   = round($file['size'] / 1024 / 1024, 2);
        $errors[] = "'{$file['name']}': File size ({$sizeMb} MB) exceeds the 10 MB limit.";
        continue;
    }

    // Verify it is a real uploaded file
    if (!is_uploaded_file($file['tmp_name'])) {
        $errors[] = "'{$file['name']}': Security check failed – not a valid uploaded file.";
        continue;
    }

    // MIME / extension validation
    $mimeType = detectMimeType($file['tmp_name'], $file['name']);
    $ext      = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

    if (!array_key_exists($mimeType, $allowedMimeTypes) && !in_array($ext, $allowedExtensions)) {
        $errors[] = "'{$file['name']}': Unsupported file type ({$mimeType}, .{$ext}). Allowed: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, TXT.";
        continue;
    }

    // Build a safe, unique filename
    $safeBase        = preg_replace('/[^a-zA-Z0-9_\-]/', '_', pathinfo($file['name'], PATHINFO_FILENAME));
    $finalExt        = isset($allowedMimeTypes[$mimeType]) ? $allowedMimeTypes[$mimeType] : $ext;
    $uniqueName      = $safeBase . '_' . uniqid() . '.' . $finalExt;
    $destinationPath = $uploadBaseDir . '/' . $uniqueName;

    if (!move_uploaded_file($file['tmp_name'], $destinationPath)) {
        $errors[] = "'{$file['name']}': move_uploaded_file() failed. Destination: {$destinationPath}. Check server write permissions.";
        continue;
    }

    $fileUrl = $uploadBaseUrl . '/' . $uniqueName;

    try {
        $insertStmt->execute([
            ':tender_id' => $tenderId,
            ':file_name' => $file['name'],
            ':file_url'  => $fileUrl,
            ':file_size' => $file['size'],
        ]);
        $uploaded[] = [
            'file_name' => $file['name'],
            'file_url'  => $fileUrl,
            'file_size' => $file['size'],
        ];
    } catch (Exception $e) {
        @unlink($destinationPath);
        $errors[] = "'{$file['name']}': Database error – " . $e->getMessage();
    }
}

// -----------------------------------------------------------------------
// Phase 7 – Response
// -----------------------------------------------------------------------
if (empty($uploaded) && !empty($errors)) {
    Response::error("All file uploads failed. Details: " . implode(' | ', $errors), 422);
} elseif (!empty($errors)) {
    http_response_code(207);
    echo json_encode([
        "success" => true,
        "message" => "Some files were uploaded successfully, but others failed.",
        "data"    => ["uploaded" => $uploaded, "errors" => $errors],
    ]);
    exit;
} else {
    Response::success(
        count($uploaded) . " document(s) uploaded successfully.",
        ["uploaded" => $uploaded],
        201
    );
}
