"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { userNotificationApi } from "@/lib/api";

interface Notification {
  id: string;
  tieuDe: string;
  noiDung: string;
  loaiThongBao: string;
  uu_tien: number;
  ngayTao: string;
  daDoc: boolean;
  ngayDoc: string | null;
}

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Hàm lấy danh sách thông báo
  const fetchNotifications = async () => {
    try {
      const response = await userNotificationApi.getMyNotifications({ 
        page: 1, 
        pageSize: 10 
      });
      setNotifications(response.data);
    } catch (error) {
      console.error("Lỗi khi tải thông báo:", error);
    }
  };

  // Hàm lấy số lượng chưa đọc
  const fetchUnreadCount = async () => {
    try {
      const response = await userNotificationApi.getUnreadCount();
      setUnreadCount(response.unreadCount);
    } catch (error) {
      console.error("Lỗi khi tải số thông báo chưa đọc:", error);
    }
  };

  // Load dữ liệu khi component mount
  useEffect(() => {
    fetchUnreadCount();
    
    // Polling mỗi 30 giây để cập nhật số thông báo chưa đọc
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Load notifications khi mở dropdown
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  // Đánh dấu một thông báo là đã đọc
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await userNotificationApi.markAsRead(notificationId);
      // Cập nhật state local
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, daDoc: true, ngayDoc: new Date().toISOString() } 
            : n
        )
      );
      // Cập nhật số chưa đọc
      fetchUnreadCount();
    } catch (error) {
      console.error("Lỗi khi đánh dấu đã đọc:", error);
    }
  };

  // Đánh dấu tất cả là đã đọc
  const handleMarkAllAsRead = async () => {
    try {
      await userNotificationApi.markAllAsRead();
      // Cập nhật state local
      setNotifications(prev => 
        prev.map(n => ({ ...n, daDoc: true, ngayDoc: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Lỗi khi đánh dấu tất cả đã đọc:", error);
    }
  };

  // Format thời gian
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    
    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    
    return date.toLocaleDateString('vi-VN');
  };

  // Icon cho loại thông báo
  const getNotificationIcon = (loaiThongBao: string) => {
    switch (loaiThongBao) {
      case 'THONG_BAO':
        return '📢';
      case 'HUONG_DAN':
        return '📋';
      case 'QUY_DINH':
        return '⚖️';
      default:
        return '📌';
    }
  };

  const handleClick = () => {
    toggleDropdown();
  };

  return (
    <div className="relative">
      <button
        className="relative dropdown-toggle flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={handleClick}
      >
        {unreadCount > 0 && (
          <>
            <span className="absolute right-0 top-0.5 z-10 h-2 w-2 rounded-full bg-orange-400">
              <span className="absolute inline-flex w-full h-full bg-orange-400 rounded-full opacity-75 animate-ping"></span>
            </span>
            <span className="absolute -top-1 -right-1 z-20 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          </>
        )}
        <svg
          className="fill-current"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
            fill="currentColor"
          />
        </svg>
      </button>
      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute -right-[240px] mt-[17px] flex h-[480px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark sm:w-[361px] lg:right-0"
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-700">
          <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Thông báo {unreadCount > 0 && `(${unreadCount})`}
          </h5>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                title="Đánh dấu tất cả đã đọc"
              >
                Đọc hết
              </button>
            )}
            <button
              onClick={toggleDropdown}
              className="text-gray-500 transition dropdown-toggle dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <svg
                className="fill-current"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>
        </div>
        <ul className="flex flex-col h-auto overflow-y-auto custom-scrollbar">
          {loading ? (
            <li className="flex items-center justify-center p-8">
              <div className="text-gray-500 dark:text-gray-400">Đang tải...</div>
            </li>
          ) : notifications.length === 0 ? (
            <li className="flex items-center justify-center p-8">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <p className="mb-2 text-4xl">🔔</p>
                <p>Chưa có thông báo nào</p>
              </div>
            </li>
          ) : (
            notifications.map((notification) => (
              <li key={notification.id}>
                <div
                  onClick={() => {
                    if (!notification.daDoc) {
                      handleMarkAsRead(notification.id);
                    }
                  }}
                  className={`flex gap-3 rounded-lg border-b border-gray-100 p-3 px-4.5 py-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5 cursor-pointer transition-colors ${
                    !notification.daDoc ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                  }`}
                >
                  <span className="relative flex items-center justify-center w-10 h-10 text-2xl rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shrink-0">
                    {getNotificationIcon(notification.loaiThongBao)}
                  </span>

                  <span className="flex-1 block">
                    <span className="flex items-start justify-between mb-1.5">
                      <span className={`text-sm ${!notification.daDoc ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                        {notification.tieuDe}
                      </span>
                      {!notification.daDoc && (
                        <span className="w-2 h-2 ml-2 bg-blue-500 rounded-full shrink-0"></span>
                      )}
                    </span>
                    
                    <span className="block mb-2 text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                      {notification.noiDung}
                    </span>

                    <span className="flex items-center gap-2 text-gray-500 text-theme-xs dark:text-gray-400">
                      <span className="capitalize">{notification.loaiThongBao.toLowerCase().replace('_', ' ')}</span>
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      <span>{formatTime(notification.ngayTao)}</span>
                      {notification.uu_tien >= 3 && (
                        <>
                          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                          <span className="text-red-500">⚠️ Quan trọng</span>
                        </>
                      )}
                    </span>
                  </span>
                </div>
              </li>
            ))
          )}
        </ul>
        
        {notifications.length > 0 && (
          <div className="pt-3 mt-3 border-t border-gray-100 dark:border-gray-700">
            <Link
              href="/admin/thong-bao"
              onClick={closeDropdown}
              className="block w-full text-center py-2.5 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              Xem tất cả thông báo
            </Link>
          </div>
        )}
      </Dropdown>
    </div>
  );
}
