<?php
// auth.php - Handles login/signup and user session
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
if (!$data) {
    echo json_encode(['success' => false, 'error' => 'Invalid input']);
    exit;
}
if ($data['action'] === 'signup') {
    $name = trim($data['name']);
    $email = strtolower(trim($data['email']));
    $password = $data['password'];
    if (!$name || !$email || !$password) {
        echo json_encode(['success' => false, 'error' => 'All fields required']);
        exit;
    }
    $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'error' => 'Email already registered']);
        exit;
    }
    $hash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
    $stmt->execute([$name, $email, $hash]);
    $user = ['id' => $pdo->lastInsertId(), 'name' => $name, 'email' => $email];
    echo json_encode(['success' => true, 'user' => $user]);
    exit;
}
if ($data['action'] === 'login') {
    $email = strtolower(trim($data['email']));
    $password = $data['password'];
    $stmt = $pdo->prepare('SELECT id, name, email, password FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    if ($user && password_verify($password, $user['password'])) {
        unset($user['password']);
        echo json_encode(['success' => true, 'user' => $user]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Invalid credentials']);
    }
    exit;
}
echo json_encode(['success' => false, 'error' => 'Invalid action']);
