# Security

## Định danh không lộ ra ngoài

Id số nguyên nội bộ bị mã hoá trước khi ra client và giải mã ngay đầu Controller.

```java
Long groupId = AesEncryption.decryptToLong(encryptedId);   // luôn ở Controller
```

- Response trả `xxxIdEncrypt`; nếu API đã theo cơ chế này thì **không** trả kèm id thô.
- Giải mã đặt ở Controller, service chỉ nhận `Long`. Không rải logic mã hoá khắp các tầng.
- Giá trị giải mã sai → ném lỗi 400/404, không trả stacktrace.

## Secrets & cấu hình

- **Không hardcode** password, access key, secret, private key trong `application*.yml` hay Java. Dùng biến môi trường / secret manager: `${MINIO_SECRET_KEY}`.
- File cấu hình local có credential thật phải nằm ngoài git (`.gitignore`); nếu lỡ commit, coi như secret đã lộ → xoay vòng khoá, không chỉ xoá file.
- Khoá RSA/AES nạp từ cấu hình bên ngoài (`RsaKeyConfiguration`), không nhúng trong resource của repo.
- Ví dụ trong OpenAPI phải là dữ liệu giả.

## Xác thực & phân quyền

- Lấy danh tính từ security context, **không tin tham số client gửi**:
  `SecurityContextUtil.getLocalProcessContext().userId()`, `.currentProperty().path()`.
- Kiểm tra quyền theo dữ liệu (data scope / propertyPath) ở tầng service, không chỉ ở UI hay controller.
- Endpoint internal giữa các service phải được chặn ở gateway/network và không public trong tài liệu ra ngoài.
- Không tự viết cơ chế JWT/hash mới; dùng starter/thư viện chung đã có.
- Mật khẩu: chỉ lưu hash (bcrypt/argon2), không log, không trả về response, so sánh bằng hàm hằng thời gian.

## CORS & header

- `allowedOrigins("*")` chỉ chấp nhận ở môi trường dev. Môi trường thật: liệt kê origin cụ thể, và **không** kết hợp `*` với `allowCredentials(true)`.
- Không tự thêm header CORS thủ công song song với cấu hình Spring.

## Gọi service khác (Feign)

```java
@FeignClient(value = "Auth", url = "${domain.internal.authorization-service}", configuration = FeignConfiguration.class)
public interface AuthFeignHolder { ... }
```

- URL luôn lấy từ cấu hình, không hardcode host/IP trong code.
- Token truyền tiếp qua `RequestInterceptor` từ security context; không tự đọc header thủ công ở từng client.
- Có timeout và xử lý lỗi rõ ràng cho mọi lời gọi ngoài; lỗi downstream không được biến thành 500 mù mờ.

## Dữ liệu nhạy cảm

- Không log: mật khẩu, OTP, token, số CCCD, email/số điện thoại đầy đủ, payload chứa PII. Khi cần thì che (`a***@mail.com`).
- Không đưa dữ liệu nhạy cảm vào message lỗi trả cho client.
- Cache OTP/reset-password phải có TTL ngắn, giới hạn số lần thử và số lần gửi lại (đã có mã lỗi tương ứng trong `ErrorCodes`).

## Đầu vào

- Mọi input từ client đều là không tin cậy: validate kiểu, độ dài, whitelist giá trị.
- Truy vấn DB dùng parameter binding; không nối chuỗi vào JPQL/SQL, không truyền tên cột/hướng sort thẳng từ client vào query mà không whitelist.
- Upload file: kiểm tra content type, kích thước, sinh lại tên file, không lưu theo tên client gửi.
- Endpoint nhạy cảm (login, OTP, quên mật khẩu) phải có rate limit / khoá tạm thời.
