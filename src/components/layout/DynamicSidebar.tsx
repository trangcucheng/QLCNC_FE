"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { MENU_CONFIG, ROLE_MENUS, MenuItem } from "@/config/menu.config";

export function DynamicSidebar() {
  const pathname = usePathname();
  const { user, hasPermission, hasRole, logout } = useAuth();
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  // Debug: Log MENU_CONFIG khi component mount
  useEffect(() => {
    console.log('🔍 DEBUG: MENU_CONFIG loaded:', MENU_CONFIG);
    console.log('🔍 DEBUG: Current user:', user);
    if (user) {
      console.log('🔍 DEBUG: User permissions:', user.permissions);
      console.log('🔍 DEBUG: User roles:', user.roles);
    }
  }, [user]);

  if (!user) return null;

  // Lấy menu theo loại người dùng
  const getMenuForUser = (): MenuItem[] => {
    // Nếu có role-based menus được định nghĩa sẵn, dùng nó
    if (user.loaiNguoiDung in ROLE_MENUS) {
      const roleMenu = ROLE_MENUS[user.loaiNguoiDung as keyof typeof ROLE_MENUS];
      console.log('🔍 DEBUG: Role Menu for', user.loaiNguoiDung, roleMenu);
      return roleMenu;
    }
    
    // Nếu không, filter từ MENU_CONFIG dựa trên permissions
    const filtered = filterMenuByPermissions(MENU_CONFIG);
    console.log('🔍 DEBUG: Filtered Menu', filtered);
    return filtered;
  };

  // Filter menu items dựa trên permissions và roles
  const filterMenuByPermissions = (items: MenuItem[]): MenuItem[] => {
    return items.filter((item) => {
      console.log(`🔍 Checking menu item: ${item.title}`, {
        hasRole: item.role ? hasRole(item.role) : 'N/A',
        hasPermission: item.permission ? hasPermission(item.permission) : 'N/A',
        requiredRole: item.role,
        requiredPermission: item.permission
      });

      // Check role requirement
      if (item.role && !hasRole(item.role)) {
        console.log(`❌ Filtered out ${item.title} - missing role ${item.role}`);
        return false;
      }

      // Check permission requirement
      if (item.permission && !hasPermission(item.permission)) {
        console.log(`❌ Filtered out ${item.title} - missing permission ${item.permission}`);
        return false;
      }

      // Nếu có children, filter children
      if (item.children) {
        item.children = filterMenuByPermissions(item.children);
        // Chỉ hiển thị menu cha nếu có ít nhất 1 children sau khi filter
        const hasVisibleChildren = item.children.length > 0;
        if (!hasVisibleChildren) {
          console.log(`❌ Filtered out ${item.title} - no visible children`);
        }
        return hasVisibleChildren;
      }

      console.log(`✅ Showing ${item.title}`);
      return true;
    });
  };

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) =>
      prev.includes(title)
        ? prev.filter((t) => t !== title)
        : [...prev, title]
    );
  };

  const isActive = (path?: string) => {
    if (!path) return false;
    return pathname === path;
  };

  const menuItems = getMenuForUser();

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen fixed left-0 top-0 overflow-y-auto">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          QLCNC
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {user.hoTen}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500">
          {user.loaiNguoiDung === "QUAN_TRI_VIEN"
            ? "Quản trị viên"
            : user.loaiNguoiDung === "LANH_DAO"
            ? "Lãnh đạo"
            : "Cán bộ nghiệp vụ"}
        </p>
      </div>

      {/* Menu Items */}
      <nav className="p-4">
        <div className="space-y-2">
          {menuItems.map((item) => (
            <MenuItem
              key={item.title}
              item={item}
              pathname={pathname}
              openMenus={openMenus}
              toggleMenu={toggleMenu}
              isActive={isActive}
            />
          ))}
        </div>
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800">
        <button
          onClick={logout}
          className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
        >
          🚪 Đăng xuất
        </button>
      </div>
    </aside>
  );
}

// Menu Item Component
function MenuItem({
  item,
  pathname,
  openMenus,
  toggleMenu,
  isActive,
}: {
  item: MenuItem;
  pathname: string;
  openMenus: string[];
  toggleMenu: (title: string) => void;
  isActive: (path?: string) => boolean;
}) {
  const hasChildren = item.children && item.children.length > 0;
  const isOpen = openMenus.includes(item.title);

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => toggleMenu(item.title)}
          className="w-full flex items-center justify-between px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-left"
        >
          <span className="flex items-center gap-2">
            {item.icon && <span>{item.icon}</span>}
            <span className="font-medium">{item.title}</span>
          </span>
          <span className={`transform transition-transform ${isOpen ? "rotate-90" : ""}`}>
            ▶
          </span>
        </button>
        {isOpen && (
          <div className="ml-6 mt-1 space-y-1">
            {item.children.map((child) => (
              <Link
                key={child.title}
                href={child.path || "#"}
                className={`block px-4 py-2 text-sm rounded-lg transition-colors ${
                  isActive(child.path)
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {child.title}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.path || "#"}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
        isActive(item.path)
          ? "bg-blue-600 text-white font-medium"
          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
      }`}
    >
      {item.icon && <span>{item.icon}</span>}
      <span className="font-medium">{item.title}</span>
      {item.badge && (
        <span className="ml-auto px-2 py-1 bg-red-500 text-white text-xs rounded-full">
          {item.badge}
        </span>
      )}
    </Link>
  );
}
