# Method, tham số, collection & generics

## Method

- Một method làm **một việc**; đặt tên bằng động từ mô tả kết quả, không mô tả cách làm.
- Độ dài mục tiêu ≤ 30 dòng. Dài hơn → tách `private` helper đặt ngay dưới method gọi nó.
- Độ sâu lồng ≤ 2. Dùng guard clause / early return thay vì `else` lồng nhau.
- Thứ tự thành viên trong class: field → constructor (Lombok) → public/override → protected → private.
- Method `private static` cho helper thuần tính toán (không dùng state của bean).

## Tham số

- Tối đa **3 tham số**. Nhiều hơn → gom thành `record` (`XxxSearchCriteria`, `XxxCommand`) có `@Builder`.
- Không dùng tham số `boolean` để chọn nhánh (`save(group, true)`), tách thành 2 method có tên rõ nghĩa.
- Thứ tự: định danh trước, dữ liệu sau, tuỳ chọn cuối — `update(Long groupId, Group group)`.
- Không nhận và không trả `null`. Đầu vào tuỳ chọn → overload hoặc criteria record; đầu ra 0..1 → `Optional`.
- Không nhận `Entity` làm tham số ở tầng domain/controller; không nhận `Map<String, Object>` như một túi dữ liệu.
- Tham số bắt buộc non-null ở service có thể đánh dấu `@NonNull` (Lombok) để fail sớm và rõ ràng.

## Optional

- Chỉ dùng làm **kiểu trả về**, không làm field, không làm tham số.
- Xử lý bằng `map` / `orElseThrow` / `ifPresent`; **không** `optional.get()` trần, **không** `isPresent()` + `get()`.

```java
return groupRepository.findById(groupId).map(groupMapper::toDto);
groupRepository.findById(groupId).orElseThrow(ResourceNotFoundException::new);
```

## Collection

- Khai báo theo **interface**: `List`, `Set`, `Map` — không `ArrayList` ở chữ ký method.
- `List` khi cần thứ tự/trùng lặp, `Set` khi cần loại trùng và kiểm tra tồn tại, `Map` khi tra cứu theo khoá.
- Kiểm tra tồn tại lặp lại trong vòng lặp → chuyển sang `Set`/`Map` trước, tránh `list.contains` trong loop (O(n²)).
- Trả về **collection rỗng**, không bao giờ `null`: `List.of()`, `Collections.emptyList()`.
- Trả về dữ liệu bất biến khi có thể (`stream().toList()`, `List.copyOf`); nếu caller cần sửa, nói rõ trong tên/javadoc.
- Không sửa collection đang duyệt; dùng `removeIf` hoặc tạo list mới.
- Duyệt collection lớn từ DB → phân trang hoặc stream theo lô, không load hết vào bộ nhớ.

## Stream

- Dùng stream cho map/filter/collect; dùng `for` khi có side-effect, break sớm, hoặc khi stream làm khó đọc hơn.
- Kết thúc bằng `.toList()` (Java 16+) thay cho `collect(Collectors.toList())` khi chỉ cần list bất biến.
- Không gọi DB / service bên trong `map` của stream trên tập lớn → gây N+1. Gom id rồi query một lần.
- Không dùng `parallelStream()` trừ khi đo được lợi ích và tác vụ thuần CPU, không có shared state.
- Một chuỗi stream ≤ 4 phép biến đổi; dài hơn thì tách biến trung gian có tên.

```java
List<Group> groups = groupRepository.findAllByGroupCodeIn(codes).stream()
    .map(groupMapper::toDto)
    .toList();

Map<String, Group> byCode = groups.stream()
    .collect(Collectors.toMap(Group::groupCode, Function.identity()));
```

## Generics

- Không dùng raw type (`List`, `Map` trần) và không `@SuppressWarnings("unchecked")` nếu chưa thử kiểu hoá đúng.
- Wrapper dùng chung phải generic: `ValueResponse<T>`, `PageImplResponse<T>`, `EntityMapper<D, E>`.
- Tham số nhận vào dùng `? extends T`, tham số ghi ra dùng `? super T` (PECS) cho API dùng chung.
- Đặt tên tham số kiểu theo quy ước: `T` (type), `D` (domain/dto), `E` (entity), `R` (result), `K`/`V`.
- Không tạo hierarchy generic nhiều tầng chỉ để tránh lặp vài dòng — ưu tiên rõ ràng.

## String & số

- Ghép chuỗi: `"%s-%s".formatted(a, b)`. Nối trong vòng lặp: `StringBuilder`.
- Kiểm tra chuỗi: `StringUtils.hasText(s)` thay cho `s != null && !s.isEmpty()`.
- So sánh `Boolean` bao: `Boolean.TRUE.equals(flag)`.
- Tiền tệ / số cần chính xác: `BigDecimal`, không `double`.
- Thời gian: `LocalDateTime`/`Instant` (java.time), không `Date`/`Calendar`.
