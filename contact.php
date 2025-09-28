<?php
// contact.php - Handles contact form submissions and saves to DB
header('Content-Type: application/json');
$DB_HOST = 'localhost';
$DB_NAME = 'greenshift_users';
$DB_USER = 'root';
$DB_PASS = '';
$charset = 'utf8mb4';
$dsn = "mysql:host=$DB_HOST;dbname=$DB_NAME;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
];
try {
    $pdo = new PDO($dsn, $DB_USER, $DB_PASS, $options);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database connection failed']);
    exit;
}
$data = json_decode(file_get_contents('php://input'), true);
if (!$data || !isset($data['name'], $data['email'], $data['message'])) {
    echo json_encode(['success' => false, 'error' => 'Invalid input']);
    exit;
}
// Create table if not exists
$pdo->exec("CREATE TABLE IF NOT EXISTS contact_queries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)");
$stmt = $pdo->prepare('INSERT INTO contact_queries (name, email, message) VALUES (?, ?, ?)');
$stmt->execute([$data['name'], $data['email'], $data['message']]);
echo json_encode(['success' => true]);
