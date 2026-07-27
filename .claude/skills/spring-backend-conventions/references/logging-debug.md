# Logging & Debug

## Logging

- Dùng `@Slf4j` (Lombok). Không `System.out.println`, không `e.printStackTrace()`.
- Log có tham số hoá `{}`, **không** nối chuỗi: `log.info("Group updated: {}", groupCode);`
- Kèm định danh nghiệp vụ (userId, groupCode, requestId) — log không có ngữ cảnh là log vô dụng.

| Level | Dùng khi |
|---|---|
| `error` | lỗi cần người xử lý; luôn kèm exception làm tham số cuối: `log.error("...", e)` |
| `warn` | tình huống bất thường nhưng tự phục hồi (retry, fallback, cấu hình thiếu) |
| `info` | mốc nghiệp vụ quan trọng: tạo/xoá tài nguyên, khoá tài khoản, khởi động module |
| `debug` | chi tiết chẩn đoán: tham số, số bản ghi, nhánh xử lý |
| `trace` | rất chi tiết, chỉ bật khi truy vết cụ thể |

Quy tắc:
- Không log trong vòng lặp trên tập lớn; log tổng hợp (số lượng, thời gian) thay vì từng phần tử.
- Không log ở cả nơi ném và nơi bắt cùng một exception (log trùng lặp).
- Không log dữ liệu nhạy cảm (xem `security.md`).
- Không dùng log thay cho monitoring: số liệu định lượng nên qua actuator/metrics.

## Xử lý ngoại lệ tập trung

- Exception nghiệp vụ ném lên, để global handler map sang HTTP status + `ErrorCode`.
- Aspect hạ tầng (`RepositoryExceptionAspect`) dịch lỗi tầng dữ liệu sang lỗi nghiệp vụ — không bắt `DataIntegrityViolationException` rải rác trong service.
- `catch` phải: bổ sung ngữ cảnh rồi ném lại, hoặc xử lý dứt điểm và log. Không có nhánh `catch` rỗng.

## Quy trình debug

1. **Tái hiện** — xác định endpoint, payload, user/property path, môi trường.
2. **Đọc log theo request** — tìm theo requestId/userId, dựng lại chuỗi sự kiện trước khi đoán nguyên nhân.
3. **Khoanh tầng** — Controller (mapping, giải mã id) → Service (nghiệp vụ, transaction) → Repository (query, ràng buộc DB).
4. **Kiểm chứng bằng dữ liệu**: bật `spring.jpa.show-sql` ở local để xem query thật; kiểm tra kết quả mapper (MapStruct sinh code trong `build/generated/...` — mở file impl để xem field nào bị bỏ sót).
5. **Sửa tận gốc**, không vá triệu chứng (thêm null-check che lỗi mapping là vá triệu chứng).
6. **Chốt lại**: viết test hoặc ghi rõ bước kiểm chứng thủ công đã chạy và kết quả thật.

Bẫy thường gặp trong stack này:
- `@Transactional` không ăn do gọi nội bộ trong cùng bean, hoặc method không `public`.
- Mapper trả field `null` vì đổi tên field mà chưa build lại (annotation processor).
- `@PrePersist` ghi đè giá trị do caller set.
- LazyInitializationException: truy cập quan hệ lazy ngoài transaction → lấy dữ liệu trong service, không ở controller.
- Cache Redis lệch dữ liệu do quên invalidate sau khi update.

## Vận hành

- Actuator (`application-actuator.yml`) cho health/metrics; endpoint nhạy cảm phải giới hạn truy cập.
- Theo dõi thread pool (`ThreadPoolMonitor`) khi có tác vụ async — pool đầy sẽ biểu hiện thành timeout ngẫu nhiên.
- Cấu hình theo profile (`local`, dev, prod); khác biệt môi trường nằm ở YAML, không ở `if (env.equals("local"))` trong code.
