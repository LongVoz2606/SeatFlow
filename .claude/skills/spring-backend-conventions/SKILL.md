---
name: spring-backend-conventions
description: Conventions, code style, naming, formatting, layering, database, security, logging and debugging rules for Java 21 / Spring Boot 3.x microservices (Api-interface + Controller, domain record + Service interface, Command/Query/UseCase services, JPA Entity + MapStruct mapper + Specification). Use when writing, reviewing, refactoring or scaffolding any backend code, adding an endpoint, a service, an entity, a mapper, a search filter, or when asked how this codebase does something.
---

# Spring Boot Backend Conventions

Bộ quy ước cho microservice Java 21 + Spring Boot 3.x + JPA + MapStruct + Lombok.
Đọc file này trước khi viết code; mở file trong `references/` khi cần chi tiết cho tầng đang làm.

## Nguyên tắc bất biến

1. **Layer đi một chiều**: `controller → domain (interface) → service (impl) → repository`.
   Controller **không bao giờ** gọi Repository/Entity. Repository/Entity **không bao giờ** lộ ra ngoài tầng service.
2. **3 loại model, không trộn lẫn**:
   - `XxxRequest` / `XxxResponse` — `record`, nằm cạnh controller trong `models/`, có `@Schema`.
   - `Xxx` (domain) — `record` thuần, không annotation JPA/Jackson.
   - `XxxEntity` — class JPA, chỉ tồn tại trong `repository/database/`.
   Chuyển đổi giữa các tầng **luôn qua MapStruct**, không map tay.
3. **Immutable trước**: domain model, request, response, search criteria đều là `record`. Chỉ Entity là mutable.
4. **Constructor injection qua Lombok**, không `@Autowired` field, không setter injection.
5. **Không có logic nghiệp vụ trong Controller** — chỉ decrypt id, gọi mapper, gọi service, wrap response.
6. **Không nuốt exception**. Ném exception nghiệp vụ có `ErrorCode`, để global handler xử lý.
7. Mỗi khi thêm code mới, **tìm 1 feature tương tự đã có và bám sát cấu trúc của nó** thay vì sáng tạo cấu trúc mới.

## Cấu trúc package

```
tech.app
├── bootstrap/          hạ tầng dùng chung — không chứa nghiệp vụ
│   ├── annotation/     custom annotation + aspect
│   ├── configuration/  @Configuration beans
│   ├── constants/      enum ApiCode, ErrorCodes, EnvironmentApp
│   ├── mapper/         MapStructGlobalConfig
│   └── utils/          util final class, static method
├── controller/api/<feature>/
│   ├── <Feature>Api.java          interface + toàn bộ OpenAPI annotation
│   ├── <Feature>Controller.java   implements, không annotation mapping
│   └── models/                    Request/Response record + Mapper
├── domain/<feature>/
│   ├── <Feature>.java             domain record
│   ├── <Feature>Service.java      interface — hợp đồng của feature
│   └── <Feature>SearchCriteria.java
├── repository/
│   ├── database/<feature>/        Entity, Repository, Mapper, Specification
│   ├── redis/                     cache record + repository
│   └── feign/<service>/           FeignClient + FeignConfiguration
└── service/<feature>/
    ├── <Feature>CommandService.java   ghi — method `protected`
    ├── <Feature>QueryService.java     đọc — method `protected`
    └── <Feature>UseCaseService.java   implements <Feature>Service, giữ @Transactional
```

Một feature mới = một thư mục ở **cả 4** nhánh trên, tên feature giống hệt nhau.

## Formatting (bắt buộc, khớp .editorconfig)

- indent 4 space (YAML 2), UTF-8, LF, newline cuối file, không trailing whitespace.
- Java max line 120 ký tự, chuỗi dùng nháy kép.
- **Import tường minh**, không wildcard `import x.*`. Thứ tự: `java.*` cuối cùng theo style hiện có của file.
- Không dùng `+` nối chuỗi cho format → dùng `"%s:%s".formatted(a, b)`.
- Text block `"""` cho JSON ví dụ trong OpenAPI và cho SQL/JPQL nhiều dòng.
- Luôn có `{}` cho `if`/`for` nhiều dòng; một dòng ngắn có thể bỏ nhưng hãy nhất quán trong file.

## Naming

| Thành phần | Quy ước | Ví dụ |
|---|---|---|
| Api interface | `<Feature>Api` (đơn) / `<Feature>sApi` (danh sách) | `GroupApi`, `GroupsApi` |
| Controller | `<Api>Controller` | `GroupsController` |
| Request/Response | `<Feature><Action>Request`, `<Feature>Response` | `GroupSaveRequest`, `GroupResponse` |
| Mapper | tên model + `Mapper` | `GroupSaveRequestMapper` |
| Domain | danh từ số ít | `Group` |
| Entity | `<Domain>Entity` | `GroupEntity` |
| Service impl | `...CommandService` / `...QueryService` / `...UseCaseService` | `GroupUseCaseService` |
| Specification | `<Entity>Specification`, method `by<Field>` / `ofCriteria` | `bySearchCriteria`, `byGroupCode` |
| Enum constant | UPPER_SNAKE | `API_CODE_004`, `EMAIL_EXISTED` |
| Bảng / cột DB | snake_case số nhiều cho bảng | `groups`, `group_code` |
| Cấu hình YAML | kebab-case | `max-spare`, `authorization-service` |

Method: `findAll`, `findById`, `findBy<Field>`, `save`, `update`, `delete`, `validate*`, `build*`, `to<Target>`.
Boolean: `is*` / `has*` / `can*` (`canEditPermissions`). Không viết tắt lạ (`grpSvc`), không đánh số biến (`list1`).

## Checklist khi thêm 1 API mới

1. `domain/<feature>/<Feature>.java` (record) + `<Feature>Service.java` (interface) [+ `SearchCriteria` nếu có filter].
2. `repository/database/<feature>/`: `Entity`, `Repository`, `Mapper`, `Specification`.
3. `service/<feature>/`: `CommandService`, `QueryService`, `UseCaseService implements <Feature>Service`.
4. `controller/api/<feature>/`: `Api` interface (đầy đủ `@Operation`/`@ApiResponses`/`@Schema` mô tả tiếng Việt), `Controller`, `models/` Request/Response + Mapper.
5. Thêm hằng `ApiCode.API_CODE_0xx` nếu endpoint cần `@ValidationDynamic`.
6. Thêm `ErrorCodes` mới nếu có lỗi nghiệp vụ mới — **không hardcode message trong code**.
7. Build: `./gradlew build` (mapper là annotation processor, phải compile mới sinh impl).

## Tài liệu chi tiết

| File | Khi nào đọc |
|---|---|
| `references/api-controller.md` | viết endpoint, OpenAPI, wrapper response, phân trang |
| `references/domain-service.md` | tách Command/Query/UseCase, transaction, exception nghiệp vụ |
| `references/database.md` | Entity, JPA, Specification, mapper, cache Redis, migration |
| `references/methods-collections.md` | method & tham số, Optional, Stream, generics, collection |
| `references/security.md` | mã hoá id, secrets, authz, CORS, Feign, dữ liệu nhạy cảm |
| `references/logging-debug.md` | logging, chẩn đoán lỗi, aspect, monitoring |
| `references/code-practices.md` | null-safety, utils, enum, MapStruct, review checklist |
