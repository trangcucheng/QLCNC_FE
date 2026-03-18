// HƯỚNG DẪN TRIỂN KHAI RBAC (Role-Based Access Control)

## 📚 MỤC LỤC

1. Kiến trúc RBAC
2. Cách sử dụng trong Component
3. Cách sử dụng trong Pages
4. Cấu hình Menu động
5. Backend Integration
6. Ví dụ thực tế

---

## 1️⃣ KIẾN TRÚC RBAC

### Luồng hoạt động:
```
Login → Backend trả về User + Roles + Permissions → AuthContext lưu trữ
→ Protected Components check quyền → Render UI theo quyền
```

### 3 Vai trò chính:
- **QUAN_TRI_VIEN** (Admin): Full quyền
- **LANH_DAO** (Lãnh đạo): Xem, Xuất báo cáo
- **CAN_BO_NGHIEP_VU** (Cán bộ nghiệp vụ): CRUD đối tượng, vụ việc

---

## 2️⃣ SỬ DỤNG TRONG COMPONENT

### A. Sử dụng useAuth hook

```tsx
import { useAuth } from "@/context/AuthContext";

function MyComponent() {
  const { user, hasPermission, hasRole, isAdmin } = useAuth();

  // Check permission
  const canCreate = hasPermission("ho-so-doi-tuong:create");
  const canDelete = hasPermission("ho-so-doi-tuong:delete");

  // Check role
  const isAdminUser = isAdmin(); // hoặc hasRole("Admin")

  return (
    <div>
      <p>Xin chào, {user?.hoTen}</p>
      
      {canCreate && (
        <button>Thêm mới</button>
      )}
      
      {isAdminUser && (
        <button>Cài đặt hệ thống</button>
      )}
    </div>
  );
}
```

### B. Sử dụng Protected Component

```tsx
import { Protected } from "@/components/auth/Protected";

function DoiTuongPage() {
  return (
    <div>
      <h1>Danh sách đối tượng</h1>
      
      {/* Chỉ user có quyền CREATE mới thấy nút này */}
      <Protected permission="ho-so-doi-tuong:create">
        <button>Thêm đối tượng mới</button>
      </Protected>
      
      {/* Chỉ Admin mới thấy */}
      <Protected role="QUAN_TRI_VIEN">
        <button>Xóa tất cả</button>
      </Protected>
      
      {/* Cần CẢ 2 permissions */}
      <Protected 
        permission={["ho-so-doi-tuong:update", "ho-so-doi-tuong:delete"]}
        requireAll
      >
        <button>Hành động đặc biệt</button>
      </Protected>
    </div>
  );
}
```

### C. Sử dụng usePermissions hook

```tsx
import { usePermissions } from "@/components/auth/Protected";

function TableActions({ id }: { id: string }) {
  const { canEdit, canDelete, canExport } = usePermissions({
    canEdit: "ho-so-doi-tuong:update",
    canDelete: "ho-so-doi-tuong:delete",
    canExport: "bao-cao:export",
  });

  return (
    <div className="flex gap-2">
      {canEdit && <button>Sửa</button>}
      {canDelete && <button>Xóa</button>}
      {canExport && <button>Xuất</button>}
    </div>
  );
}
```

---

## 3️⃣ SỬ DỤNG TRONG PAGES

### Ví dụ: Page Danh sách Đối tượng

```tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Protected, usePermissions } from "@/components/auth/Protected";
import { hoSoDoiTuongApi } from "@/lib/api";

export default function DoiTuongPage() {
  const { user, hasPermission } = useAuth();
  const [data, setData] = useState([]);
  
  const { 
    canCreate, 
    canUpdate, 
    canDelete 
  } = usePermissions({
    canCreate: "ho-so-doi-tuong:create",
    canUpdate: "ho-so-doi-tuong:update",
    canDelete: "ho-so-doi-tuong:delete",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const response = await hoSoDoiTuongApi.getAll();
    setData(response.data);
  };

  const handleDelete = async (id: string) => {
    if (!canDelete) {
      alert("Bạn không có quyền xóa!");
      return;
    }
    
    // Xử lý xóa...
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1>Quản lý đối tượng</h1>
        
        {/* Nút thêm mới - chỉ hiện nếu có quyền */}
        <Protected permission="ho-so-doi-tuong:create">
          <a href="/admin/doi-tuong/them-moi">
            <button>+ Thêm mới</button>
          </a>
        </Protected>
      </div>

      {/* Bảng dữ liệu */}
      <table>
        <thead>
          <tr>
            <th>Họ tên</th>
            <th>CMND/CCCD</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              <td>{item.hoTen}</td>
              <td>{item.soCMND_CCCD}</td>
              <td>
                <a href={\`/admin/doi-tuong/\${item.id}\`}>
                  <button>Xem</button>
                </a>
                
                {canUpdate && (
                  <a href={\`/admin/doi-tuong/\${item.id}/chinh-sua\`}>
                    <button>Sửa</button>
                  </a>
                )}
                
                {canDelete && (
                  <button onClick={() => handleDelete(item.id)}>
                    Xóa
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## 4️⃣ CẤU HÌNH MENU ĐỘNG

File: `/src/config/menu.config.ts`

### Định nghĩa menu theo permissions:

```typescript
export const MENU_CONFIG: MenuItem[] = [
  {
    title: "Quản lý đối tượng",
    icon: "👤",
    permission: "ho-so-doi-tuong:read", // Cần quyền này để thấy menu
    children: [
      {
        title: "Danh sách",
        path: "/admin/doi-tuong",
        permission: "ho-so-doi-tuong:read",
      },
      {
        title: "Thêm mới",
        path: "/admin/doi-tuong/them-moi",
        permission: "ho-so-doi-tuong:create", // Chỉ ai tạo được mới thấy
      },
    ],
  },
  {
    title: "Quản trị hệ thống",
    icon: "⚙️",
    role: "QUAN_TRI_VIEN", // Chỉ Admin mới thấy
    children: [...],
  },
];
```

### Menu sẽ tự động được filter dựa trên quyền của user!

---

## 5️⃣ BACKEND INTEGRATION

### Cấu trúc response từ Backend khi login:

```json
{
  "statusCode": 200,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1...",
    "user": {
      "id": "uuid",
      "hoTen": "Nguyễn Văn A",
      "email": "nva@example.com",
      "loaiNguoiDung": "CAN_BO_NGHIEP_VU",
      "vaiTroNguoiDung": [
        {
          "id": "uuid",
          "vaiTro": {
            "id": "uuid",
            "tenVaiTro": "Cán bộ nghiệp vụ",
            "vaiTroQuyen": [
              {
                "quyen": {
                  "tenQuyen": "ho-so-doi-tuong:read"
                }
              },
              {
                "quyen": {
                  "tenQuyen": "ho-so-doi-tuong:create"
                }
              }
            ]
          }
        }
      ]
    }
  }
}
```

### AuthContext sẽ tự động extract:
- **roles**: ["Cán bộ nghiệp vụ"]
- **permissions**: ["ho-so-doi-tuong:read", "ho-so-doi-tuong:create"]

---

## 6️⃣ VÍ DỤ THỰC TẾ

### Kịch bản 1: Cán bộ nghiệp vụ login

```
✅ Thấy: Dashboard, Quản lý đối tượng, Quản lý vụ việc, Tìm kiếm, Báo cáo
❌ Không thấy: Quản trị hệ thống, Quản lý người dùng
✅ Có thể: Thêm/Sửa/Xóa đối tượng và vụ việc
❌ Không thể: Xóa người dùng, Sao lưu hệ thống
```

### Kịch bản 2: Lãnh đạo login

```
✅ Thấy: Dashboard, Xem đối tượng, Xem vụ việc, Báo cáo, Xuất báo cáo
❌ Không thấy: Nút "Thêm mới", "Sửa", "Xóa", Quản trị hệ thống
✅ Có thể: Xem tất cả dữ liệu, Xuất báo cáo
❌ Không thể: Tạo/Sửa/Xóa dữ liệu
```

### Kịch bản 3: Admin login

```
✅ Thấy: TẤT CẢ menu
✅ Có thể: Làm MỌI THỨ (full permissions)
```

---

## 🎯 TÓM TẮT CÁCH DÙNG

### Trong Component:
```tsx
const { hasPermission, isAdmin } = useAuth();
if (hasPermission("resource:action")) { ... }
```

### Trong JSX:
```tsx
<Protected permission="resource:action">
  <Button>Hành động</Button>
</Protected>
```

### Trong Page:
```tsx
const { canCreate, canEdit } = usePermissions({
  canCreate: "resource:create",
  canEdit: "resource:update",
});
```

### Menu tự động filter theo quyền của user!

---

## 📝 DANH SÁCH PERMISSIONS PHỔ BIẾN

```
ho-so-doi-tuong:read      # Xem đối tượng
ho-so-doi-tuong:create    # Tạo đối tượng
ho-so-doi-tuong:update    # Sửa đối tượng
ho-so-doi-tuong:delete    # Xóa đối tượng

ho-so-vu-viec:read        # Xem vụ việc
ho-so-vu-viec:create      # Tạo vụ việc
ho-so-vu-viec:update      # Sửa vụ việc
ho-so-vu-viec:delete      # Xóa vụ việc

bao-cao:read              # Xem báo cáo
bao-cao:export            # Xuất báo cáo

users:read                # Xem người dùng
users:create              # Tạo người dùng
users:update              # Sửa người dùng
users:delete              # Xóa người dùng

backup:read               # Xem backup
backup:create             # Tạo backup
backup:restore            # Khôi phục backup
```
