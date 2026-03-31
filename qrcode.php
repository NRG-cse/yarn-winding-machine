<?php
require_once('phpqrcode/qrlib.php');

$host = 'localhost';
$dbname = 'qr_code_db';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    die("Database connection failed: " . $e->getMessage());
}

function generateSecureQRCode($data, $qrId, $pdo) {
    $token = bin2hex(random_bytes(16));
    $currentTime = date('Y-m-d H:i:s');
    
    $stmt = $pdo->prepare("INSERT INTO qr_codes (qr_id, token, generated_at, data) VALUES (?, ?, ?, ?)");
    $stmt->execute([$qrId, $token, $currentTime, $data]);
    
    $qrData = json_encode([
        'data' => $data,
        'id' => $qrId,
        'token' => $token
    ]);
    
    $filename = 'qrcodes/qr_' . $qrId . '.png';
    QRcode::png($qrData, $filename, QR_ECLEVEL_H, 10);
    
    return [
        'filename' => $filename,
        'qr_id' => $qrId,
        'time' => $currentTime
    ];
}

function verifyQRCode($scannedData, $pdo) {
    $decoded = json_decode($scannedData, true);
    
    if (!$decoded || !isset($decoded['id']) || !isset($decoded['token'])) {
        return [
            'valid' => false,
            'message' => 'Invalid QR code format',
            'data' => null,
            'time' => null
        ];
    }
    
    $qrId = $decoded['id'];
    $token = $decoded['token'];
    
    $stmt = $pdo->prepare("SELECT * FROM qr_codes WHERE qr_id = ? AND token = ?");
    $stmt->execute([$qrId, $token]);
    $qrRecord = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($qrRecord) {
        return [
            'valid' => true,
            'message' => 'Original QR Code',
            'data' => $qrRecord['data'],
            'time' => $qrRecord['generated_at'],
            'is_original' => true
        ];
    } else {
        $stmt = $pdo->prepare("SELECT * FROM qr_codes WHERE qr_id = ?");
        $stmt->execute([$qrId]);
        $qrExists = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($qrExists) {
            return [
                'valid' => false,
                'message' => 'This appears to be a copy or fake QR code',
                'data' => $decoded['data'] ?? null,
                'time' => null, 
                'is_original' => false
            ];
        }
        
        return [
            'valid' => false,
            'message' => 'QR code not found in system',
            'data' => null,
            'time' => null
        ];
    }
}

// HTML Interface
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Secure QR Code Generator</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        input[type="text"], textarea {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 16px;
        }
        button {
            background-color: #4CAF50;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
        }
        button:hover {
            background-color: #45a049;
        }
        .qr-result {
            text-align: center;
            margin-top: 30px;
            padding: 20px;
            border: 2px solid #4CAF50;
            border-radius: 10px;
            background-color: #f9f9f9;
        }
        .qr-image {
            max-width: 300px;
            margin: 20px auto;
            border: 1px solid #ddd;
            padding: 10px;
            background: white;
        }
        .verification-result {
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
        }
        .original {
            background-color: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
        }
        .copy {
            background-color: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
        }
        .info {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Secure QR Code Generator</h1>
        
        <?php
        if (!is_dir('qrcodes')) {
            mkdir('qrcodes', 0755, true);
        }
        
        $createTableSQL = "CREATE TABLE IF NOT EXISTS qr_codes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            qr_id VARCHAR(50) UNIQUE NOT NULL,
            token VARCHAR(32) NOT NULL,
            generated_at DATETIME NOT NULL,
            data TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )";
        
        $pdo->exec($createTableSQL);
        
        if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['generate'])) {
            $data = $_POST['data'] ?? '';
            $qrId = 'QR_' . time() . '_' . bin2hex(random_bytes(4));
            
            if (!empty($data)) {
                $result = generateSecureQRCode($data, $qrId, $pdo);
                echo "<div class='qr-result'>";
                echo "<h3>QR Code Generated Successfully!</h3>";
                echo "<p>ID: " . htmlspecialchars($result['qr_id']) . "</p>";
                echo "<p>Generated at: " . htmlspecialchars($result['time']) . "</p>";
                echo "<div class='qr-image'>";
                echo "<img src='" . htmlspecialchars($result['filename']) . "' alt='QR Code'>";
                echo "</div>";
                echo "<p><strong>Note:</strong> This QR code contains encrypted timestamp. Copies will not show the time.</p>";
                echo "</div>";
            }
        }
        
        if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['verify'])) {
            $scannedData = $_POST['scanned_data'] ?? '';
            
            if (!empty($scannedData)) {
                $verification = verifyQRCode($scannedData, $pdo);
                
                echo "<div class='verification-result " . ($verification['valid'] ? 'original' : ($verification['is_original'] === false ? 'copy' : 'info')) . "'>";
                echo "<h3>Verification Result</h3>";
                echo "<p><strong>Status:</strong> " . htmlspecialchars($verification['message']) . "</p>";
                
                if ($verification['valid']) {
                    echo "<p><strong>Data:</strong> " . htmlspecialchars($verification['data']) . "</p>";
                    echo "<p><strong>Generated at:</strong> " . htmlspecialchars($verification['time']) . "</p>";
                    echo "<p><em>✓ This is an original QR code</em></p>";
                } else if ($verification['is_original'] === false) {
                    echo "<p><strong>Data:</strong> " . htmlspecialchars($verification['data']) . "</p>";
                    echo "<p><strong>Time/Date:</strong> <span style='color:red'>NOT SHOWN - SUSPECTED COPY</span></p>";
                    echo "<p><em>✗ This appears to be a copy or fake QR code</em></p>";
                } else {
                    echo "<p><em>Unable to verify QR code</em></p>";
                }
                echo "</div>";
            }
        }
        ?>
        
        <div class="form-group">
            <h2>Generate New QR Code</h2>
            <form method="POST">
                <label for="data">Content to encode in QR:</label>
                <textarea name="data" id="data" rows="3" required placeholder="Enter text or URL..."></textarea>
                <br><br>
                <button type="submit" name="generate">Generate Secure QR Code</button>
            </form>
        </div>
        
        <hr>
        
        <div class="form-group">
            <h2>Verify QR Code</h2>
            <p>To test: Generate a QR code, then copy the JSON data below and paste it here to simulate scanning.</p>
            <form method="POST">
                <label for="scanned_data">Scanned QR Code Data (JSON):</label>
                <textarea name="scanned_data" id="scanned_data" rows="4" placeholder='Paste the scanned JSON data here...'></textarea>
                <br><br>
                <button type="submit" name="verify">Verify QR Code</button>
            </form>
        </div>
        
        <div class="info">
            <h3>How It Works:</h3>
            <ol>
                <li>Each QR code contains a unique encrypted token and timestamp</li>
                <li>The token and timestamp are stored in a secure database</li>
                <li>When scanning, the system checks if the token matches the database</li>
                <li>Original QR codes show the timestamp; copies/fakes do not</li>
                <li>Photocopies or photos lose the ability to show the timestamp</li>
            </ol>
        </div>
    </div>
</body>
</html>