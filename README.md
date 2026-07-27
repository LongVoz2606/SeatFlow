# SeatFlow - High-Concurrency Event Ticket Booking System

![Java 21](https://img.shields.io/badge/Java-21-orange.svg)
![Spring Boot 3.3](https://img.shields.io/badge/Spring_Boot-3.3-green.svg)
![React 18](https://img.shields.io/badge/React-18-blue.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)
![Redis](https://img.shields.io/badge/Redis-7-red.svg)
![Kafka](https://img.shields.io/badge/Kafka-Apache-black.svg)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg)

**SeatFlow** là hệ thống đặt vé sự kiện high-concurrency được thiết kế theo tiêu chuẩn Production-grade, tập trung vào việc giải quyết bài toán đặt ghế đồng thời (overselling prevention), đảm bảo tính nhất quán dữ liệu (eventual consistency với Outbox Pattern), củng cố khả năng mở rộng và giám sát toàn diện hệ thống.

---

## 🌟 Tính năng chính & Giải pháp Kỹ thuật (Key Features)

### 1. Quản lý Đặt ghế High-Concurrency & Anti-Overselling
- **Multi-layer Concurrency Protection**:
  1. **Distributed Lock (Redisson Redis)**: Lock theo `seat_id` trước khi xử lý giao dịch.
  2. **Optimistic Locking (`@Version`)**: Thêm cờ version trên Entity `Seat` ở DB layer phòng thủ cuối cùng.
  3. **Pessimistic Lock Fallback (`FOR UPDATE`)**: Hỗ trợ fallback kiểm tra trực tiếp DB.
- **Holding TTL (5 phút)**: Tự động giữ ghế trong 5 phút. Nếu người dùng không thanh toán, ghế tự động nhả về trạng thái `AVAILABLE`.
- **Idempotency Key**: Đảm bảo chống double-submit ở tất cả API khởi tạo giao dịch (`Idempotency-Key` HTTP Header).

### 2. Kiến trúc Async & Event-Driven
- **Transactional Outbox Pattern**: Đảm bảo atomicity khi lưu Booking và ghi Event vào database trước khi Kafka Consumer publish sang các service khác (Payment, Notification).
- **Apache Kafka Integration**: Tách biệt luồng xử lý giữa Booking, Payment và Notification.

### 3. Observability & Security
- **Correlation ID (MDC Logging)**: Đánh dấu `X-Correlation-ID` xuyên suốt các service và log.
- **OpenTelemetry & Zipkin**: Distributed tracing toàn bộ request HTTP & Kafka message.
- **Spring Security & JWT**: RBAC (Admin / Organizer / Customer).

---

## 📁 Cấu trúc thư mục (Repository Architecture)

```
.
├── ke-hoach-du-an-dat-ve.md       # Blueprint kế hoạch dự án
├── README.md                      # Tài liệu dự án
├── docker-compose.yml             # Cấu hình Docker Compose cho toàn bộ hệ sinh thái
├── nginx/                         # API Gateway & Nginx Reverse Proxy
│   └── nginx.conf
├── .github/                       # CI/CD Workflows
│   └── workflows/ci.yml
├── seatflow-backend/              # Spring Boot 3 + Java 21 Backend
│   ├── src/
│   │   ├── main/java/com/seatflow/
│   │   │   ├── config/            # Security, Redis, Redisson, Kafka, OpenAPI, Async
│   │   │   ├── controller/        # REST Endpoints (Event, Booking, Auth)
│   │   │   ├── dto/               # Request/Response Data Objects
│   │   │   ├── entity/            # JPA Entities (Event, Seat, Booking, Outbox, User)
│   │   │   ├── repository/        # Spring Data JPA Repositories
│   │   │   ├── service/           # Business Logic & Redisson Lock Handler
│   │   │   └── exception/         # Global Exception Handling & Error DTOs
│   │   └── resources/
│   │       ├── application.yml
│   │       └── db/migration/      # Flyway SQL migrations (V1, V2)
│   ├── pom.xml
│   └── Dockerfile
└── seatflow-frontend/             # React + Vite + TypeScript + Tailwind CSS Frontend
    ├── src/
    │   ├── components/            # Reusable UI (SeatMap, Timer, Header, Card)
    │   ├── pages/                 # Event Explorer, Seat Selection, Confirmation
    │   ├── services/              # API Client (Axios)
    │   └── types/                 # TypeScript Interfaces & Enums
    ├── package.json
    ├── vite.config.ts
    └── Dockerfile
```

---

## 🚀 Hướng dẫn Chạy Local Dev (Quick Start)

### Yêu cầu môi trường
- **Docker Desktop** (Docker Engine + Docker Compose)
- **Java 21 LTS** (cho backend development)
- **Node.js 20+** (cho frontend development)

### 1. Khởi chạy toàn bộ hệ thống bằng Docker Compose
```bash
docker-compose up -d --build
```
Hệ thống sẽ tự động khởi tạo:
- **PostgreSQL**: `localhost:5432` (DB: `seatflow_db`, User: `postgres`, Pass: `postgres`)
- **Redis**: `localhost:6379`
- **Kafka**: `localhost:9092`
- **Zipkin**: `http://localhost:9411`
- **Nginx API Gateway**: `http://localhost:80`
- **Backend API**: `http://localhost:8080` (Swagger UI: `http://localhost:8080/swagger-ui.html`)
- **Frontend App**: `http://localhost:3000`

---

## ⚙️ REST API Endpoints Overview

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/api/events` | Lấy danh sách sự kiện đang mở bán |
| `GET` | `/api/events/{id}` | Chi tiết sự kiện & danh sách ghế/sơ đồ ghế |
| `POST` | `/api/bookings/hold` | Giữ ghế (yêu cầu `Idempotency-Key` header) |
| `POST` | `/api/bookings/confirm` | Xác nhận đặt vé & thanh toán |
| `GET` | `/api/bookings/{id}` | Truy vấn thông tin đơn đặt vé |

---

## 🛡️ License & Author
- **Author**: LongVoz2606
- **Project**: SeatFlow Event Booking System
