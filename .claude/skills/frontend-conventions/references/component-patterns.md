# Component Patterns — QStore Web

## Overview

QStore Web được xây dựng với stack:

- React 19
- TypeScript
- Ant Design 5
- `@ant-design/pro-components`
- `@islands/pq-components`
- Tailwind CSS 4
- Redux Toolkit
- React Router DOM

Component nên ưu tiên tận dụng những gì framework và `@islands/pq-components` đã cung cấp, hạn chế tự triển khai lại các thành phần đã có sẵn.

---

# Component Structure

Mỗi component nên có cấu trúc đơn giản, rõ ràng.

```tsx
import { IProduct } from '@/services/apis/product/product.interface';

interface IProductCardProps {
  data: IProduct;
  onClick?: () => void;
}

const ProductCard = ({ data, onClick }: IProductCardProps) => {
  return (
    <div
      className="rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md"
      onClick={onClick}
    >
      <h3 className="text-base font-medium text-gray-900">
        {data.name}
      </h3>

      <p className="text-sm text-gray-500">
        {data.barcode}
      </p>
    </div>
  );
};

export default ProductCard;
```

---

# Page Structure

Không viết toàn bộ code vào một file page duy nhất. Mỗi page phải tách các thành phần phụ (form, modal, detail view…) thành component riêng để code tường minh, ngắn gọn và dễ đọc.

**Quy tắc:**

- **Giới hạn 300 dòng**: Mỗi file `.tsx` không được vượt quá 300 dòng. Nếu vượt quá, phải tách component.
- **Tách component con**: Form, modal, detail view, và các khối UI phức tạp phải được tách thành component riêng đặt trong thư mục `components/` cùng cấp.
- **File page chính** (`index.tsx`) chỉ nên chứa: state management, columns definition, search form config, event handlers, và layout chính (bảng dữ liệu, tabs). Các modal/form import từ `components/`.

**Cấu trúc thư mục chuẩn:**

```text
src/pages/app/<feature>/
├── index.tsx                         # Page chính — state, columns, table, handlers
└── components/
    ├── <Feature>ModalForm.tsx        # Form tạo/sửa trong modal
    └── <Feature>DetailModal.tsx      # Modal xem chi tiết
```

**Ví dụ tham khảo — Product page:**

```text
src/pages/app/product/
├── index.tsx                         # 378 dòng — state, columns, tabs, bảng dữ liệu
└── components/
    ├── ProductModalForm.tsx          # 205 dòng — Form tạo/sửa sản phẩm
    └── ProductDetailModal.tsx        # 67 dòng — Modal xem chi tiết
```

**Page chính** (`index.tsx`) import và sử dụng component con:

```tsx
import ProductDetailModal from './components/ProductDetailModal';
import ProductModalForm from './components/ProductModalForm';

// Trong JSX:
<ProductModalForm
  open={isFormOpen}
  formType={formType}
  product={selectedProduct}
  onClose={closeFormModal}
  onSubmit={handleSubmit}
/>

<ProductDetailModal
  open={isDetailOpen}
  product={selectedProduct}
  onClose={() => setIsDetailOpen(false)}
  onEdit={product => {
    setIsDetailOpen(false);
    openUpdateModal(product);
  }}
/>
```

**Component con** (`ProductModalForm.tsx`) nhận props rõ ràng và tự quản lý form state nội bộ:

```tsx
interface IProductModalFormProps {
  open: boolean;
  formType: EFormType;
  product?: IProduct;
  onClose: () => void;
  onSubmit: (values: IProductBody) => Promise<void>;
}

const ProductModalForm = ({ open, formType, product, onClose, onSubmit }: IProductModalFormProps) => {
  const [form] = Form.useForm<IProductBody>();
  // ... form logic
};
```

---

# Styling

## Tailwind CSS

Tailwind là lựa chọn mặc định cho toàn bộ styling.

```tsx
<div className="flex items-center gap-3 rounded-lg border p-4">
```

Không tạo CSS Module nếu chỉ phục vụ layout hoặc spacing.

## CSS riêng

Chỉ tạo file CSS khi cần:

- `@media print`
- animation phức tạp
- override Ant Design
- styling không thể biểu diễn bằng Tailwind

Ví dụ:

```text
PrintInvoice/
├── index.tsx
└── print.css
```

---

# Theme

Theme được quản lý thông qua Ant Design Token.

```ts
export const antdTheme = {
  token: {
    colorPrimary: '#4f46e5',
    borderRadius: 8,
  },
};
```

Nếu cần dùng chung màu trong Tailwind thì map lại trong `tailwind.config.js`.

Không tạo hệ thống CSS Variables riêng.

---

# Type Safety

Interface của model đặt trong service tương ứng.

```text
services/
└── apis/
    └── product/
        ├── product.api.ts
        └── product.interface.ts
```

Ví dụ:

