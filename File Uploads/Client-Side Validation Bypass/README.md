# Client-Side Validation Bypass (Vượt qua xác thực phía Client)

## 1. Tổng quan về lỗ hổng
**Client-Side Validation** là quá trình kiểm tra dữ liệu đầu vào (như định dạng file, kích thước file) diễn ra ngay trên trình duyệt của người dùng (Browser) bằng các ngôn ngữ kịch bản như JavaScript, HTML5 attributes.

**Vấn đề:**
Việc kiểm tra này chỉ mang tính chất "hướng dẫn người dùng" và giảm tải cho server, chứ **không có giá trị bảo mật**. Kẻ tấn công có toàn quyền kiểm soát trình duyệt và các request gửi đi, do đó họ có thể dễ dàng vô hiệu hóa hoặc sửa đổi dữ liệu sau khi đã vượt qua lớp kiểm tra này nhưng trước khi dữ liệu đến Server.

Nếu Server tin tưởng tuyệt đối vào dữ liệu nhận được mà không kiểm tra lại (Server-Side Validation), hệ thống sẽ bị tổn thương.

## 2. Dấu hiệu nhận biết
Làm sao để biết một trang web đang sử dụng Client-Side Validation?

1.  **Phản hồi tức thì:** Khi bạn chọn một file sai định dạng (ví dụ `.php`), thông báo lỗi xuất hiện ngay lập tức mà trang web không hề tải lại (reload) và không có request nào được gửi đi trong tab **Network** của Developer Tools (F12).
2.  **Kiểm tra mã nguồn (View Source):** Bạn có thể tìm thấy các đoạn mã JavaScript kiểm tra đuôi file.
    *   Ví dụ: `if (file.name.split('.').pop() !== 'jpg') { alert('Error'); return false; }`
    *   Hoặc thuộc tính HTML5: `<input type="file" accept=".jpg,.png">`

## 3. Kỹ thuật khai thác (Exploitation)

Mục tiêu: Upload một file `shell.php` lên server chỉ cho phép ảnh (`.jpg`, `.png`).

### Phương pháp 1: Vô hiệu hóa JavaScript (Browser Settings)
Đây là cách đơn giản nhất nếu logic kiểm tra nằm hoàn toàn trong JS và form upload vẫn hoạt động khi tắt JS.

1.  **Truy cập cài đặt trình duyệt:**
    *   **Chrome:** `Settings` > `Privacy and security` > `Site Settings` > `JavaScript` > Chọn `Don't allow sites to use Javascript`.
    *   **Firefox:** Gõ `about:config` > Tìm `javascript.enabled` > Đổi thành `false`.
    *   **Extension:** Sử dụng extension như "NoScript" hoặc "Quick Javascript Switcher".
2.  **Thực hiện Upload:**
    *   Tải lại trang web (F5).
    *   Chọn file `shell.php`.
    *   Nhấn nút Upload. Do JS đã tắt, không có đoạn mã nào chặn bạn lại, trình duyệt sẽ gửi file đi.

### Phương pháp 2: Sử dụng Burp Suite (Proxy Interception) - **Khuyên dùng**
Phương pháp này ưu việt hơn vì không làm hỏng giao diện web và cho phép chỉnh sửa chi tiết gói tin HTTP.

**Bước 1: Chuẩn bị Payload**
*   Chuẩn bị file shell của bạn, ví dụ `shell.php`.
*   Đổi tên nó thành `shell.jpg`. Điều này giúp bạn vượt qua bước kiểm tra lúc chọn file của trình duyệt.

**Bước 2: Cấu hình Burp Suite**
*   Mở Burp Suite, vào tab **Proxy** > **Intercept**.
*   Đảm bảo chế độ **Intercept is On**.
*   Cấu hình trình duyệt để đi qua Proxy của Burp (thường là `127.0.0.1:8080`).

**Bước 3: Bắt gói tin**
*   Trên trình duyệt, chọn file `shell.jpg` (hợp lệ) và nhấn **Upload**.
*   Request sẽ bị treo lại và hiển thị trong Burp Suite.

**Bước 4: Sửa đổi gói tin (Tampering)**
Tại cửa sổ Intercept, bạn sẽ thấy nội dung request gửi đi. Hãy sửa lại các thông tin sau để khôi phục lại bản chất file độc hại:

1.  **Filename:** Tìm dòng `Content-Disposition`.
    *   Đổi `filename="shell.jpg"` thành `filename="shell.php"`.
2.  **Content-Type (Tùy chọn):**
    *   Nếu server kiểm tra MIME type, hãy giữ nguyên `image/jpeg`.
    *   Nếu server kiểm tra chặt chẽ MIME type phải khớp đuôi file, bạn có thể cần thử đổi thành `application/x-php`. Tuy nhiên, giữ `image/jpeg` thường an toàn hơn để bypass các bộ lọc cơ bản.

**Minh họa Request:**
*Trước khi sửa:*
```http
POST /upload HTTP/1.1
...
Content-Disposition: form-data; name="avatar"; filename="shell.jpg"
Content-Type: image/jpeg

<?php system($_GET['cmd']); ?>
```

*Sau khi sửa:*
```http
POST /upload HTTP/1.1
...
Content-Disposition: form-data; name="avatar"; filename="shell.php"
Content-Type: image/jpeg

<?php system($_GET['cmd']); ?>
```

**Bước 5: Gửi request**
*   Nhấn **Forward** để gửi request đã sửa đến Server.
*   Quan sát phản hồi (Response). Nếu nhận được `200 OK` hoặc thông báo thành công, bạn đã upload được file `.php`.

## 4. Biện pháp phòng chống (Remediation)

Để ngăn chặn lỗ hổng này, **KHÔNG BAO GIỜ** chỉ dựa vào kiểm tra phía Client.

1.  **Server-Side Validation (Bắt buộc):** Mọi dữ liệu nhận được phải được kiểm tra lại tại Server.
2.  **Kiểm tra phần mở rộng (Extension Whitelisting):**
    *   Chỉ cho phép các đuôi file an toàn cụ thể (ví dụ: `.jpg`, `.png`, `.pdf`).
    *   Từ chối tất cả các đuôi file khác (Blacklisting thường không hiệu quả vì có thể bị bypass bằng `.php5`, `.phtml`, ...).
3.  **Kiểm tra nội dung file (Magic Bytes):**
    *   Đọc vài byte đầu tiên của file (Header) để xác định định dạng thực sự, không tin vào `Content-Type` header.
    *   Ví dụ: File JPEG luôn bắt đầu bằng `FF D8 FF`.
4.  **Đổi tên file:**
    *   Không sử dụng tên file gốc do người dùng gửi lên.
    *   Tạo tên mới ngẫu nhiên (ví dụ: UUID) + đuôi file hợp lệ. Ví dụ: `avatar_12345.jpg`.
