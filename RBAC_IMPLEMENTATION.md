# 🔐 HỆ THỐNG RBAC - ROLE-BASED ACCESS CONTROL

## 📦 CÁC FILE ĐÃ TẠO

### 1. **Core Files**

#### `/src/context/AuthContext.tsx`
- Context quản lý authentication và authorization
- Chứa user state, roles, permissions
- Các functions: `login()`, `logout()`, `hasPermission()`, `hasRole()`

#### `/src/components/auth/Protected.tsx`
- Component `<Protected>` để bảo vệ UI elements
- Hook `usePermissions()` để check nhiều quyền
- Support AND/OR logic cho permissions

#### `/src/types/index.ts`
- Types cho User, Role, Permission
- Enum LoaiNguoiDung
- Interface AuthUser

#### `/src/config/menu.config.ts`
- Cấu hình menu hệ thống
- Menu theo permissions
- Menu shortcuts cho từng role

#### `/src/components/layout/DynamicSidebar.tsx`
- Sidebar tự động filter menu theo quyền
- Display role info
- Logout button

### 2. **Documentation Files**

#### `/RBAC_GUIDE.md` (Frontend)
- Hướng dẫn sử dụng RBAC đầy đủ
- Examples cho mọi use case
- Best practices

#### `/RBAC_DATABASE_SETUP.md` (Backend)
- Cấu trúc database
- Seed data mẫu
- API response format
- Prisma queries

### 3. **Demo Files**

#### `/src/app/(admin)/doi-tuong-demo/page.tsx`
- Page demo đầy đủ RBAC features
- Ví dụ thực tế về phân quyền
- UI test permissions

---

## 🚀 CÁCH TRIỂN KHAI

### Bước 1: Setup Backend (Quan trọng!)

1. **Tạo Permissions trong database:**
```sql
INSERT INTO Quyen (tenQuyen, moTa) VALUES
('ho-so-doi-tuong:read', 'Xem đối tượng'),
('ho-so-doi-tuong:create', 'Tạo đối tượng'),
('ho-so-doi-tuong:update', 'Sửa đối tượng'),
('ho-so-doi-tuong:delete', 'Xóa đối tượng'),
-- ... thêm các quyền khác
```

2. **Tạo Roles:**
```sql
INSERT INTO VaiTro (tenVaiTro, moTa) VALUES
('Admin', 'Quản trị viên - Full quyền'),
('Lãnh đạo', 'Lãnh đạo - Chỉ xem'),
('Cán bộ nghiệp vụ', 'Cán bộ - CRUD');
```

3. **Gán Permissions cho Roles:**
```sql
-- Admin có tất cả permissions
INSERT INTO VaiTroQuyen (vaiTroId, quyenId)
SELECT (SELECT id FROM VaiTro WHERE tenVaiTro = 'Admin'), id FROM Quyen;
```

4. **Tạo test users:**
```sql
-- Admin
INSERT INTO NguoiDung (hoTen, email, matKhau, loaiNguoiDung)
VALUES ('Admin', 'admin@qlcnc.vn', 'hashed_password', 'QUAN_TRI_VIEN');

-- Gán role cho user
INSERT INTO VaiTroNguoiDung (nguoiDungId, vaiTroId)
VALUES (
  (SELECT id FROM NguoiDung WHERE email = 'admin@qlcnc.vn'),
  (SELECT id FROM VaiTro WHERE tenVaiTro = 'Admin')
);
```

5. **Update Auth API để trả về roles + permissions:**

File: `auth.service.ts`
```typescript
async login(loginDto: LoginDTO) {
  const user = await this.prisma.nguoiDung.findUnique({
    where: { email: loginDto.email },
    include: {
      vaiTroNguoiDung: {
        include: {
          vaiTro: {
            include: {
              vaiTroQuyen: {
                include: {
                  quyen: true,
                },
              },
            },
          },
        },
      },
    },
  });
  
  // Verify password...
  // Generate token...
  
  return {
    access_token: token,
    user: user, // Trả về user với đầy đủ thông tin roles + permissions
  };
}
```

### Bước 2: Frontend đã sẵn sàng!

Tất cả code Frontend đã được tạo. Chỉ cần:

1. **AuthProvider đã được wrap trong layout.tsx**
2. **Protected component có thể dùng ngay**
3. **Menu tự động filter**

---

## 💡 CÁCH SỬ DỤNG

### 1. Trong Component

