**# Yêu cầu Task: Viết Test Case cho chức năng Login

## Mục tiêu

Thực hành tư duy kiểm thử cơ bản thông qua việc phân tích và viết test case cho chức năng Login của một hệ thống web.

Intern cần:

* Hiểu chức năng Login hoạt động như thế nào
* Phân tích các trường hợp có thể xảy ra
* Viết test case theo format chuẩn
* Phân loại test case theo từng nhóm kiểm thử
* Trình bày rõ ràng, dễ đọc, dễ review

---

# Phạm vi chức năng

Chức năng Login bao gồm:

* Ô nhập Email hoặc Username
* Ô nhập Password
* Nút Login
* Validate dữ liệu đầu vào
* Hiển thị thông báo lỗi/thành công
* Điều hướng sau khi đăng nhập

---

# Yêu cầu thực hiện

## 1. Phân tích chức năng

Trước khi viết test case, cần:

* Xác định input của chức năng
* Xác định output mong muốn
* Xác định các rule validate
* Xác định các trạng thái thành công/thất bại

---

## 2. Viết test case

Yêu cầu viết test case theo các nhóm sau:

### Positive Test

Kiểm tra các trường hợp hợp lệ.

### Negative Test

Kiểm tra các trường hợp dữ liệu sai hoặc không hợp lệ.

### Validation Test

Kiểm tra validate của hệ thống đối với dữ liệu nhập vào.

### UI Test

Kiểm tra giao diện và hành vi cơ bản của các thành phần Login.

### Security Basic Test

Kiểm tra các trường hợp bảo mật cơ bản liên quan đến Login.

---

# Format test case bắt buộc

| TC ID | Module | Test Case | Preconditions | Test Steps | Expected Result | Priority |
| ----- | ------ | --------- | ------------- | ---------- | --------------- | -------- |

---

# Quy tắc viết test case

* TC ID phải đặt có quy luật
* Test Case phải mô tả đúng mục tiêu kiểm thử
* Steps cần rõ ràng, tuần tự
* Expected Result phải cụ thể
* Không viết mô tả quá ngắn hoặc quá chung chung
* Không gộp nhiều mục tiêu kiểm thử vào một test case
* Ưu tiên trình bày dễ đọc

---

# Số lượng yêu cầu

Tối thiểu:

* Positive Test: 5 test case
* Negative Test: 10 test case
* Validation Test: 5 test case
* UI Test: 3 test case
* Security Basic Test: 2 test case

Tổng tối thiểu: 25 test case

---


