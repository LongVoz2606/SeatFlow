# Naming Conventions — QStore Web

## Overview

QStore Web tuân theo các quy ước đặt tên nhằm đảm bảo tính nhất quán trên toàn bộ source code.

---

# Components

## Page Components

- **Pattern:** `PascalCase + Page`
- **Location:** `src/pages/app/{feature}/`

Ví dụ:

```text
ProductPage
SupplierPage
PurchaseOrderPage
RevenuePage
OrderDetailPage
```

---

## Page Folders

- Một từ: `camelCase`
- Nhiều từ: `kebab-case`

Ví dụ:

```text
product/
supplier/
customer/
sale/
history/

purchase-order/
order-detail/
invoice-day/
invoice-month/
```

Mỗi page là một thư mục, file chính luôn là:

```text
index.tsx
```

---

## Shared Components

Các component dùng chung trong project.

- **Pattern:** `PascalCase`
- **Location:** `src/components/`

Ví dụ:

```text
BarcodeScannerModal
NotificationPanel
ConfirmDeleteModal
CurrencyText
PrintInvoice
ProtectedRoute
```

Mỗi component là một thư mục:

```text
ConfirmDeleteModal/
├── index.tsx
```

Không sử dụng prefix.

---

## Page Sub-components

Các component chỉ sử dụng trong một page.

- **Pattern:** `PascalCase`

Ví dụ:

```text
ProductList
ProductTable
ProductForm
SearchBar
SupplierForm
SupplierFormModal
ProductCreateModal
```

Suffix được khuyến nghị:

| Suffix | Ý nghĩa |
|---------|----------|
| `Modal` | Dialog / Modal |
| `Form` | Form |
| `Table` | Bảng |
| `List` | Danh sách |
| `Card` | Card |
| `Item` | Item |

---

# Services

## API Services

Mỗi domain có một thư mục riêng.

**Pattern**

```text
src/services/apis/{domain}/{domain}.api.ts
```

Ví dụ:

```text
services/apis/product/product.api.ts
services/apis/supplier/supplier.api.ts
services/apis/customer/customer.api.ts
```

---

## API Interfaces

Interface đặt cùng thư mục với API.

**Pattern**

```text
{domain}.interface.ts
```

Ví dụ:

```text
product.interface.ts
supplier.interface.ts
customer.interface.ts
```

---

# Types

## Business Interfaces

Sử dụng prefix `I`.

Ví dụ:

```text
IProduct
ISupplier
ICustomer
ISaleInvoice
IPurchaseOrder
```

---

## Enums

Sử dụng prefix `E`.

Ví dụ:

```text
ERole
EPaymentMethod
ESaleStatus
EPurchaseOrderStatus
ENotificationType
```

---

## Constants

Sử dụng `SCREAMING_SNAKE_CASE`.

Ví dụ:

```text
PAGE_SIZE
STOCK_THRESHOLD
NOTIFICATION_BUFFER
DEFAULT_LANGUAGE
```

---

# Redux Toolkit

## Slice Files

**Pattern**

```text
store/{domain}/{domain}Slice.ts
```

Ví dụ:

```text
store/cart/cartSlice.ts
store/auth/authSlice.ts
store/notification/notificationSlice.ts
```

---

## Reducer Actions

Sử dụng:

```text
camelCase
```

Ví dụ:

```text
addItem
removeItem
updateQty
clearCart

login
logout

markAsRead
clearNotifications
```

Không lặp lại tên domain.

---

# Hooks

## Custom Hooks

Luôn bắt đầu bằng `use`.

Ví dụ:

```text
usePermission
useDebounce
useBarcodeScanner
usePrinter
useMqttNotification
```

---

# Utilities

## Utility Functions

Sử dụng `camelCase`.

Ví dụ:

```text
formatCurrency
formatDate
validateEmail
calculateTotal
generateBarcode
```

---

# Routing

## Route Paths

Sử dụng `kebab-case`.

Ví dụ:

```text
/app/products
/app/customers
/app/order-detail/:id
/app/purchase-order
/app/invoice-day
```

---

## Route Parameters

Sử dụng `camelCase`.

Ví dụ:

```text
id
invoiceId
productId
customerId
```

---

## Route Definitions

Toàn bộ route khai báo tập trung tại:

```text
src/configs/appRoutes.tsx
```

---

# Styling

## Tailwind Classes

Viết trực tiếp trong JSX.

Ví dụ:

```tsx
<div className="flex items-center gap-4 rounded-lg border p-4">
```

Nếu class quá dài có thể dùng `clsx` hoặc helper `cn()`.

---

## CSS Files

Chỉ tạo CSS riêng khi thật sự cần.

**Pattern**

```text
ComponentName.css
```

Ví dụ:

```text
PrintInvoice.css
```

Tên class sử dụng `kebab-case`.

Ví dụ:

```css
.invoice-header {}
.print-container {}
```

---

# File Naming

## React Components

```text
ProductCard.tsx
```

---

## Pages

```text
pages/
└── product/
    └── index.tsx
```

---

## Test Files

Pattern:

```text
{filename}.test.tsx
```

hoặc

```text
{filename}.spec.tsx
```

Ví dụ:

```text
product.test.tsx
supplier.spec.tsx
```

---

## Config Files

Đặt trong:

```text
src/configs/
```

Ví dụ:

```text
theme.ts
constants.ts
enum.ts
permissions.ts
appRoutes.tsx
```

---

## Index Files

Mỗi component hoặc page folder có một file export chính.

Ví dụ:

```text
ConfirmDeleteModal/
├── index.tsx

ProductPage/
├── index.tsx
```

---

# Folder Naming

| Loại | Convention |
|------|------------|
| Component Folder | PascalCase |
| Feature Folder | camelCase hoặc kebab-case |
| Service Folder | camelCase |
| Store Folder | camelCase |
| Hook Folder | camelCase |

---

# Variable Naming

| Loại | Convention |
|------|------------|
| Variable | camelCase |
| Function | camelCase |
| Boolean | is / has / can / should |
| Array | Danh từ số nhiều |
| Object | Danh từ số ít |

Ví dụ:

```ts
const product = {};

const products = [];

const isLoading = false;

const hasPermission = true;

const canEdit = false;

const handleSubmit = () => {};

const fetchProducts = async () => {};
```

---

# Interface Naming

```ts
interface IProduct {}

interface ISupplier {}

interface IProductQuery {}

interface IProductResponse {}

interface ICreateProductBody {}

interface IUpdateProductBody {}
```

---

# Enum Naming

```ts
enum ERole {}

enum EPaymentMethod {}

enum ESaleStatus {}
```

Enum value sử dụng `SCREAMING_SNAKE_CASE`.

```ts
enum ESaleStatus {
  PENDING,
  COMPLETED,
  CANCELLED,
}
```

---

# Best Practices

- Component sử dụng PascalCase.
- Page component kết thúc bằng `Page`.
- Shared component không sử dụng prefix.
- Interface sử dụng prefix `I`.
- Enum sử dụng prefix `E`.
- Constant sử dụng `SCREAMING_SNAKE_CASE`.
- Function và variable sử dụng `camelCase`.
- Hook bắt đầu bằng `use`.
- Route sử dụng `kebab-case`.
- API đặt theo `{domain}.api.ts`.
- Interface đặt theo `{domain}.interface.ts`.
- Redux Slice đặt theo `{domain}Slice.ts`.
- Config đặt trong `src/configs/`.
- Mỗi component hoặc page folder có `index.tsx`.
