# Code practices & review checklist

## Lombok — dùng đúng liều

| Annotation | Dùng ở |
|---|---|
| `@RequiredArgsConstructor` + `@FieldDefaults(level = PRIVATE, makeFinal = true)` | mọi bean Spring (controller, service, aspect, config) |
| `@Data`, `@NoArgsConstructor`, `@AllArgsConstructor`, `@FieldDefaults(level = PRIVATE)` | Entity JPA |
| `@Getter` + `@RequiredArgsConstructor` | enum có field |
| `@Builder` | record nhiều field (SearchCriteria, cache model) |
| `@Slf4j` | class cần log |

Không dùng `@Data` cho domain record (đã là record), không `@Setter` trên bean, không `@SneakyThrows` để né checked exception.

## Null-safety

- `Objects.isNull/nonNull` hoặc `StringUtils.hasText` cho kiểm tra; không so sánh lòng vòng.
- `Boolean.TRUE.equals(flag)` cho `Boolean` bao.
- Trả `Optional`/collection rỗng thay cho `null`. Field domain nào bắt buộc thì chuẩn hoá trong compact constructor.

## Enum & hằng số

- Message và mã lỗi tập trung ở `ErrorCodes`; mã hành động API ở `ApiCode`. Không hardcode chuỗi message rải rác.
- Enum implement interface chung (`ErrorCode`) để dùng thống nhất; có helper tra cứu theo code khi cần.
- Không dùng "magic number/string": đặt hằng có tên hoặc đưa vào cấu hình.

## Utils

- Class util: `final`, constructor private, chỉ chứa `static` method thuần, không state, không inject bean.
- Đặt trong `bootstrap/utils/`, tên `<Chức năng>Utils`.
- Nếu một util cần bean Spring → nó không phải util, hãy làm service.

## MapStruct

- Mọi mapper dùng chung `MapStructGlobalConfig`.
- Đổi tên field ở record → **build lại** trước khi kết luận lỗi runtime.
- Không viết mapper "thần thánh" map mọi thứ; mỗi cặp model có mapper riêng, đặt cạnh model.

## Cấu hình

- Giá trị thay đổi theo môi trường → YAML theo profile, đọc qua `@ConfigurationProperties` (ưu tiên) hoặc `@Value`.
- Không rẽ nhánh theo tên môi trường trong code nghiệp vụ.
- Đặt tên khoá kebab-case, nhóm theo domain (`domain.internal.*`, `app.module.*`).

## Comment & code chết

- Comment giải thích **tại sao**, không mô tả lại code.
- Không commit code bị comment-out. Cần giữ lịch sử thì dựa vào git.
- Xoá import thừa, biến không dùng, method không ai gọi.
- Không để `TODO` không có ngữ cảnh; ghi rõ điều kiện hoàn thành.

## Git

- Commit nhỏ, một mục đích, message ngắn ở thì hiện tại: `update cacheGroupPermission id`.
- Branch theo loại công việc: `feat/...`, `fix/...`, `refactor/...`; PR về `develop`.
- Không commit secrets, file build (`build/`, `.gradle/`), file IDE.

## Checklist review trước khi kết thúc một thay đổi

- [ ] Đúng layering: controller không chạm repository/entity; service không lộ entity ra ngoài.
- [ ] Có đủ 4 nhánh (domain / repository / service / controller) cho feature mới, tên nhất quán.
- [ ] `@Transactional` chỉ ở UseCaseService, đúng `readOnly` cho đường đọc.
- [ ] Request/Response là record, có `@Schema`; Api interface có `@Operation` + `@ApiResponses` đầy đủ.
- [ ] Không `null` trả ra, không `Optional.get()`, không `catch` rỗng.
- [ ] Không hardcode message/secret/URL; lỗi mới đã thêm vào `ErrorCodes`.
- [ ] Không log dữ liệu nhạy cảm; log có ngữ cảnh và đúng level.
- [ ] Query có phân trang, không N+1, không nối chuỗi SQL.
- [ ] Import tường minh, dòng ≤ 120 ký tự, indent 4 space, có newline cuối file.
- [ ] `./gradlew build` xanh (annotation processor đã sinh lại mapper).
