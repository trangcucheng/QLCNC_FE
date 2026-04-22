"use client";
import React, { useEffect, useRef, useState,useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../context/AuthContext";
import {
  BoxCubeIcon,
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PageIcon,
  PieChartIcon,
  PlugInIcon,
  TableIcon,
  UserCircleIcon,
  ChatIcon,
  DocsIcon,
  FileIcon,
} from "../icons/index";
import SidebarWidget from "./SidebarWidget";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  permission?: string | string[]; // Permissions required to view this menu
  subItems?: { 
    name: string; 
    path: string; 
    pro?: boolean; 
    new?: boolean;
    permission?: string | string[];
  }[];
};

const ALL_NAV_ITEMS: NavItem[] = [
  // US01, US12 - Dashboard & Tổng quan (All users)
  {
    icon: <GridIcon />,
    name: "Trang chủ",
    subItems: [{ name: "Tổng quan", path: "/admin/dashboard", pro: false }],
  },

  // US03 - Tìm kiếm thông tin (All users)
  {
    icon: <GridIcon />,
    name: "Tìm kiếm",
    path: "/admin/tim-kiem",
  },

  // US04, US14, US15 - Quản lý hồ sơ đối tượng (Lãnh đạo xem, Cán bộ CRUD)
  {
    name: "Quản lý Đối tượng",
    icon: <UserCircleIcon />,
    permission: "ho-so-doi-tuong:read",
    subItems: [
      { name: "Danh sách", path: "/admin/doi-tuong", pro: false, permission: "ho-so-doi-tuong:read" },
      { name: "Thêm mới", path: "/admin/doi-tuong/them-moi", pro: false, permission: "ho-so-doi-tuong:create" },
    ],
  },

  // US05, US09 - Quản lý hồ sơ vụ việc (Lãnh đạo xem, Cán bộ CRUD)
  {
    name: "Quản lý Vụ việc",
    icon: <ListIcon />,
    permission: "ho-so-vu-viec:read",
    subItems: [
      { name: "Danh sách", path: "/admin/vu-viec", pro: false, permission: "ho-so-vu-viec:read" },
      { name: "Thêm mới", path: "/admin/vu-viec/them-moi", pro: false, permission: "ho-so-vu-viec:create" },
    ],
  },

  // US06 - Quản lý tài liệu & chứng cứ
  {
    name: "Tài liệu & Chứng cứ",
    icon: <FileIcon />,
    permission: "tai-lieu:read",
    subItems: [
      { name: "Kho tài liệu", path: "/admin/tai-lieu", pro: false, permission: "tai-lieu:read" },
      { name: "Tải lên", path: "/admin/tai-lieu/them-moi", pro: false, permission: "tai-lieu:create" },
    ],
  },

  // US07, US16, US17, US18, US19 - Báo cáo & Thống kê
  {
    name: "Báo cáo & Thống kê",
    icon: <PieChartIcon />,
    permission: "bao-cao:read",
    subItems: [
      { name: "Thống kê tổng hợp", path: "/admin/bao-cao", pro: false, permission: "bao-cao:read" },
      { name: "Xuất báo cáo", path: "/admin/xuat-bao-cao", pro: false, permission: "bao-cao:export" },
    ],
  },

  // US08 - Chatbot hỗ trợ AI
  {
    icon: <ChatIcon />,
    name: "Chatbot",
    permission: "chatbot:read",
    subItems: [
      {
        name: "Quản lý Tài liệu",
        path: "/admin/chatbot-documents",
        pro: false,
        permission: "chatbot:manage",
      },
    ],
  },
];