```ts
export interface IProduct {
  id: string;
  name: string;
  barcode: string;
  stockQuantity: number;
}

export interface IProductQuery {
  keyword?: string;
  categoryId?: string;
}
```

Không tạo `component.interface.ts` trừ khi props được nhiều component sử dụng.

---

# Loading State

Sử dụng component của Ant Design.

```tsx
import { Skeleton } from 'antd';

if (isLoading) {
  return <Skeleton active />;
}
```

Hoặc:

```tsx
import { Spin } from 'antd';

<Spin tip="Đang tải..." />
```

Đối với `PQTable`, loading được xử lý tự động thông qua `request`.

---

# Component Categories

## Presentational Components

- Chỉ nhận props và render UI.
- Không chứa business logic.
- Đặt trong `src/components`.

Ví dụ:

- ProductCard
- CurrencyText
- NotificationItem
- BarcodeScannerModal

## Container Components

Đặt tại:

```text
src/pages/app/<feature>/
```

Chịu trách nhiệm:

- gọi API
- quản lý state
- xử lý nghiệp vụ
- truyền dữ liệu xuống component con

---

# Table Pattern

Toàn bộ danh sách dữ liệu sử dụng `PQTable`.

```tsx
<PQTable<IProduct>
  rowKey="id"
  request={async params => {
    return await productApi.getTable({
      params: {
        page: params.current,
        pageSize: params.pageSize,
        keyword: params.keyword,
      },
    });
  }}
  columns={columns}
/>
```

Sử dụng server-side pagination.

`request` của `PQTable` phải viết inline ngay tại component đang render bảng. Không tách riêng hàm `getProducts`/`fetchTable` rồi truyền vào `request`, để logic mapping params của bảng luôn nằm gần UI sử dụng nó.

Không tự triển khai:

- infinite scroll
- IntersectionObserver
- virtual list

Ngoại trừ các panel nhỏ không phân trang.

---

# Form Pattern

Toàn bộ form sử dụng Ant Design Form.

```tsx
const [form] = Form.useForm();

<Form
  form={form}
  layout="vertical"
  onFinish={handleFinish}
>
  <Form.Item
    name="name"
    label="Tên"
    rules={[
      {
        required: true,
        message: 'Bắt buộc',
      },
    ]}
  >
    <Input />
  </Form.Item>
</Form>
```

Validation sử dụng `rules`.

Không quản lý:

- errors
- touched
- validate

bằng `useState`.

---

# Select Pattern

Các dropdown lấy dữ liệu từ API sử dụng `PQSelect`.

```tsx
<PQSelect
  request={async params => {
    return supplierApi.getTable({
      params: {
        page: params.current,
        pageSize: params.pageSize,
        keyword: params.keyword,
      },
    });
  }}
  labelKey="name"
  valueKey="id"
  searchKey="keyword"
  requestParams={{
    pageSize: 20,
  }}
/>
```

Không tự viết logic:

- fetch
- debounce
- mapping options

Tương tự `PQTable`, `request` của `PQSelect` phải viết inline trong JSX nơi sử dụng select. Chỉ dùng service API trực tiếp bên trong inline callback.

---

# Notification

Thông báo sử dụng Ant Design.

```tsx
message.success('Lưu thành công');

message.error('Có lỗi xảy ra');

notification.info({
  message: 'Thông báo',
});
```

Không sử dụng thư viện toast bên ngoài.

---

# State Management

State nghiệp vụ sử dụng Redux Toolkit.

```tsx
const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
  },
  reducers: {
    addItem,
    updateQty,
    removeItem,
    clearCart,
  },
});
```

Context chỉ dùng cho:

- authentication
- environment
- global provider

Không dùng Context để quản lý state nghiệp vụ.

---

# Folder Structure

```text
src
├── components
│   ├── BarcodeScannerModal
│   ├── ConfirmDeleteModal
│   ├── CurrencyText
│   ├── NotificationPanel
│   ├── PrintInvoice
│   └── ProtectedRoute
│
├── pages
│   └── app
│       ├── product
│       ├── supplier
│       ├── customer
│       ├── sale
│       └── revenue
│
├── services
│   └── apis
│       ├── product
│       ├── supplier
│       └── customer
│
└── store
    ├── cart
    └── notification
```

---

# Best Practices

- Ưu tiên sử dụng component từ `@islands/pq-components`.
- Styling bằng Tailwind CSS.
- Theme quản lý qua Ant Design Token.
- Sử dụng `PQTable` cho toàn bộ danh sách dữ liệu.
- Sử dụng Ant Design `Form` cho mọi biểu mẫu.
- Sử dụng `PQSelect` cho các dropdown lấy dữ liệu từ API.
- Thông báo sử dụng `message` hoặc `notification` của Ant Design.
- State nghiệp vụ quản lý bằng Redux Toolkit.
- Interface đặt trong `services/apis/<feature>/<feature>.interface.ts`.
- Chỉ tạo CSS riêng khi Tailwind không đáp ứng được yêu cầu.
