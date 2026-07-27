# Kế hoạch dự án: Hệ thống đặt vé sự kiện (Booking System)

Mục tiêu: xây một dự án backend đủ sâu để show các kỹ năng cốt lõi (concurrency, caching, event-driven, auth/RBAC, observability), đồng thời luyện thêm frontend cơ bản và DevOps (Nginx, Docker, K8s).

---

## 1. Tech stack

### Backend
- **Ngôn ngữ / Framework:** Java 21, Spring Boot 3
- **Auth:** Spring Security + JWT, RBAC (permissions/groups)
- **Database:** PostgreSQL + Flyway (migration)
- **ORM:** Spring Data JPA, tận dụng `@Version` cho optimistic locking
- **Cache & Distributed lock:** Redis (Redisson client)
- **Message broker:** Kafka (outbox pattern để đảm bảo consistency DB ↔ event)
- **Observability:** Micrometer + OpenTelemetry + Zipkin, log có correlation ID qua MDC
- **API docs:** springdoc-openapi (Swagger UI)
- **Test:** JUnit 5, Testcontainers (test tích hợp với Postgres/Redis/Kafka thật)

### Frontend
- **Framework:** React (Vite) + TypeScript
- **State/data fetching:** TanStack Query
- **UI:** Tailwind CSS + component đơn giản tự viết (không cần bộ UI kit nặng)
- **Auth:** lưu JWT, refresh token flow, route guard theo role

### DevOps
- **Container hoá:** Docker, Docker Compose (local dev: Postgres, Redis, Kafka, các service)
- **Reverse proxy / gateway:** Nginx (routing, rate limit, quota theo API key nếu muốn nâng cao)
- **Orchestration:** Kubernetes (Minikube/Kind để luyện local), Helm chart
- **CI/CD:** GitHub Actions (build, test, build image, push registry)

---

## 2. Backend cần làm

### Giai đoạn 1 — MVP đồng bộ (monolith, chạy được sớm)
- Thiết kế schema: `events`, `seats`, `bookings`, `booking_items`
- API: danh sách sự kiện, sơ đồ ghế, tạo booking
- Logic giữ ghế: pessimistic lock hoặc `SELECT ... FOR UPDATE` để chống overselling cơ bản
- Idempotency key cho API tạo booking (chống double-submit)
- Unit test + integration test cho luồng đặt ghế

### Giai đoạn 2 — Async & concurrency nâng cao
- Tách `payment-service` riêng, giao tiếp qua Kafka
- Outbox pattern: ghi event vào bảng `outbox` cùng transaction với booking, một publisher riêng đẩy lên Kafka
- Redis distributed lock (Redisson) theo `seat_id` khi giữ ghế
- Thêm `@Version` (optimistic lock) trên `seats` làm lớp phòng thủ thứ hai
- Scheduler quét booking hết TTL (`HELD` quá 5 phút) → nhả ghế về `AVAILABLE` (compensation logic)
- Saga: xử lý khi payment fail → rollback trạng thái ghế

### Giai đoạn 3 — Hoàn thiện production-grade
- `auth-service`: JWT, RBAC (role: admin/organizer/customer), Redis cache cho permission lookup
- `notification-service`: consumer Kafka thuần, gửi email/SMS async khi có vé
- `ticket-service`: sinh vé (mã QR), trả file/link
- Observability: trace xuyên suốt các service bằng correlation ID, dashboard Zipkin
- Rate limiting ở tầng API (chống spam đặt ghế)
- Viết tài liệu API (OpenAPI) đầy đủ

---

## 3. Frontend cần làm

### Giai đoạn 1 — Luồng người dùng cơ bản
- Trang danh sách sự kiện
- Trang chi tiết sự kiện + sơ đồ ghế (chọn ghế trực quan, disable ghế đã bán/đang giữ)
- Trang xác nhận đặt vé + đếm ngược thời gian giữ ghế (TTL)
- Trang đăng nhập/đăng ký (JWT)

### Giai đoạn 2 — Hoàn thiện trải nghiệm
- Trang thanh toán (mock payment gateway)
- Trang "vé của tôi" (xem vé đã đặt, mã QR)
- Xử lý lỗi thực tế: ghế bị người khác giữ trước, hết hạn giữ ghế, thanh toán fail
- Loading/optimistic UI khi giữ ghế

### Giai đoạn 3 — Trang quản trị (admin)
- CRUD sự kiện, cấu hình sơ đồ ghế, giá vé theo hạng
- Dashboard xem tình trạng bán vé theo thời gian thực
- Quản lý user/role (RBAC)

---

## 4. DevOps cần làm

### Docker
- Viết Dockerfile riêng cho từng service (multi-stage build để image nhẹ)
- Docker Compose cho local dev: Postgres, Redis, Kafka (+ Zookeeper hoặc KRaft), Zipkin, các service backend, frontend
- Entrypoint script xử lý biến môi trường (giống kinh nghiệm bạn từng làm với `api-portal`)

### Nginx
- Cấu hình Nginx làm reverse proxy / API gateway trước các service
- Routing theo path (`/api/events`, `/api/bookings`, ...) tới đúng service
- Cấu hình rate limit (`limit_req`) để luyện chống spam đặt ghế
- Cấu hình cho frontend (serve static build + fallback SPA routing)
- (Nâng cao) `auth_request` để check JWT ngay ở tầng gateway trước khi vào service

### Kubernetes / Helm
- Viết Deployment, Service, Ingress cho từng thành phần
- Liveness/readiness probe cho từng service (đặc biệt service phụ thuộc DB/Redis/Kafka)
- ConfigMap/Secret cho cấu hình môi trường
- Helm chart tổng hợp, values.yaml cho từng environment (dev/staging)
- (Nâng cao) HPA (Horizontal Pod Autoscaler) để luyện scale theo tải

### CI/CD
- GitHub Actions: chạy test → build Docker image → push registry
- (Nâng cao) tự động deploy lên cluster khi merge vào `main`

---

## 5. Lộ trình gợi ý theo tuần

| Tuần | Mục tiêu |
|---|---|
| 1–2 | Backend MVP (giai đoạn 1) chạy local với Docker Compose |
| 3 | Frontend cơ bản kết nối được với backend MVP |
| 4 | Thêm Redis lock, Kafka, outbox pattern (giai đoạn 2 backend) |
| 5 | Hoàn thiện frontend (thanh toán, vé, xử lý lỗi) |
| 6 | Auth/RBAC, notification, observability (giai đoạn 3 backend) |
| 7 | Nginx gateway + Docker hoá toàn bộ hệ thống |
| 8 | Kubernetes + Helm, CI/CD, viết README/tài liệu kiến trúc |

Không cần bám cứng lịch này — ưu tiên xong gọn giai đoạn 1 (có demo chạy được) trước khi mở rộng.

---

## 6. Ghi chú

- Luôn giữ được một bản chạy demo được sau mỗi giai đoạn, tránh làm dở dang nhiều thứ cùng lúc.
- README nên giải thích rõ *tại sao* chọn giải pháp (vd: vì sao dùng Redisson lock + optimistic lock DB thay vì chỉ 1 trong 2) — đây là phần gây ấn tượng nhất khi người khác review.
