# SeatFlow - High-Concurrency Event Ticket Booking System

![Java 21](https://img.shields.io/badge/Java-21-orange.svg)
![Spring Boot 3.3](https://img.shields.io/badge/Spring_Boot-3.3-green.svg)
![React 18](https://img.shields.io/badge/React-18-blue.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)
![Redis](https://img.shields.io/badge/Redis-7-red.svg)
![Kafka](https://img.shields.io/badge/Kafka-Apache-black.svg)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg)

**SeatFlow** là hệ thống đặt vé sự kiện high-concurrency theo kiến trúc **microservices**, tập trung giải quyết bài toán đặt ghế đồng thời (overselling prevention), đảm bảo tính nhất quán dữ liệu (eventual consistency với Outbox Pattern), đồng thời cung cấp đầy đủ vòng đời cho một sàn bán vé thực tế: tìm kiếm & lọc sự kiện, đăng ký/duyệt Nhà tổ chức, tạo sự kiện, và trang Quản trị.

---

## 🌟 Tính năng chính

### 1. Đặt vé High-Concurrency & Anti-Overselling
- **Multi-layer Concurrency Protection**:
  1. **Distributed Lock (Redisson Redis)**: Lock theo `seat_id` trước khi xử lý giao dịch.
  2. **Optimistic Locking (`@Version`)**: Cờ version trên Entity `Seat` ở DB layer phòng thủ cuối cùng.
  3. **Pessimistic Lock Fallback (`FOR UPDATE`)**: Fallback kiểm tra trực tiếp DB.
- **Holding TTL (15 phút)**: Tự động giữ ghế, tự nhả về `AVAILABLE` nếu không thanh toán kịp.
- **Idempotency Key**: Chống double-submit ở API khởi tạo giao dịch (`Idempotency-Key` HTTP Header).

### 2. Tìm kiếm, Lọc & Sự kiện nổi bật
- Tìm kiếm theo tên/mô tả, lọc theo địa điểm, khoảng giá và nhà tổ chức (JPA Specification, dynamic filter).
- Khu vực **Sự kiện HOT** ở trang chủ do Admin gắn cờ nổi bật.

### 3. Nhà tổ chức (Organizer) & Quản trị (Admin)
- Người dùng đăng ký trở thành Nhà tổ chức → hồ sơ ở trạng thái **PENDING** chờ Admin duyệt.
- Nhà tổ chức đã **APPROVED** tự tạo sự kiện (kèm nhiều khu vực ghế/giá vé) và quản lý sự kiện của mình; có trang public riêng (`/organizers/:id`).
- Trang Admin (`/admin`): duyệt/từ chối hồ sơ Nhà tổ chức, gắn cờ HOT cho sự kiện, khoá/mở tài khoản người dùng, xem toàn bộ booking & tổng doanh thu.

### 4. Kiến trúc Async & Event-Driven
- **Transactional Outbox Pattern**: Đảm bảo atomicity khi lưu Booking và publish sự kiện sang Kafka cho Payment/Notification.
- **Apache Kafka**: Tách biệt luồng xử lý giữa Booking, Payment và Notification.

### 5. Observability & Security
- **Correlation ID (MDC Logging)**: `X-Correlation-ID` xuyên suốt các service và log.
- **OpenTelemetry & Zipkin**: Distributed tracing cho HTTP & Kafka message.
- **Spring Security & JWT**: RBAC (Admin / User), kiểm soát quyền theo endpoint ở từng service.

---

## 🏗️ Kiến trúc Microservices

| Service | Port | Trách nhiệm |
|---|---|---|
| `auth-service` | 8081 | Đăng ký/đăng nhập, JWT, quản lý user (Admin) |
| `user-service` | 8082 | Hồ sơ cá nhân người dùng |
| `event-service` | 8083 | Sự kiện, sơ đồ ghế, tìm kiếm/lọc, Nhà tổ chức (Organizer) |
| `booking-service` | 8084 | Giữ ghế, xác nhận đặt vé, Outbox, booking cho Admin |
| `payment-service` | 8085 | Xử lý thanh toán |

Hạ tầng dùng chung: PostgreSQL (`5432`, mỗi service 1 bảng `flyway_schema_history_<service>` riêng), Redis (`6379`), Kafka (`9092`), Zipkin (`9411`). Toàn bộ traffic ra ngoài đi qua **Nginx Gateway** (`80`), route theo prefix `/api/<domain>/` tới từng service.

---

## 📁 Cấu trúc thư mục (Repository Architecture)

```
.
├── README.md                      # Tài liệu dự án
├── docker-compose.yml             # Cấu hình Docker Compose cho toàn bộ hệ sinh thái
├── nginx/                         # API Gateway & Nginx Reverse Proxy
│   └── nginx.conf
├── .github/                       # CI/CD Workflows
│   └── workflows/ci.yml
├── seatflow-backend/              # Spring Boot 3 + Java 21, multi-module Maven
│   ├── common/                    # Shared: JWT, ApiResponse, PageResponse, Exception Handling
│   ├── auth-service/              # Auth, JWT, quản lý user
│   ├── user-service/              # Hồ sơ cá nhân
│   ├── event-service/             # Event, Seat, Organizer, Specification filter
│   ├── booking-service/           # Booking, Outbox, Feign client gọi event-service
│   └── payment-service/           # Payment
├── seatflow-frontend/              # React 18 + Vite + TypeScript + Tailwind CSS
│   ├── src/
│   │   ├── components/            # Header, ProtectedRoute, SeatMap, CountdownTimer
│   │   ├── pages/                 # event-list, event-detail, login, profile,
│   │   │                          # organizer-dashboard, organizer-profile, admin, booking-confirm
│   │   ├── services/apis/         # API layer theo domain (event, auth, booking, organizer,...)
│   │   └── types/                 # TypeScript Interfaces & Enums
│   ├── package.json
│   ├── vite.config.ts
│   └── Dockerfile
└── seatflow-migration/             # Dự án migration Flyway độc lập (chưa wire vào docker-compose)
```

---

## 🚀 Hướng dẫn Chạy Local Dev (Quick Start)

### Yêu cầu môi trường
- **Docker Desktop** (Docker Engine + Docker Compose)
- **Java 21 LTS** (cho backend development)
- **Node.js 20+** (cho frontend development)

### 1. Build jar cho backend (multi-module Maven reactor)
```bash
cd seatflow-backend
./mvnw clean package -DskipTests
```

### 2. Khởi chạy toàn bộ hệ thống bằng Docker Compose
```bash
docker-compose up -d --build
```
Hệ thống sẽ tự động khởi tạo:
- **PostgreSQL**: `localhost:5432` (DB: `seatflow_db`, User: `postgres`, Pass: `postgres`)
- **Redis**: `localhost:6379`
- **Kafka**: `localhost:9092`
- **Zipkin**: `http://localhost:9411`
- **Nginx API Gateway**: `http://localhost:80` (điểm truy cập chính, khuyến nghị dùng)
- **Frontend App (direct)**: `http://localhost:3000`
- **Backend services**: `localhost:8081-8085` (Swagger UI mỗi service: `/swagger-ui.html`)
---

## ⚙️ REST API Endpoints Overview (qua Gateway)

| Method | Endpoint | Mô tả |
|---|---|---|
| `POST` | `/api/auth/register`, `/api/auth/login` | Đăng ký / đăng nhập, nhận JWT |
| `GET` | `/api/auth/users` | [Admin] Danh sách người dùng (search + phân trang) |
| `PATCH` | `/api/auth/users/{id}/status` | [Admin] Khoá/mở tài khoản |
| `GET` | `/api/events` | Danh sách sự kiện — hỗ trợ `search`, `location`, `minPrice`, `maxPrice`, `hot`, `organizerId` |
| `GET` | `/api/events/{id}` | Chi tiết sự kiện & sơ đồ ghế |
| `POST` | `/api/events` | [Organizer đã duyệt] Tạo sự kiện mới |
| `GET` | `/api/events/mine` | [Organizer] Sự kiện của tôi |
| `PATCH` | `/api/events/{id}/hot` | [Admin] Gắn/gỡ cờ sự kiện nổi bật |
| `POST` | `/api/organizers/register` | Đăng ký trở thành Nhà tổ chức |
| `GET` | `/api/organizers/me` | Hồ sơ Nhà tổ chức của tôi |
| `GET` | `/api/organizers/{id}` | Trang public Nhà tổ chức |
| `GET` | `/api/organizers/pending` | [Admin] Hồ sơ chờ duyệt |
| `PATCH` | `/api/organizers/{id}/approve`, `/{id}/reject` | [Admin] Duyệt/từ chối |
| `POST` | `/api/bookings/hold` | Giữ ghế (yêu cầu `Idempotency-Key` header) |
| `POST` | `/api/bookings/confirm` | Xác nhận đặt vé & thanh toán |
| `GET` | `/api/bookings/{bookingCode}` | Tra cứu đơn đặt vé |
| `GET` | `/api/bookings/admin` | [Admin] Toàn bộ booking + tổng doanh thu |

---

## 🛡️ License & Author
- **Author**: LongVoz2606
- **Project**: SeatFlow Event Booking System
