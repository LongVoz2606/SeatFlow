---
name: frontend-conventions
description: Hướng dẫn quy chuẩn viết code frontend React, đặt tên component, tổ chức folder và cấu trúc API layer cho SeatFlow
---

# Quy chuẩn Phát triển Frontend React cho SeatFlow

Tài liệu này tóm tắt các quy tắc cốt lõi về component, đặt tên và giao tiếp API của hệ thống frontend. Chi tiết đầy đủ có thể được xem trong các tài liệu tham chiếu dưới đây.

## Tài liệu Tham chiếu
- [Component Patterns](references/component-patterns.md) — Chi tiết về cấu trúc component, page, loading, theme và forms.
- [Naming Conventions](references/naming.md) — Quy tắc đặt tên cho biến, hàm, component, interfaces, enums và routes.
- [API Patterns](references/api-patterns.md) Chi tiết về cấu trúc API Layer, axios client, auto token injection và payload body.

## Tóm tắt Quy tắc Chính

### 1. Tổ chức Thư mục & Đặt tên
- **Thư mục Component/Page**: Mỗi component hoặc page phải nằm trong thư mục riêng và file chính luôn tên là `index.tsx` (ví dụ: `src/components/Header/index.tsx`, `src/pages/event-list/index.tsx`).
- **Page Component**: Có hậu tố `Page` ở tên component chính (ví dụ: `EventListPage`).
- **Business Interfaces**: Bắt đầu bằng chữ `I` (ví dụ: `IEvent`, `ISeat`).
- **Enums**: Bắt đầu bằng chữ `E` (ví dụ: `ESeatStatus`).
- **Thư mục/File API**: Đặt trong `src/services/apis/` theo dạng `{domain}/{domain}.api.ts` và `{domain}.interface.ts`.

### 2. Thiết kế Component
- **Quy tắc 300 dòng**: Mỗi file `.tsx` không được vượt quá 300 dòng. Nếu vượt quá, cần tách nhỏ các component con (form, modal, table) vào thư mục `components/` cùng cấp.
- **Form**: Sử dụng Ant Design Form, quản lý validation qua `rules`, không dùng `useState` thủ công cho errors/touched.

### 3. Giao tiếp API
- Dùng `apiService` và Axios Client tập trung.
- **Tiêm Token tự động**: Đọc JWT token từ `localStorage` và tự động gắn vào Header `Authorization`.
- **Spread Operator cho Body**: Sử dụng toán tử `...` để truyền toàn bộ request body, không gán thủ công từng thuộc tính và không gán giá trị mặc định ở lời gọi API.
