# File Extension Obfuscation & Bypass Techniques

Tài liệu này mô tả các kỹ thuật làm mờ (obfuscation) phần mở rộng tệp để vượt qua các bộ lọc bảo mật (security filters) khi tải lên tệp (file upload), cũng như hướng dẫn khai thác lỗ hổng cụ thể.

## 1. Kỹ thuật làm mờ phần mở rộng (File Extension Obfuscation)

Ngay cả các danh sách đen (blacklists) toàn diện cũng có thể bị vượt qua bằng các kỹ thuật sau:

### Phân biệt chữ hoa chữ thường (Case Sensitivity)

Nếu hệ thống kiểm tra phân biệt chữ hoa chữ thường nhưng hệ thống xử lý tệp lại không, bạn có thể sử dụng các biến thể của phần mở rộng.

- Ví dụ: `exploit.pHp` thay vì `exploit.php`.

### Đa phần mở rộng (Multiple Extensions)

Tùy thuộc vào cách máy chủ phân tích tên tệp, tệp có thể được xử lý dựa trên phần mở rộng đầu tiên hoặc cuối cùng.

- Ví dụ: `exploit.php.jpg` (có thể được hiểu là ảnh JPG hoặc tệp PHP tùy cấu hình).

### Ký tự cuối cùng (Trailing Characters)

Một số hệ thống sẽ tự động loại bỏ khoảng trắng hoặc dấu chấm ở cuối tên tệp.

- Ví dụ: `exploit.php.`

### Mã hóa URL (URL Encoding)

Sử dụng mã hóa URL cho các ký tự đặc biệt như dấu chấm.

- Ví dụ: `exploit%2Ephp` (dấu chấm được mã hóa thành `%2E`).

### Null Byte Injection

Thêm ký tự null byte (`%00`) hoặc dấu chấm phẩy để đánh lừa trình phân tích cú pháp. Điều này thường hiệu quả khi có sự không nhất quán giữa ngôn ngữ kiểm tra (ví dụ: PHP/Java) và ngôn ngữ xử lý cấp thấp (C/C++).

- Ví dụ: `exploit.asp;.jpg` hoặc `exploit.asp%00.jpg`.

### Ký tự Unicode (Unicode Characters)

Sử dụng các ký tự Unicode đa byte có thể được chuyển đổi hoặc chuẩn hóa thành các ký tự nguy hiểm.

- Ví dụ: `xC0 x2E`, `xC4 xAE` có thể được dịch thành dấu chấm (`.`).

### Vượt qua bộ lọc loại bỏ (Stripping Bypass)

Nếu hệ thống loại bỏ phần mở rộng nguy hiểm nhưng không thực hiện đệ quy, bạn có thể lồng ghép các chuỗi.

- Ví dụ: `exploit.p.phphp` (sau khi loại bỏ `.php` ở giữa, nó trở thành `exploit.php`).

---

## 2. Kịch bản Khai thác (Exploit Walkthrough)

Dưới đây là ví dụ về cách khai thác lỗ hổng tải lên tệp để đọc nội dung tệp bí mật trên máy chủ.

### Mục tiêu

Đọc nội dung tệp `/home/carlos/secret`.

### Payload PHP

Tạo một tệp `exploit.php` với nội dung sau:

```php
<?php echo file_get_contents('/home/carlos/secret'); ?>
```

### Các bước thực hiện

1.  **Đăng nhập và Tải ảnh:**

    - Đăng nhập vào ứng dụng.
    - Tải lên một ảnh đại diện hợp lệ.
    - Quan sát yêu cầu `GET /files/avatars/<YOUR-IMAGE>` trong Burp Suite để biết đường dẫn lưu trữ.

2.  **Chuẩn bị Payload:**

    - Tạo tệp `exploit.php` với mã PHP ở trên.

3.  **Bắt và Sửa đổi Yêu cầu (Intercept & Modify):**

    - Thử tải lên `exploit.php`. Nếu bị chặn (chỉ cho phép JPG/PNG), hãy bắt yêu cầu `POST /my-account/avatar` trong Burp Suite.
    - Tìm tham số `filename` trong `Content-Disposition`.
    - Sửa đổi tên tệp để sử dụng kỹ thuật **Null Byte Injection**:
      ```
      filename="exploit.php%00.jpg"
      ```

4.  **Gửi và Kiểm tra:**

    - Gửi yêu cầu đã sửa đổi.
    - Nếu thành công, hệ thống có thể thông báo đã tải lên `exploit.php` (phần đuôi `.jpg` và null byte bị cắt bỏ).

5.  **Thực thi:**
    - Sử dụng Burp Repeater hoặc trình duyệt để truy cập tệp đã tải lên:
      `GET /files/avatars/exploit.php`
    - Phản hồi sẽ chứa nội dung của `/home/carlos/secret`.
