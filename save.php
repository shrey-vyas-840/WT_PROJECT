<?php

header('Content-Type: application/json');
$host = 'localhost';
$db   = 'wt_project'; // Make sure this matches your MySQL database name
$user = 'root';       // Use your MySQL username, often 'root'
$pass = ''; // Use your MySQL password (empty for XAMPP default)
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (PDOException $e) {
    http_response_code(500);
    

    echo json_encode(['success' => false, 'error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}


// Debug: Log received raw input and decoded data
$rawInput = file_get_contents('php://input');
file_put_contents(__DIR__ . '/debug_log.txt', "Raw input: " . $rawInput . "\n", FILE_APPEND);
$data = json_decode($rawInput, true);
file_put_contents(__DIR__ . '/debug_log.txt', "Decoded data: " . print_r($data, true) . "\n", FILE_APPEND);
if (!is_array($data)) {
    http_response_code(400);
    file_put_contents(__DIR__ . '/debug_log.txt', "Invalid input detected\n", FILE_APPEND);
    echo json_encode(['success' => false, 'error' => 'Invalid input']);
    exit;
}

$stmt = $pdo->prepare('INSERT INTO emissions (appliance, units, watt, hours, kwh, co2) VALUES (?, ?, ?, ?, ?, ?)');
$success = true;
foreach ($data as $row) {
    // Only insert if all required fields for the emissions table are present
    if (isset($row['appliance'], $row['units'], $row['watt'], $row['hours'], $row['kwh'], $row['co2'])) {
        try {
            $stmt->execute([
                $row['appliance'],
                $row['units'],
                $row['watt'],
                $row['hours'],
                $row['kwh'],
                $row['co2']
            ]);
            file_put_contents(__DIR__ . '/debug_log.txt', "Inserted row: " . print_r($row, true) . "\n", FILE_APPEND);
        }  catch (Exception $e) {
            $success = false;
            file_put_contents(__DIR__ . '/debug_log.txt', "SQL Error: " . $e->getMessage() . "\n", FILE_APPEND);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
            exit;
        }
    } else {
        // Log and skip rows that do not match the emissions table structure
        file_put_contents(__DIR__ . '/debug_log.txt', "Skipped row (not for emissions table): " . print_r($row, true) . "\n", FILE_APPEND);
    }
}
echo json_encode(['success' => $success]);
