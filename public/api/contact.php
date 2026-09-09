<?php
declare(strict_types=1);

// Disabled until the owner configures delivery and reviews the data-processing terms.
// No secrets in source, no HTML in Telegram messages, no false-positive delivery.
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function respond(int $status, bool $success, string $message): never {
    http_response_code($status);
    echo json_encode(['success' => $success, 'message' => $message], JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}
function field(string $key, int $max, bool $required = false): string {
    $value = $_POST[$key] ?? '';
    if (!is_string($value) || preg_match('//u', $value) !== 1) respond(422, false, 'Проверьте поля формы.');
    $value = trim($value);
    $length = preg_match_all('/./us', $value);
    if ($length === false || $length > $max || ($required && $value === '')) respond(422, false, 'Проверьте поля формы.');
    return $value;
}
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST'); respond(405, false, 'Используйте форму обращения.');
}
if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 16384) respond(413, false, 'Сообщение слишком большое.');
if (getenv('FORM_ENABLED') !== '1' || getenv('FORM_PRIVACY_READY') !== '1') respond(503, false, 'Напишите напрямую на почту или в Telegram.');
$expectedOrigin = rtrim((string)getenv('FORM_ORIGIN'), '/');
$origin = rtrim((string)($_SERVER['HTTP_ORIGIN'] ?? ''), '/');
if ($expectedOrigin === '' || $origin !== $expectedOrigin) respond(403, false, 'Отправьте запрос с сайта.');
if (($_SERVER['HTTP_SEC_FETCH_SITE'] ?? '') === 'cross-site') respond(403, false, 'Недопустимый источник запроса.');
if (field('website', 300) !== '') respond(422, false, 'Не удалось отправить запрос.');
if (($_POST['consent'] ?? '') !== '1') respond(422, false, 'Подтвердите условия обработки данных.');
$name = field('name', 80);
$contact = field('contact', 160, true);
$message = field('message', 3000);
$service = field('service', 32);
$allowed = ['' => 'Не определён', 'landing' => 'Лендинг', 'company' => 'Сайт компании', 'shop' => 'Интернет-магазин', 'improvements' => 'Доработка сайта', 'seo' => 'SEO', 'advertising' => 'Реклама', 'analytics' => 'Аналитика', 'integrations' => 'Интеграции', 'support' => 'Поддержка', 'other' => 'Другая задача'];
if (!array_key_exists($service, $allowed) || preg_match_all('/./us', $contact) < 3 || preg_match('/[\x00-\x1F\x7F]/', $contact)) respond(422, false, 'Проверьте контакт и выбранную услугу.');
$token = (string)getenv('TELEGRAM_BOT_TOKEN');
$chat = (string)getenv('TELEGRAM_CHAT_ID');
if (!preg_match('/^\d+:[A-Za-z0-9_-]+$/', $token) || !preg_match('/^-?\d+$/', $chat)) respond(503, false, 'Отправка временно недоступна. Напишите напрямую.');

// Throttle by the actual peer, not untrusted X-Forwarded-For. Only hashed keys/timestamps.
$dir = (string)(getenv('FORM_RATE_DIR') ?: sys_get_temp_dir() . '/saytmsk-rate');
if (!is_dir($dir) && !@mkdir($dir, 0700, true) && !is_dir($dir)) respond(503, false, 'Не удалось принять запрос.');
$key = hash_hmac('sha256', (string)($_SERVER['REMOTE_ADDR'] ?? 'unknown'), $token);
$handle = @fopen($dir . '/' . $key . '.json', 'c+');
if ($handle === false || !flock($handle, LOCK_EX)) respond(503, false, 'Не удалось принять запрос.');
$now = time();
$history = json_decode(stream_get_contents($handle) ?: '[]', true);
$history = is_array($history) ? array_values(array_filter($history, static fn($t) => is_int($t) && $t > $now - 3600)) : [];
if (count($history) >= 5 || ($history !== [] && max($history) > $now - 60)) {
    flock($handle, LOCK_UN); fclose($handle); header('Retry-After: 60'); respond(429, false, 'Подождите перед повторной отправкой.');
}
$history[] = $now;
rewind($handle); ftruncate($handle, 0); fwrite($handle, json_encode($history)); fflush($handle); flock($handle, LOCK_UN); fclose($handle);

$text = "Запрос с SAYTMSK\n\n" . 'Услуга: ' . $allowed[$service] . "\n" . 'Имя: ' . ($name ?: 'Не указано') . "\n" . 'Связь: ' . $contact . "\n\n" . $message;
$payload = http_build_query(['chat_id' => $chat, 'text' => $text, 'disable_web_page_preview' => 'true']);
$context = stream_context_create([
    'http' => ['method' => 'POST', 'header' => "Content-Type: application/x-www-form-urlencoded\r\nConnection: close\r\n", 'content' => $payload, 'timeout' => 10, 'ignore_errors' => true, 'follow_location' => 0],
    'ssl' => ['verify_peer' => true, 'verify_peer_name' => true],
]);
$response = @file_get_contents('https://api.telegram.org/bot' . $token . '/sendMessage', false, $context);
$decoded = is_string($response) ? json_decode($response, true) : null;
$statusLine = $http_response_header[0] ?? '';
if (preg_match('/^HTTP\/\S+ 200(?:\s|$)/', $statusLine) && is_array($decoded) && ($decoded['ok'] ?? false) === true && isset($decoded['result']['message_id'])) {
    respond(200, true, 'Запрос отправлен.');
}
// Do not log token, payload or upstream response (they may contain personal data).
respond(502, false, 'Подтверждение отправки не получено. Свяжитесь напрямую.');
