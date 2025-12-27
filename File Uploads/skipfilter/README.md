# Encoding Guide for `../hha.php`

Dưới đây là các phương pháp mã hóa cho chuỗi `../hha.php` để vượt qua các bộ lọc bảo mật hoặc sử dụng trong các ngữ cảnh khác nhau.

## 1. URL Encoding

Sử dụng khi chèn vào đường dẫn URL.

- **Chuỗi gốc:** `../hha.php`
- **Mã hóa (Standard):** `%2E%2E%2Fhha.php`
- **Mã hóa đầy đủ (Full URL Encode):** `%2E%2E%2F%68%68%61%2E%70%68%70`

## 2. Base64 Encoding

Sử dụng khi truyền dữ liệu qua các hàm giải mã base64 hoặc Basic Auth.

- **Chuỗi gốc:** `../hha.php`
- **Mã hóa:** `Li4vaGhhLnBocA==`

## 3. Double URL Encoding

Sử dụng để vượt qua các bộ lọc giải mã URL một lần (WAF bypass).

- **Mã hóa:** `%252E%252E%252Fhha.php`

## 4. PHP Code Snippet

Đoạn mã PHP để tạo ra các chuỗi mã hóa trên:

```php
<?php
$str = '../hha.php';
echo "Original: " . $str . "\n";
echo "URL Encoded: " . urlencode($str) . "\n";
echo "Base64 Encoded: " . base64_encode($str) . "\n";
// Double URL Encode
echo "Double URL Encoded: " . urlencode(urlencode($str)) . "\n";
?>
```
