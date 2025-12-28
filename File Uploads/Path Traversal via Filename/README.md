# Path Traversal via Filename (Leo thang thư mục qua tên file)

## 1. Tổng quan về lỗ hổng
**Path Traversal** (hay Directory Traversal) trong tính năng upload file xảy ra khi ứng dụng sử dụng trực tiếp tên file (filename) do người dùng cung cấp để nối vào đường dẫn lưu trữ trên server mà không lọc bỏ các ký tự điều hướng thư mục.

**Cơ chế:**
Thông thường, server sẽ lưu file theo công thức:
`Đường dẫn lưu` = `Thư mục gốc` + `Tên file người dùng gửi`

Nếu kẻ tấn công gửi tên file là `../../shell.php`, và server không kiểm tra:
`Đường dẫn lưu` = `/var/www/html/uploads/` + `../../shell.php`
=> Hệ điều hành sẽ xử lý thành: `/var/www/html/shell.php`

**Mục tiêu tấn công:**
1.  **Thoát khỏi thư mục upload:** Thư mục upload thường bị cấu hình chặn thực thi script (ví dụ: file `.php` trong `/uploads/` sẽ không chạy được). Kẻ tấn công cần đưa file ra ngoài thư mục này (ví dụ về `/var/www/html/`) để thực thi mã.
2.  **Ghi đè file hệ thống:** Ghi đè các file cấu hình quan trọng như `.htaccess`, `web.config` hoặc thậm chí file hệ thống nếu server chạy quyền cao (root/admin).

## 2. Kỹ thuật khai thác (Exploitation)

### Bước 1: Chuẩn bị
*   File payload: `shell.php`.
*   Công cụ: **Burp Suite**.

### Bước 2: Upload và Chặn bắt
*   Upload file bình thường.
*   Chặn request bằng Burp Suite (Intercept).

### Bước 3: Các dạng Payload tấn công

Tại dòng `Content-Disposition`, sửa tham số `filename` thành các dạng sau:

#### A. Payload cơ bản (Basic Traversal)
Sử dụng `../` (Linux) hoặc `..\` (Windows) để lùi thư mục.
```http
Content-Disposition: form-data; name="file"; filename="../../shell.php"
```
*Mục tiêu: Đưa file lên 2 cấp thư mục.*

#### B. Payload mã hóa (Encoding Bypass)
Nếu server có bộ lọc (WAF) chặn ký tự `.` hoặc `/`, hãy thử mã hóa URL.

*   **URL Encoded:**
    `filename="%2e%2e%2fshell.php"` (`../`)
*   **Double URL Encoded:** (Dùng khi server giải mã 1 lần rồi mới đưa qua bộ lọc)
    `filename="%252e%252e%252fshell.php"`

#### C. Payload đường dẫn tuyệt đối (Absolute Path)
Đôi khi server nối chuỗi bị lỗi hoặc sử dụng hàm copy file cho phép đường dẫn tuyệt đối.
```http
filename="/var/www/html/shell.php"
```
Hoặc trên Windows:
```http
filename="C:\xampp\htdocs\shell.php"
```

#### D. Null Byte Injection (Cũ nhưng vẫn gặp)
Một số ứng dụng cũ (viết bằng C/C++ hoặc PHP cũ) bị lỗi cắt chuỗi tại ký tự Null Byte (`%00`).
```http
filename="../../shell.php%00.jpg"
```
*Giải thích:* Server kiểm tra thấy đuôi `.jpg` (hợp lệ), nhưng khi lưu xuống đĩa, hệ điều hành cắt bỏ phần sau `%00`, chỉ lưu thành `shell.php`.

### Bước 4: Kiểm tra kết quả
Sau khi gửi request, hãy thử truy cập file tại vị trí mới dự đoán.
*   Nếu upload vào `/uploads/`, hãy thử truy cập `http://target.com/shell.php` (nếu dùng `../`).
*   Nếu file chạy được, bạn đã thành công.

## 3. Biện pháp phòng chống (Remediation)

### 1. Không sử dụng tên file từ người dùng (Khuyên dùng nhất)
Cách an toàn nhất là bỏ qua hoàn toàn tên file người dùng gửi lên. Server tự sinh ra một tên ngẫu nhiên duy nhất.
*   Ví dụ (PHP):
    ```php
    $new_filename = uniqid() . '.' . $extension;
    move_uploaded_file($tmp_name, 'uploads/' . $new_filename);
    ```

### 2. Stripping & Sanitization (Làm sạch dữ liệu)
Nếu bắt buộc phải dùng tên file gốc, hãy lọc bỏ mọi ký tự nguy hiểm.
*   Chỉ cho phép các ký tự chữ cái, số, dấu gạch ngang, gạch dưới.
*   Sử dụng hàm `basename()` trong PHP để chỉ lấy phần tên file cuối cùng, loại bỏ mọi đường dẫn.
    ```php
    $filename = basename($_FILES['file']['name']);
    ```

### 3. Validate Canonical Path (Kiểm tra đường dẫn thực)
Trước khi ghi file, hãy kiểm tra đường dẫn tuyệt đối của file đích xem nó có nằm trong thư mục cho phép hay không.





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