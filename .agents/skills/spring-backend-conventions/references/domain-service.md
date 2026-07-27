# Domain & Service (CQRS-lite)

## Domain model

```java
public record Group(Long groupId, String groupCode, String groupName,
                    String description, String propertyPath, Boolean groupDefault) {
}
```

- Record thuần: không JPA, không Jackson, không Swagger. Đây là ngôn ngữ chung giữa controller và service.
- Có thể thêm compact constructor để chuẩn hoá dữ liệu, và static factory `of(...)`.
- Không đặt truy cập DB / gọi bean trong domain record.

## Service interface (`domain/<feature>/<Feature>Service.java`)

Hợp đồng duy nhất mà controller nhìn thấy. Chỉ khai báo hành vi nghiệp vụ, tham số/kết quả là **domain model**, không phải Entity/Request.

```java
public interface GroupService {
    Page<Group> findAll(GroupSearchCriteria criteria, PageRequest pageRequest);
    Optional<Group> findById(Long groupId);
    void save(Group group);
    void update(Long groupId, Group group);
    void delete(Long groupId);
}
```

## Ba service implementation

| Class | Trách nhiệm | Access modifier |
|---|---|---|
| `<Feature>CommandService` | ghi: save/update/delete + validate unique/tồn tại | method `protected` |
| `<Feature>QueryService` | đọc: findAll/findById/findBy* | method `protected` (`public` nếu feature khác cần dùng lại) |
| `<Feature>UseCaseService` | orchestration, transaction, audit log, gọi service khác | `public`, `@Override` |

```java
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class GroupUseCaseService implements GroupService {
    GroupCommandService commandService;
    GroupQueryService queryService;

    @Override
    @Transactional
    public void update(Long groupId, Group group) {
        Group pre = queryService.findById(groupId).orElseThrow(ResourceNotFoundException::new);
        Group updated = commandService.update(groupId, group);
        saveAuditLog(pre, updated, EnumGroupAudit.UPDATE);
    }
}
```

Quy tắc:
- `protected` ở Command/Query là cố ý: buộc mọi lời gọi từ ngoài package đi qua UseCase.
- **Chỉ UseCaseService mang `@Transactional`.** Đọc → `@Transactional(readOnly = true)`. Ghi → `@Transactional`.
- Command/Query không gọi lẫn nhau; điều phối là việc của UseCase.
- UseCase gọi feature khác qua **interface `<Other>Service`**, không gọi thẳng `<Other>CommandService`.
- Tránh vòng phụ thuộc giữa các UseCase; nếu xuất hiện, tách phần dùng chung xuống QueryService public hoặc một service hạ tầng riêng.

## Transaction

- Không mở transaction ở Controller.
- Không gọi API ngoài (Feign, gửi mail, publish event) **bên trong** transaction ghi dài; tách ra sau khi commit hoặc chạy async.
- `@Async` cần bean cấu hình thread pool riêng; không dựa vào pool mặc định.
- Tự gọi method `@Transactional` trong cùng class sẽ không có tác dụng (proxy) — tách sang bean khác.

## Exception & error code

- Dùng exception có sẵn của core: `ResourceNotFoundException`, `ConflictsException`, `ApplicationException`.
- Lỗi nghiệp vụ mới → thêm hằng vào `ErrorCodes` (`COR_00xx` + message tiếng Việt), có tham số thì dùng `formatMessage(...)`.
- **Không** `catch (Exception e) { return null; }`, không trả `null` thay cho lỗi, không dùng exception cho luồng bình thường.
- Không để message lỗi lộ chi tiết hạ tầng (SQL, stacktrace, host) ra client.

```java
groupRepository.findByGroupCode(group.groupCode())
    .ifPresent(existing -> { throw new ConflictsException(); });
```

## Audit / history

Ghi audit ở **UseCaseService**, sau khi thao tác thành công, gồm dữ liệu `pre` và `post` dạng domain model + mã hành động enum. Lỗi khi ghi audit không được làm hỏng nghiệp vụ chính.
