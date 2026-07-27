# API & Controller

## Tách Api interface / Controller

Toàn bộ annotation HTTP + OpenAPI nằm ở **interface**; Controller chỉ `implements` và `@Override`.
Lợi ích: controller đọc được logic trong 10 dòng, tài liệu API tập trung một chỗ.

```java
@RequestMapping("/v1/property/groups/{groupId}")
@Tag(name = "Quản lý nhóm người dùng (group)", description = "API này quản lý nhóm người dùng")
public interface GroupApi {
    @Operation(summary = "Xem chi tiết nhóm", description = "Lấy thông tin nhóm theo groupId")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Thành công",
            content = @Content(mediaType = "application/json",
                schema = @Schema(implementation = GroupResponse.class),
                examples = @ExampleObject(name = "...", value = """
                { "code": 0, "message": "Lấy thông tin thành công", "data": { ... } }
                """))),
        @ApiResponse(responseCode = "401", description = "Không được phép truy cập"),
        @ApiResponse(responseCode = "404", description = "Không tìm thấy nhóm"),
        @ApiResponse(responseCode = "500", description = "Lỗi server nội bộ")
    })
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    ValueResponse<GroupResponse> findById(
        @Parameter(description = "Mã định danh của nhóm", example = "1", required = true)
        @PathVariable String groupId);
}
```

Quy tắc:
- 1 resource → 2 interface: `<Feature>Api` cho `/{id}` (GET/PUT/DELETE) và `<Feature>sApi` cho collection (GET list/POST).
- `@RequestMapping` đặt ở interface, chứa version `/v1/...`.
- Luôn khai báo đủ 200 / 400 / 401 / 404 / 500 khi có ý nghĩa; mô tả bằng tiếng Việt, thống nhất giọng văn với các API đã có.
- Ví dụ payload dùng text block, dữ liệu giả **không dùng token/secret thật**.
- Endpoint nội bộ giữa các service: đặt tên `<Feature>InternalApi`, path tách biệt, ghi rõ trong `@Tag` là internal.

## Controller

```java
@RestController
@RequiredArgsConstructor
@FieldDefaults(level = PRIVATE, makeFinal = true)
public class GroupController implements GroupApi {
    GroupService groupService;
    GroupResponseMapper groupResponseMapper;

    @Override
    public ValueResponse<GroupResponse> findById(String groupId) {
        Long id = AesEncryption.decryptToLong(groupId);
        return groupService.findById(id)
            .map(group -> ValueResponse.of(groupResponseMapper.toModel(group)))
            .orElseThrow(ResourceNotFoundException::new);
    }
}
```

- Không lặp lại annotation mapping ở Controller.
- Field không `private` tường minh — dùng `@FieldDefaults(level = PRIVATE, makeFinal = true)` + `@RequiredArgsConstructor`.
- Controller **chỉ** phụ thuộc `<Feature>Service` (interface trong `domain/`) và các Mapper. Không inject Repository, không inject `*CommandService`/`*QueryService`.
- Thứ tự trong method: giải mã tham số → map request → gọi service → map response.

## Response wrapper

| Trường hợp | Kiểu trả về |
|---|---|
| 1 object | `ValueResponse<XxxResponse>` |
| danh sách phân trang | `PageImplResponse<XxxResponse>` |
| không có dữ liệu trả về (POST/PUT/DELETE) | `void` |

Không tự tạo wrapper riêng, không trả `ResponseEntity` thô, không trả `Map<String, Object>`.

## Phân trang & sắp xếp

```java
PageRequestCustom pageRequest = PageRequestCustom.of(current, pageSize, SortHandleCustom.of(sorter));
Page<Group> page = groupService.findAll(criteria, pageRequest.pageRequest());
return PageImplResponse.of(page.getContent(), true, page.getTotalElements(), page.getTotalPages(), current);
```

Tham số query chuẩn: `search`, `sorter`, `current`, `pageSize` + các filter riêng. Giữ nguyên tên này trên mọi API list.

## Request / Response model

- Là `record`, mọi field có `@Schema(description, example)`; class có `@Schema(description = "...")`.
- Request **không** chứa field kỹ thuật (audit, id nội bộ) trừ khi client thực sự gửi.
- Response trả `idEncrypt` cho định danh; không lộ id số nguyên nội bộ ra ngoài nếu API đã dùng encrypt (xem `security.md`).
- Không tái sử dụng một record cho cả request lẫn response — vòng đời khác nhau, sẽ vỡ khi một bên đổi.

## Validation

- Validate cấu hình động: `@ValidationDynamic(apiCode = ApiCode.API_CODE_00X, clazz = XxxRequest.class)` trên method Controller. Mỗi endpoint có validation phải có một hằng `ApiCode` riêng, mô tả rõ hành động.
- Validate tĩnh đơn giản (bắt buộc, độ dài) có thể dùng Jakarta Validation trên record; không trộn hai cơ chế cho cùng một field.
- Không validate trong service những gì đã validate ở tầng API, trừ ràng buộc nghiệp vụ (unique, tồn tại, quyền).
