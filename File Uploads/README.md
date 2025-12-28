# File Upload Vulnerabilities

## 1. Tổng quan
Lỗ hổng tải lên tệp (File Upload Vulnerabilities) xảy ra khi máy chủ web cho phép người dùng tải lên các tệp tin mà không xác thực đầy đủ các thuộc tính như tên, loại, nội dung hoặc kích thước của tệp.

Việc không thực thi các hạn chế thích hợp có thể dẫn đến việc kẻ tấn công tải lên các tệp độc hại, gây ra các hậu quả nghiêm trọng như:
*   **Remote Code Execution (RCE):** Thực thi mã từ xa để chiếm quyền kiểm soát máy chủ.
*   **Defacement:** Thay đổi giao diện trang web.
*   **Denial of Service (DoS):** Làm quá tải hệ thống.
*   **Chiếm quyền điều khiển hệ thống tập tin:** Ghi đè các tệp cấu hình quan trọng.

## 2. Các kỹ thuật khai thác & Phòng chống

Dưới đây là danh sách các kỹ thuật tấn công phổ biến đã được tài liệu hóa trong thư mục này:

### Cơ bản
*   **[Client-Side Validation Bypass](./Client-Side%20Validation%20Bypass/)**: Vượt qua các kiểm tra JavaScript trên trình duyệt.
*   **[File Extensions](./File%20Extensions/)**: Kỹ thuật thay đổi đuôi file, bypass blacklist/whitelist.
*   **[Flawed Validation](./Flawed%20validation%20/)**: Vượt qua kiểm tra nội dung (Magic Bytes, Polyglot files).

### Cấu hình Server
*   **[Apache .htaccess](./htaccess/)**: Tấn công ghi đè cấu hình trên máy chủ Apache.
*   **[IIS web.config](./IIS/)**: Tấn công ghi đè cấu hình trên máy chủ IIS.

### Nâng cao
*   **[Advanced Exploitation](./Advanced%20Exploitation/)**: Khai thác Race Conditions và HTTP PUT method.
*   **[Path Traversal via Filename](./Path%20Traversal%20via%20Filename/)**: Leo thang thư mục để ghi file vào vị trí nhạy cảm.
*   **[XXE Injection via File Upload](./XXE%20Injection%20via%20File%20Upload/)**: Tấn công XXE qua file SVG hoặc Office.
*   **[ImageTragick Exploitation](./ImageTragick%20Exploitation/)**: Khai thác lỗ hổng RCE trong thư viện ImageMagick.
*   **[Zip Slip Vulnerability](./Zip%20Slip%20Vulnerability/)**: Ghi đè file tùy ý thông qua giải nén file Zip độc hại.

## 3. Môi trường thực hành (Labs)
*(Coming Soon)*
Trong tương lai, phần này sẽ cập nhật các liên kết đến môi trường Lab (Docker/Web) để bạn có thể thực hành trực tiếp các kỹ thuật trên một cách an toàn.

*   [Link to Lab 1] - Client-Side Bypass
*   [Link to Lab 2] - Magic Bytes & Polyglot
*   [Link to Lab 3] - Race Conditions

---
⚠️ **Lưu ý:** Tài liệu này chỉ phục vụ mục đích nghiên cứu và giáo dục. Không sử dụng các kỹ thuật này để tấn công các hệ thống không thuộc quyền sở hữu của bạn.
