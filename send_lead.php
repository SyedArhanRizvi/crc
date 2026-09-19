<?php
ignore_user_abort(true);   // user redirect ho jaaye tab bhi script chalti rahe
set_time_limit(60);
header('Content-Type: application/json; charset=utf-8');

function respond($code, $arr) {
    http_response_code($code);
    echo json_encode($arr);
    exit;
}
function log_line($msg) {
    @file_put_contents(__DIR__ . '/lead_debug.log', date('c') . ' ' . $msg . PHP_EOL, FILE_APPEND);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(405, ['success' => false, 'message' => 'POST only']);
}

$script_url = "https://script.google.com/macros/s/AKfycbwSxbYbmgQg9E5DwJ0V5IfSKeV85mkLUU5hTH9MN-AWj8m39C_PnAVtvrf0wjDy-a8AVw/exec";

$name      = trim($_POST['name'] ?? '');
$email     = trim($_POST['email'] ?? '');
$mobile    = trim($_POST['mobile'] ?? '');
$message   = trim($_POST['message'] ?? '');
$form_name = trim($_POST['form_name'] ?? '');
$page_url  = trim($_POST['page_url'] ?? '');

log_line('INCOMING: ' . json_encode($_POST));

// ---- validation ----
$mobile_clean  = preg_replace('/[^\d+]/', '', $mobile);   // '+' rakho
$mobile_digits = preg_replace('/\D/', '', $mobile_clean);

if ($name === '' || mb_strlen($name) < 2) {
    respond(400, ['success' => false, 'message' => 'Valid name required']);
}
if (strlen($mobile_digits) < 7 || strlen($mobile_digits) > 15) {
    respond(400, ['success' => false, 'message' => 'Valid mobile required']);
}
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(400, ['success' => false, 'message' => 'Invalid email']);
}

$data = [
    'name'      => $name,
    'email'     => $email,
    'mobile'    => $mobile_clean,
    'form_name' => $form_name,
    'page_url'  => $page_url ?: ($_SERVER['HTTP_REFERER'] ?? ''),
    'message'   => $message
];

$ch = curl_init($script_url);
curl_setopt_array($ch, [
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => json_encode($data),
    CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_TIMEOUT        => 30,
    CURLOPT_CONNECTTIMEOUT => 10,
]);

$response    = curl_exec($ch);
$curl_error  = curl_error($ch);
$http_status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

log_line("GOOGLE status=$http_status curl_error=$curl_error response=" . substr((string)$response, 0, 500));

if ($response === false) {
    respond(500, ['success' => false, 'message' => 'cURL: ' . $curl_error]);
}
if ($http_status < 200 || $http_status >= 400) {
    respond(502, ['success' => false, 'message' => 'Google returned ' . $http_status]);
}

$decoded = json_decode($response, true);
if (is_array($decoded) && isset($decoded['success']) && $decoded['success'] === false) {
    respond(502, ['success' => false, 'message' => 'Script error', 'detail' => $decoded]);
}

respond(200, ['success' => true]);