<?php
header('Content-Type: application/json');

// Загрузка переменных окружения из .env файла
require_once __DIR__ . '/envloader.php';

// Получаем токен из переменных окружения
$botToken = getenv('TELEGRAM_BOT_TOKEN');
$chatId = getenv('TELEGRAM_CHAT_ID');

// Проверяем метод запроса
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Получаем данные из POST запроса
$name = filter_input(INPUT_POST, 'name', FILTER_SANITIZE_STRING);
$email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
$project = filter_input(INPUT_POST, 'project', FILTER_SANITIZE_STRING);
$message = filter_input(INPUT_POST, 'message', FILTER_SANITIZE_STRING);

// Проверяем обязательные поля
if (empty($name) || empty($email) || empty($message)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Пожалуйста, заполните все обязательные поля']);
    exit;
}

// Формируем текст сообщения
$text = "🔔 Новая заявка с сайта!\n\n";
$text .= "👤 Имя: $name\n";
$text .= "📧 Email: $email\n";
$text .= "🔧 Тип проекта: $project\n";
$text .= "💬 Сообщение: $message\n";

// URL для отправки сообщения в Telegram
$url = "https://api.telegram.org/bot$botToken/sendMessage";

// Параметры запроса
$params = [
    'chat_id' => $chatId,
    'text' => $text,
    'parse_mode' => 'HTML'
];

// Отправляем запрос в Telegram
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, $params);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// Проверяем результат
if ($httpCode == 200) {
    echo json_encode(['success' => true, 'message' => 'Ваша заявка успешно отправлена!']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Произошла ошибка при отправке заявки. Пожалуйста, попробуйте позже.']);
}
?>