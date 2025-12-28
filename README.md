# Vulnerabilities & Exploitation Techniques

Chào mừng đến với kho lưu trữ **Vulnerabilities**. Đây là nơi tổng hợp các tài liệu nghiên cứu, hướng dẫn khai thác (PoC) và biện pháp phòng chống cho các lỗ hổng bảo mật web phổ biến và nâng cao.

Mục tiêu của kho lưu trữ này là cung cấp kiến thức chuyên sâu cho các Pentester, Security Researcher và Developer để hiểu rõ bản chất của từng lỗ hổng, từ đó xây dựng các hệ thống an toàn hơn.

---

## 📂 Danh mục Lỗ hổng (Categories)

### 1. [File Upload Vulnerabilities](./File%20Uploads/)

Tập hợp các kỹ thuật tấn công và khai thác liên quan đến chức năng tải lên tệp tin.

- **Cơ bản:** Bypass Client-side validation, Blacklist/Whitelist extension.
- **Nâng cao:** Race Conditions, HTTP PUT method.
- **Kỹ thuật đặc biệt:** Polyglot files, ImageTragick, Zip Slip, XXE via Upload.
- **Cấu hình Server:** Bypass .htaccess (Apache), web.config (IIS).

### 2. SQL Injection (SQLi) _(Coming Soon)_

Các kỹ thuật tiêm nhiễm câu lệnh SQL để thao tác với cơ sở dữ liệu.

- In-band SQLi (Classic, Error-based).
- Inferential SQLi (Blind-Boolean, Blind-Time).
- Out-of-band SQLi.

### 3. Cross-Site Scripting (XSS) _(Coming Soon)_

Các kỹ thuật chèn mã script độc hại vào trang web.

- Stored XSS.
- Reflected XSS.
- DOM-based XSS.

### 4. Server-Side Request Forgery (SSRF) _(Coming Soon)_

Kỹ thuật ép buộc server thực hiện các request đến các hệ thống nội bộ hoặc bên ngoài.

### 5. Authentication & Authorization _(Coming Soon)_

Các lỗ hổng liên quan đến xác thực và phân quyền.

- Brute Force / Credential Stuffing.
- OAuth 2.0 misconfiguration.
- IDOR (Insecure Direct Object References).

---

## ⚠️ Tuyên bố miễn trừ trách nhiệm (Disclaimer)

Tất cả thông tin và mã nguồn trong kho lưu trữ này chỉ nhằm mục đích **nghiên cứu và giáo dục**.

- Không sử dụng các kỹ thuật này để tấn công các hệ thống mà bạn không có quyền hợp pháp.
- Tác giả không chịu trách nhiệm cho bất kỳ hành vi vi phạm pháp luật nào liên quan đến việc sử dụng thông tin từ kho lưu trữ này.

---

## 🤝 Đóng góp (Contributing)

Mọi đóng góp đều được hoan nghênh! Nếu bạn có một kỹ thuật khai thác mới hoặc muốn bổ sung tài liệu, hãy tạo Pull Request.

1.  Fork dự án.
2.  Tạo branch mới (`git checkout -b feature/NewVuln`).
3.  Commit thay đổi (`git commit -m 'Add new vulnerability'`).
4.  Push lên branch (`git push origin feature/NewVuln`).
5.  Tạo Pull Request.
