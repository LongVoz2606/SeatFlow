# Database, Entity, Mapper, Cache

## Entity

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "groups")
@EqualsAndHashCode(callSuper = false)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class GroupEntity extends Auditable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "group_id")
    Long groupId;

    @SearchField
    @Column(name = "group_code")
    String groupCode;

    @Column(name = "group_default", updatable = false)
    Boolean groupDefault;

    @Column(name = "search")
    String search;

    @PrePersist
    private void prePersist() { /* sinh code, build search, gán property path */ }

    @PreUpdate
    private void preUpdate() { /* cập nhật search */ }
}
```

Quy tắc:
- Entity **chỉ** nằm trong `repository/database/<feature>/`, không bao giờ trả về controller.
- Kế thừa `Auditable` để có createdBy/createdAt/... — không tự khai báo lại các cột audit.
- `@Column(name = ...)` khai báo tường minh cho **mọi** field; tên cột snake_case.
- Field không đổi sau khi tạo → `updatable = false`.
- Dùng kiểu bao (`Long`, `Boolean`) để phân biệt null với 0/false.
- `@PrePersist`/`@PreUpdate` `private`, chỉ chuẩn hoá dữ liệu (search string, path, code) — không gọi repository trong đó.
- Đánh dấu field cho tìm kiếm bằng `@SearchField`, chuỗi tìm kiếm gộp sinh bởi `SearchFieldUtils.buildString(this)`.

## Repository

```java
@Repository
public interface GroupRepository extends JpaRepository<GroupEntity, Long>, JpaSpecificationExecutor<GroupEntity> {
    Optional<GroupEntity> findByGroupCode(String groupCode);
    List<GroupEntity> findAllByGroupCodeIn(List<String> codes);
}
```

- Chỉ khai báo interface; không viết class implement thủ công trừ khi thật sự cần custom fragment.
- Query dẫn xuất từ tên method cho ca đơn giản; `@Query` (JPQL, text block) khi tên method dài quá 5–6 từ.
- Truy vấn native chỉ khi JPQL không làm được, và luôn dùng named parameter — **không nối chuỗi SQL**.
- Trả `Optional` cho 0..1, `List` cho 0..n, `Page` khi có phân trang. Không trả `null`.

## Specification cho filter động

```java
public class GroupSpecification {
    public static Specification<GroupEntity> bySearchCriteria(GroupSearchCriteria criteria) {
        return criteria.specifications().stream().reduce(Specification.where(null), Specification::and);
    }
}
```

`SearchCriteria` là `record` + `@Builder`, chuẩn hoá input trong compact constructor, và tự sinh danh sách `Specification`:

```java
public List<Specification<GroupEntity>> specifications() {
    List<Specification<GroupEntity>> specs = new ArrayList<>();
    if (StringUtils.hasText(search)) { specs.add((root, q, cb) -> cb.like(root.get("search"), "%" + search + "%")); }
    return specs;
}
```

- Mỗi điều kiện là một method `private static` đặt tên `by<Field>`; điều kiện rỗng trả `cb.conjunction()` chứ không trả `null`.
- Quan hệ phức tạp → dùng `Subquery` thay vì join lồng nhiều tầng.
- Criteria class không được phụ thuộc Request model của controller.

## MapStruct

```java
@Mapper(config = MapStructGlobalConfig.class)
public interface GroupMapper extends EntityMapper<Group, GroupEntity> {
    void update(@MappingTarget GroupEntity existingEntity, Group group);
}
```

- Luôn `config = MapStructGlobalConfig.class` để thống nhất unmappedTargetPolicy/componentModel.
- `EntityMapper<Domain, Entity>` cho tầng repository, `ModelMapper<Model, Domain>` cho tầng controller.
- Update dùng `@MappingTarget` trên Entity đã load — không tạo Entity mới rồi save đè (mất giá trị audit và các field không map).
- Map tay chỉ khi MapStruct không diễn đạt được; khi đó dùng `@Mapping(expression = ...)` hoặc `default` method trong chính mapper.

## Hiệu năng

- Quan hệ mặc định `FetchType.LAZY`; tránh `EAGER`.
- Chống N+1: dùng `@EntityGraph`, `join fetch`, hoặc lấy id rồi query gộp `findAllBy...In(...)`.
- Ghi hàng loạt → `saveAll` theo lô, không loop `save` từng bản ghi.
- Danh sách luôn phân trang; không có endpoint trả toàn bộ bảng.
- Bật `spring.jpa.show-sql` chỉ ở local để soi query, không bật ở môi trường triển khai.

## Cache Redis

```java
@RedisHash("cache_group_permission")
@Builder
public record CacheGroupPermission(@Id String id, String groupCode, String permissionCode, String propertyPath) {
    public CacheGroupPermission {
        id = "%s:%s".formatted(groupCode, permissionCode);
    }
}
```

- Cache model là `record` riêng trong `repository/redis/`, có mapper riêng — không cache Entity JPA.
- Khoá cache sinh xác định (deterministic) từ business key trong compact constructor.
- Có TTL cho dữ liệu tạm (OTP, block, forgot-password); mọi thao tác ghi dữ liệu gốc phải invalidate cache liên quan.

## Thay đổi schema

- Đổi schema phải kèm script migration, không dựa vào `ddl-auto` sinh bảng ở môi trường triển khai.
- Đổi/xoá cột: triển khai theo 2 bước (thêm mới + backfill, rồi mới bỏ cột cũ) để không gãy phiên bản đang chạy.

## Tách biệt Database Migration (`<service>-migration`) & Containerized Flyway

Để đảm bảo hiệu năng, tính độc lập và tránh tranh chấp lock/quyền giữa nhiều replica của microservice backend (`<service>-service`), cơ chế Migration được tách hẳn ra thành dự án/container riêng (`<service>-migration`).

### Structure tiêu chuẩn của `<service>-migration`

```
<service>-migration/
├── app/                        # Migration DDL cho cấu trúc schema/bảng
│   ├── Dockerfile
│   ├── pom.xml                 # Maven plugin flyway-maven-plugin + JDBC driver (PostgreSQL/Oracle)
│   ├── config/
│   │   └── flyway.properties
│   └── sql/
│       └── postgres/           # (hoặc oracle/)
│           ├── V20250930_01__ddl_constraint.sql
│           ├── V20250930_02__ddl_property.sql
│           └── V20260126_01__ddl_update_table.sql
├── data/                       # Migration DML cho dữ liệu khởi tạo / reference data
│   ├── Dockerfile
│   ├── pom.xml
│   └── sql/
│       └── postgres/
│           └── V20251001_01__dml_seed_data.sql
└── .gitlab-ci.yml / README.md  # CI/CD pipeline & hướng dẫn containerized run
```

### Quy tắc đặt tên & quản lý script SQL Migration

1. **Format tên file SQL**: `V<YYYYMMDD_seq>__<type>_<description>.sql`
   - `V` prefix cho versioned migration.
   - `<YYYYMMDD_seq>`: ngày tháng + số thứ tự trong ngày (ví dụ `V20260727_01__...`, `V20260727_02__...`).
   - `<type>`: `ddl` (cho `app/`) hoặc `dml` (cho `data/`).
   - `<description>`: mô tả rõ ràng mục đích (ví dụ `ddl_user.sql`, `dml_seed_roles.sql`, `ddl_update_table_users.sql`).
2. **Phân tách DDL (`app`) và DML (`data`)**:
   - `app/` chạy với bảng lịch sử `flyway_schema_history`.
   - `data/` chạy với bảng lịch sử riêng `flyway_schema_history_data` (qua `-Dflyway.table=flyway_schema_history_data`).

### Cấu hình `pom.xml` cho Migration Project

```xml
<dependencies>
    <dependency>
        <groupId>org.flywaydb</groupId>
        <artifactId>flyway-core</artifactId>
        <version>7.11.2</version>
    </dependency>
    <!-- Driver PostgreSQL -->
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
        <version>42.3.0</version>
    </dependency>
    <!-- Hoặc Driver Oracle -->
    <!--
    <dependency>
        <groupId>com.oracle.database.jdbc</groupId>
        <artifactId>ojdbc11</artifactId>
        <version>23.3.0.23.09</version>
    </dependency>
    -->
