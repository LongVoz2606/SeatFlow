# API Patterns Chi Tiết

## API Layer Structure

### 1. File Organization

```
src/services/apis/
├── index.ts              # Exports axiosClient and apiService helper
├── interface.ts          # Exports type IApiRequestParams, IApiResponseTable, etc.
├── ConfigApi.tsx         # Axios interceptors component (Toast alerts, CamelCase, token refresh)
├── utils.ts              # camelizeKeys utility
├── product/              # Product API domain folder
│   ├── product.api.ts       # Product endpoint definitions
│   └── product.interface.ts # Product interfaces & types
└── auth/                 # Auth API domain folder
    ├── auth.api.ts
    └── auth.interface.ts
```

### 2. API Service Template

API domain files should export a default object containing endpoint methods using `apiService`. Define typed parameters using `IApiRequestParams<PathParams, QueryParams, BodyParams>`.

```typescript
// services/apis/product/product.api.ts

import type { IApiRequestParams, IApiResponseTable, IApiResponseValue } from '@islands/pq-components';
import type { IProduct, IProductBody, IProductQuery } from './product.interface';

export default {
  // Get list with pagination & query filters
  getTable(params: IApiRequestParams<null, IProductQuery, null>): Promise<IApiResponseTable<IProduct>> {
    return apiService({
      url: '/v1/api/products',
      ...params,
    });
  },

  // Get single item by ID path variable
  getById(params: IApiRequestParams<{ id: number }, null, null>): Promise<IApiResponseValue<IProduct>> {
    return apiService({
      url: '/v1/api/products/:id',
      ...params,
    });
  },

  // Create new item (POST request)
  create(params: IApiRequestParams<null, null, IProductBody>): Promise<void> {
    return apiService({
      url: '/v1/api/products',
      method: 'POST',
      ...params,
    });
  },

  // Update item (PUT request)
  update(params: IApiRequestParams<{ id: number }, null, IProductBody>): Promise<void> {
    return apiService({
      url: '/v1/api/products/:id',
      method: 'PUT',
      ...params,
    });
  },

  // Delete item (DELETE request)
  delete(params: IApiRequestParams<{ id: number }, null, null>): Promise<void> {
    return apiService({
      url: '/v1/api/products/:id',
      method: 'DELETE',
      ...params,
    });
  },
};
```

### 3. Interface Template

```typescript
// services/apis/product/product.interface.ts
export interface IProduct {
  id: number;
  productCode: string;
  productName: string;
  price: number;
  stock: number;
  categoryId: number;
  unitId: number;
}

export interface IProductBody {
  productName: string;
  price: number;
  stock: number;
  categoryId: number;
  unitId: number;
}

export interface IProductQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  categoryId?: number;
}
```

---

## API Response Types

Standard API response envelopes are defined in `src/services/apis/interface.ts`:

```typescript
export interface IApiResponseValue<T> {
  value: T;
}

export interface IApiResponseList<T> {
  data: T[];
}

export interface IApiResponseTable<T> {
  data: T[];
  total: number;
  totalPage: number;
  page: number;
  pageSize: number;
}
```

---

## Interceptors & Config (`ConfigApi.tsx`)

Axios interceptors are set up inside `ConfigApi.tsx` (which must be mounted in the React tree). It handles:

1. **Auth Header Injection**: Automatically appends `Authorization: Bearer <token>` to requests if authenticated.
2. **Case Conversion**: Automatically camelizes keys (`snake_case → camelCase`) for all JSON responses.
3. **Success Alerts**: Triggers a success toast if request configuration has `notifyConfig.success` string specified.
4. **Token Refresh Singleton**: Handles `401 Unauthorized` errors by attempting a token refresh. Only one refresh request runs at a time. If it fails, clears the session and logs the user out.
5. **Standardized Error Toasts**:
   - `401` / `403` -> "Không có quyền truy cập!"
   - `500+` / No response -> "Kết nối không ổn định, vui lòng thử lại."
   - Known server error codes -> Translated using `apiErrorMessages` dictionary.

```typescript
// Example config options when calling apiService
apiService({
  url: '/v1/api/products',
  method: 'POST',
  body: newProduct,
  notifyConfig: {
    success: 'Tạo sản phẩm thành công!',
  },
  skipAuthRefresh: false, // set to true to bypass token refresh logic (e.g. login/refresh calls)
});
```

## API POST Body — Spread Operator & Không Thêm Default

Đối với các hàm gọi API có `body` (POST, PUT), **không** thêm giá trị default và **không** liệt kê từng thuộc tính một cách thủ công. Sử dụng toán tử `...` (spread/destructuring) để truyền toàn bộ object, giữ code ngắn gọn.

### ❌ Sai — Liệt kê từng thuộc tính

```tsx
const handleSubmit = async (values: IProductBody) => {
  await productApi.create({
    body: {
      productName: values.productName,
      productCode: values.productCode,
      barCode: values.barCode,
      costPrice: values.costPrice ?? 0,
      sellingPrice: values.sellingPrice ?? 0,
      stockQuantity: values.stockQuantity ?? 0,
      productCategoryId: values.productCategoryId,
      productUnitId: values.productUnitId,
      supplierId: values.supplierId,
      description: values.description,
      image: values.image,
      status: values.status ?? 'ACTIVE',
    },
  });
};
```

### ✅ Đúng — Dùng spread operator

```tsx
const handleSubmit = async (values: IProductBody) => {
  await productApi.create({
    body: values,
  });
};
```

Hoặc khi cần bổ sung thêm field:

```tsx
const handleSubmit = async (values: IProductBody) => {
  await productApi.update({
    pathVars: { id: selectedProduct.productId },
    body: {
      ...values,
      updatedBy: currentUser.id,
    },
  });
};
```

**Quy tắc:**

- **Giá trị default** nên được xử lý ở tầng form (initial values, `form.setFieldsValue`) hoặc backend, **không** xử lý tại lời gọi API.
- **Dùng `...values`** (spread) thay vì gán từng thuộc tính `key: values.key`. Chỉ liệt kê riêng những field cần transform hoặc bổ sung thêm.
- Giữ hàm `handleSubmit` càng ngắn gọn càng tốt.