```tsx
import { useAuth } from "@/context/AuthContext";

function MyComponent() {
  const { user, hasPermission, isAdmin } = useAuth();
  
  const canCreate = hasPermission("ho-so-doi-tuong:create");
  
  return (
    <>
      {canCreate && <button>Thêm mới</button>}
      {isAdmin() && <button>Admin Only</button>}
    </>
  );
}
```

### 2. Với Protected Component

```tsx
import { Protected } from "@/components/auth/Protected";

<Protected permission="ho-so-doi-tuong:create">
  <button>Thêm đối tượng</button>
</Protected>

<Protected role="QUAN_TRI_VIEN">
  <AdminPanel />
</Protected>
```

### 3. Với usePermissions Hook

```tsx
import { usePermissions } from "@/components/auth/Protected";

const { canCreate, canEdit, canDelete } = usePermissions({
  canCreate: "ho-so-doi-tuong:create",
  canEdit: "ho-so-doi-tuong:update",
  canDelete: "ho-so-doi-tuong:delete",
});
```

---

## 🎯 TEST RBAC

### Test Accounts (cần tạo trong database):

```
1️⃣ Admin
   Email: admin@qlcnc.vn
   Password: admin123
   Vai trò: QUAN_TRI_VIEN
   Quyền: TẤT CẢ
   
2️⃣ Lãnh đạo  
   Email: lanhdao@qlcnc.vn
   Password: lanhdao123
   Vai trò: LANH_DAO
   Quyền: Chỉ XEM và XUẤT báo cáo
   
3️⃣ Cán bộ nghiệp vụ
   Email: canbo@qlcnc.vn
   Password: canbo123
   Vai trò: CAN_BO_NGHIEP_VU
   Quyền: CRUD đối tượng và vụ việc
```

### Test Scenarios:

1. **Login với Admin:**
   - ✅ Thấy tất cả menu
   - ✅ Tất cả nút đều có
   - ✅ Có thể làm mọi thứ

2. **Login với Lãnh đạo:**
   - ✅ Chỉ thấy: Dashboard, Xem đối tượng, Xem vụ việc, Báo cáo
   - ❌ KHÔNG thấy: Nút "Thêm mới", "Sửa", "Xóa"
   - ❌ KHÔNG thấy: Menu "Quản trị hệ thống"

3. **Login với Cán bộ:**
   - ✅ Thấy: Dashboard, Quản lý đối tượng, Quản lý vụ việc
   - ✅ Có nút: Thêm, Sửa, Xóa đối tượng/vụ việc
   - ❌ KHÔNG thấy: Menu "Quản trị hệ thống"

---

## 🔗 DEMO PAGE

Đã tạo demo page tại: `/admin/doi-tuong-demo`

- Hiển thị thông tin user và quyền
- Demo tất cả RBAC features
- Test permissions trong table actions

---

## 📋 CHECKLIST

### Backend:
- [ ] Tạo bảng Permissions
- [ ] Tạo bảng Roles  
- [ ] Gán Permissions cho Roles
- [ ] Tạo test users với roles
- [ ] Update login API để include roles + permissions
- [ ] Update profile API để include roles + permissions

### Frontend:
- [x] AuthContext
- [x] Protected Component
- [x] usePermissions Hook
- [x] Dynamic Menu
- [x] Update Layout với AuthProvider
- [x] Update SignInForm
- [ ] Test với real API

### Testing:
- [ ] Test login với 3 roles
- [ ] Verify menu hiển thị đúng
- [ ] Verify permissions work correctly
- [ ] Test protected routes

---

## 🚨 LƯU Ý

1. **Backend PHẢI trả về đúng format** như trong `RBAC_DATABASE_SETUP.md`
2. **Permissions format**: `resource:action` (vd: `ho-so-doi-tuong:create`)
3. **Admin** tự động có tất cả quyền (check trong `AuthContext.tsx`)
4. **Menu** tự động filter, không cần code thêm
5. **Protected component** có thể nest nhiều tầng

---

## 📚 TÀI LIỆU THAM KHẢO

- **Frontend Guide:** `/RBAC_GUIDE.md`
- **Backend Setup:** `/RBAC_DATABASE_SETUP.md`
- **Demo Page:** `/admin/doi-tuong-demo`
- **AuthContext:** `/src/context/AuthContext.tsx`
- **Protected:** `/src/components/auth/Protected.tsx`
