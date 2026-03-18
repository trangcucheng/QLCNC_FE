// Menu configuration với phân quyền

export interface MenuItem {
  title: string;
  path?: string;
  icon?: string;
  permission?: string | string[]; // Quyền cần có để xem menu
  role?: string | string[]; // Vai trò cần có để xem menu
  children?: MenuItem[];
  badge?: string;
}

/**
 * Cấu hình menu hệ thống với phân quyền
 * 
 * Permission format: "resource:action"
 * - resource: ho-so-doi-tuong, ho-so-vu-viec, users, bao-cao, etc.
 * - action: read, create, update, delete
 * 
 * Examples:
 * - "ho-so-doi-tuong:read" - Xem danh sách đối tượng
 * - "ho-so-doi-tuong:create" - Tạo đối tượng mới
 * - "users:delete" - Xóa người dùng
 */
export const MENU_CONFIG: MenuItem[] = [
  {
    title: "Dashboard",
    path: "/admin",
    icon: "📊",
    // Tất cả roles đều có thể xem dashboard
  },
  {
    title: "Quản lý đối tượng",
    icon: "👤",
    permission: "ho-so-doi-tuong:read",
    children: [
      {
        title: "Danh sách đối tượng",
        path: "/admin/doi-tuong",
        permission: "ho-so-doi-tuong:read",
      },
      {
        title: "Thêm đối tượng",
        path: "/admin/doi-tuong/them-moi",
        permission: "ho-so-doi-tuong:create",
      },
    ],
  },
  {
    title: "Quản lý vụ việc",
    icon: "📋",
    permission: "ho-so-vu-viec:read",
    children: [
      {
        title: "Danh sách vụ việc",
        path: "/admin/vu-viec",
        permission: "ho-so-vu-viec:read",
      },
      {
        title: "Thêm vụ việc",
        path: "/admin/vu-viec/them-moi",
        permission: "ho-so-vu-viec:create",
      },
    ],
  },
  {
    title: "Tìm kiếm",
    path: "/admin/tim-kiem",
    icon: "🔍",
    // Tất cả roles đều có thể tìm kiếm
  },
  {
    title: "Báo cáo & Thống kê",
    icon: "📈",
    permission: "bao-cao:read",
    children: [
      {
        title: "Dashboard",
        path: "/admin/dashboard",
        permission: "bao-cao:read",
      },
      {
        title: "Báo cáo chi tiết",
        path: "/admin/bao-cao",
        permission: "bao-cao:read",
      },
      {
        title: "Xuất báo cáo",
        path: "/admin/xuat-bao-cao",
        permission: "bao-cao:export",
      },
    ],
  },
  {
    title: "Quản trị hệ thống",
    icon: "⚙️",
    role: "QUAN_TRI_VIEN", // Chỉ Admin mới thấy
    children: [
      {
        title: "Quản lý người dùng",
        path: "/admin/nguoi-dung",
        permission: "users:read",
      },
      {
        title: "Vai trò & Quyền hạn",
        path: "/admin/vai-tro",
        permission: "roles:read",
      },
      {
        title: "Sao lưu dữ liệu",
        path: "/admin/sao-luu",
        permission: "backup:read",
      },
      {
        title: "Cấu hình hệ thống",
        path: "/admin/cau-hinh",
        permission: "settings:read",
      },
    ],
  },
];

/**
 * Menu shortcuts cho các vai trò khác nhau
 */
export const ROLE_MENUS = {
  QUAN_TRI_VIEN: [
    // Admin có quyền full
    ...MENU_CONFIG,
  ],
  
  LANH_DAO: [
    // Lãnh đạo: Xem báo cáo, dashboard, không tạo/sửa/xóa
    {
      title: "Dashboard",
      path: "/admin",
      icon: "📊",
    },
    {
      title: "Xem đối tượng",
      path: "/admin/doi-tuong",
      icon: "👤",
      permission: "ho-so-doi-tuong:read",
    },
    {
      title: "Xem vụ việc",
      path: "/admin/vu-viec",
      icon: "📋",
      permission: "ho-so-vu-viec:read",
    },
    {
      title: "Tìm kiếm",
      path: "/admin/tim-kiem",
      icon: "🔍",
    },
    {
      title: "Báo cáo & Thống kê",
      icon: "📈",
      children: [
        {
          title: "Dashboard",
          path: "/admin/dashboard",
        },
        {
          title: "Báo cáo chi tiết",
          path: "/admin/bao-cao",
        },
        {
          title: "Xuất báo cáo",
          path: "/admin/xuat-bao-cao",
        },
      ],
    },
  ],
  
  CAN_BO_NGHIEP_VU: [
    // Cán bộ nghiệp vụ: CRUD đối tượng, vụ việc
    {
      title: "Dashboard",
      path: "/admin",
      icon: "📊",
    },
    {
      title: "Quản lý đối tượng",
      icon: "👤",
      children: [
        {
          title: "Danh sách đối tượng",
          path: "/admin/doi-tuong",
        },
        {
          title: "Thêm đối tượng",
          path: "/admin/doi-tuong/them-moi",
        },
      ],
    },
    {
      title: "Quản lý vụ việc",
      icon: "📋",
      children: [
        {
          title: "Danh sách vụ việc",
          path: "/admin/vu-viec",
        },
        {
          title: "Thêm vụ việc",
          path: "/admin/vu-viec/them-moi",
        },
      ],
    },
    {
      title: "Tìm kiếm",
      path: "/admin/tim-kiem",
      icon: "🔍",
    },
    {
      title: "Báo cáo",
      path: "/admin/bao-cao",
      icon: "📈",
    },
  ],
};