const ALL_OTHERS_ITEMS: NavItem[] = [
  // US10 - Quản lý danh mục tội danh
  {
    icon: <TableIcon />,
    name: "Danh mục Tội danh",
    path: "/admin/toi-danh",
    permission: "toi-danh:read",
  },

  // Quan hệ xã hội
  {
    icon: <UserCircleIcon />,
    name: "Quan hệ xã hội",
    path: "/admin/quan-he-xa-hoi",
    permission: "quan-he-xa-hoi:read",
  },

  // US11 - Quản lý đơn vị hành chính
  {
    icon: <GridIcon />,
    name: "Đơn vị Hành chính",
    path: "/admin/don-vi",
    permission: "don-vi:read",
  },

  // Biểu mẫu
  {
    icon: <FileIcon />,
    name: "Biểu mẫu",
    path: "/admin/bieu-mau",
    permission: "bieu-mau:read",
  },

  // Thông báo
  {
    icon: <DocsIcon />,
    name: "Thông báo",
    path: "/admin/thong-bao",
    permission: "thong-bao:read",
  },

  // US02 - Quản lý tài khoản người dùng
  {
    icon: <UserCircleIcon />,
    name: "Quản lý Người dùng",
    permission: "VIEW_USER",
    subItems: [
      { name: "Danh sách người dùng", path: "/admin/nguoi-dung", pro: false, permission: "VIEW_USER" },
    ],
  },

  // US02 - Vai trò & Quyền hạn
  {
    icon: <PieChartIcon />,
    name: "Vai trò & Quyền hạn",
    path: "/admin/vai-tro",
    permission: "VIEW_ROLE",
  },

  // US20, US21 - Sao lưu & Phục hồi dữ liệu
  {
    icon: <FileIcon />,
    name: "Sao lưu Dữ liệu",
    path: "/admin/sao-luu",
    permission: "backup:read",
  },

  // Cấu hình hệ thống
  {
    icon: <PlugInIcon />,
    name: "Cấu hình Hệ thống",
    path: "/admin/cau-hinh",
    permission: "VIEW_CAU_HINH",
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const { hasPermission, isAdmin } = useAuth();

  // Filter menu items based on user permissions
  const filterMenuItems = useCallback((items: NavItem[]): NavItem[] => {
    return items
      .filter((item) => {
        // If no permission required, show to all users
        if (!item.permission) return true;
        
        // Admin sees everything
        if (isAdmin()) return true;
        
        // Check permission
        return hasPermission(item.permission);
      })
      .map((item) => {
        // Filter subitems if they exist
        if (item.subItems) {
          const filteredSubItems = item.subItems.filter((subItem) => {
            if (!subItem.permission) return true;
            if (isAdmin()) return true;
            return hasPermission(subItem.permission);
          });
          
          // Only show parent if it has visible subitems
          if (filteredSubItems.length === 0) return null;
          
          return {
            ...item,
            subItems: filteredSubItems,
          };
        }
        return item;
      })
      .filter((item): item is NavItem => item !== null);
  }, [hasPermission, isAdmin]);

  // Memoize filtered menu items
  const navItems = useMemo(() => filterMenuItems(ALL_NAV_ITEMS), [filterMenuItems]);
  const othersItems = useMemo(() => filterMenuItems(ALL_OTHERS_ITEMS), [filterMenuItems]);

  const renderMenuItems = (
    navItems: NavItem[],
    menuType: "main" | "others"
  ) => (
    <ul className="flex flex-col gap-2" style={{paddingLeft: "1rem"}}>
      {navItems.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group  ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={` ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className={`menu-item-text font-semibold`}>{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "menu-item-arrow-active"
                      : "menu-item-arrow-inactive"
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className={`menu-item-text font-semibold`}>{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="custom-ul mt-2 space-y-1 ml-4" style={{paddingLeft: "1rem"}}>
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      href={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge `}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge `}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = (path: string) => path === pathname;
   const isActive = useCallback((path: string) => path === pathname, [pathname]);

  useEffect(() => {
    // Check if the current path matches any submenu item
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    // If no submenu item matches, close the open submenu
    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [pathname, isActive, navItems, othersItems]);

  useEffect(() => {
    // Set the height of the submenu items when the submenu is opened
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-3 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 shadow-lg
        ${
          isExpanded || isMobileOpen
            ? "w-[280px]"
            : isHovered
            ? "w-[280px]"
            : "w-[80px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-6 flex px-2 ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link href="/" className="flex items-center gap-3">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <div className="relative w-10 h-10 flex-shrink-0">
                <Image
                  src="/images/logo/logoDN.jpg"
                  alt="Logo QLCNC"
                  fill
                  className="object-contain rounded-full"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-brand-600 dark:text-brand-400">
                  QLCNC
                </span>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Quản lý Tội phạm
                </span>
              </div>
            </>
          ) : (
            <div className="relative w-8 h-8">
              <Image
                src="/images/logo/logoDN.jpg"
                alt="Logo"
                fill
                className="object-contain rounded-full"
                priority
              />
            </div>
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-3">
            <div>
              {/* <h2
                className={`mb-3 text-xs font-bold uppercase flex leading-[20px] tracking-wider text-gray-500 dark:text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start px-2"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots />
                )}
              </h2> */}
              {renderMenuItems(navItems, "main")}
            </div>

            <div className="">
              {/* <h2
                className={`mb-3 text-xs font-bold uppercase flex leading-[20px] tracking-wider text-gray-500 dark:text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start px-2"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Quản lý hệ thống"
                ) : (
                  <HorizontaLDots />
                )}
              </h2> */}
              {renderMenuItems(othersItems, "others")}
            </div>
          </div>
        </nav>
        {/* {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null} */}
      </div>
    </aside>
  );
};

export default AppSidebar;