</dependencies>

<build>
    <plugins>
        <plugin>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-maven-plugin</artifactId>
            <version>7.11.2</version>
            <configuration>
                <baselineOnMigrate>true</baselineOnMigrate>
            </configuration>
        </plugin>
    </plugins>
</build>
```

### Containerized Execution với Docker & CI/CD

#### Dockerfile cho Migration Image

```dockerfile
FROM 10.0.0.175:5000/migration:1.0.0
WORKDIR /app

COPY sql /app/sql/postgres
COPY config /app/config
COPY pom.xml /app/

RUN mvn clean install
RUN mvn flyway:info || true
```

#### Lệnh chạy Container Migration (Standalone / CLI)

- **Xem thông tin trạng thái Migration (`flyway:info`)**:
  ```bash
  docker run --rm migration-postgres-app:latest \
    mvn -Dflyway.url="jdbc:postgresql://<db_host>:<port>/<db_name>" \
    -Dflyway.user="postgres" \
    -Dflyway.password='<db_password>' \
    -Dflyway.locations="filesystem:sql/postgres" \
    -Dflyway.schemas="public" \
    -Dflyway.table="flyway_schema_history" \
    flyway:info
  ```

- **Thực thi Migration Schema (`flyway:migrate`)**:
  ```bash
  docker run --rm migration-postgres-app:latest \
    mvn -Dflyway.url="jdbc:postgresql://<db_host>:<port>/<db_name>" \
    -Dflyway.user="postgres" \
    -Dflyway.password='<db_password>' \
    -Dflyway.locations="filesystem:sql/postgres" \
    -Dflyway.schemas="public" \
    -Dflyway.table="flyway_schema_history" \
    flyway:info flyway:migrate
  ```

#### Quy trình triển khai sản xuất
1. Trong môi trường CI/CD hoặc Production, bước **Migration Container** chạy hoàn tất trước (`flyway:migrate` thành công).
2. Sau khi Schema & Seed Data đã sẵn sàng, Backend Application Container (`<service>-service`) mới bắt đầu rollout/start up.
3. Backend service bật `spring.jpa.hibernate.ddl-auto=validate` hoặc `none` để đảm bảo an toàn tuyệt đối cho dữ liệu.
