# SeatFlow Database Migration (`seatflow-migration`)

Hệ thống Migration độc lập được phân tách hoàn toàn khỏi ứng dụng backend `seatflow-backend` theo kiến trúc Microservices & Containerized Flyway.

## Cấu trúc thư mục

```
seatflow-migration/
├── app/                        # DDL Migration (Cấu trúc bảng, index, constraints)
│   ├── Dockerfile
│   ├── pom.xml
│   ├── config/flyway.properties
│   └── sql/postgres/
│       └── V20260727_01__ddl_initial_schema.sql
├── data/                       # DML Migration (Dữ liệu khởi tạo & seed data)
│   ├── Dockerfile
│   ├── pom.xml
│   ├── config/flyway.properties
│   └── sql/postgres/
│       └── V20260727_01__dml_seed_data.sql
└── README.md
```

## Hướng dẫn sử dụng & Chạy Migration với Docker

### 1. Build Docker Images cho App & Data Migration
```bash
# Build image migration DDL
docker build -t seatflow-migration-app ./app

# Build image migration DML
docker build -t seatflow-migration-data ./data
```

### 2. Kiểm tra thông tin Migration (`flyway:info`)
```bash
# App DDL info
docker run --rm seatflow-migration-app \
  mvn -Dflyway.url="jdbc:postgresql://host.docker.internal:5432/seatflow" \
  -Dflyway.user="postgres" \
  -Dflyway.password="postgres123" \
  -Dflyway.locations="filesystem:sql/postgres" \
  -Dflyway.schemas="public" \
  -Dflyway.table="flyway_schema_history" \
  flyway:info

# Data DML info
docker run --rm seatflow-migration-data \
  mvn -Dflyway.url="jdbc:postgresql://host.docker.internal:5432/seatflow" \
  -Dflyway.user="postgres" \
  -Dflyway.password="postgres123" \
  -Dflyway.locations="filesystem:sql/postgres" \
  -Dflyway.schemas="public" \
  -Dflyway.table="flyway_schema_history_data" \
  flyway:info
```

### 3. Thực thi Migration (`flyway:migrate`)
```bash
# Thực thi DDL Schema
docker run --rm seatflow-migration-app \
  mvn -Dflyway.url="jdbc:postgresql://host.docker.internal:5432/seatflow" \
  -Dflyway.user="postgres" \
  -Dflyway.password="postgres123" \
  -Dflyway.locations="filesystem:sql/postgres" \
  -Dflyway.schemas="public" \
  -Dflyway.table="flyway_schema_history" \
  flyway:info flyway:migrate

# Thực thi DML Seed Data
docker run --rm seatflow-migration-data \
  mvn -Dflyway.url="jdbc:postgresql://host.docker.internal:5432/seatflow" \
  -Dflyway.user="postgres" \
  -Dflyway.password="postgres123" \
  -Dflyway.locations="filesystem:sql/postgres" \
  -Dflyway.schemas="public" \
  -Dflyway.table="flyway_schema_history_data" \
  flyway:info flyway:migrate
```
