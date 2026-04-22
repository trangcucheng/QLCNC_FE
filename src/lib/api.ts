// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6061';

// Helper to get full image URL
export const getImageUrl = (path: string) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_BASE_URL}${path}`;
};

// Helper function to get auth token
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
};

// Helper function to filter out empty params
const filterEmptyParams = (params?: any): Record<string, any> => {
  if (!params) return {};
  return Object.entries(params).reduce((acc, [key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, any>);
};

// Helper function to build query string
const buildQueryString = (params?: any): string => {
  const filtered = filterEmptyParams(params);
  const query = new URLSearchParams(filtered).toString();
  return query ? `?${query}` : '';
};

// Helper function to build headers
const buildHeaders = (includeAuth: boolean = true) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  includeAuth: boolean = true
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = buildHeaders(includeAuth);

  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// ===== AUTHENTICATION =====

export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    apiRequest<{ statusCode: number; message: string; data: { access_token: string; user: any } }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(credentials),
      },
      false
    ),

  logout: () =>
    apiRequest('/auth/logout', {
      method: 'POST',
    }),

  getProfile: () =>
    apiRequest<{ statusCode: number; message: string; data: any }>('/auth/profile'),

  updateProfile: (data: {
    hoTen?: string;
    email?: string;
    soDienThoai?: string;
    currentPassword?: string;
    newPassword?: string;
  }) =>
    apiRequest<{ status: string; statusCode: number; message: string; data: any }>(
      '/auth/profile',
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    ),
};

// ===== HỒ SƠ ĐỐI TƯỢNG =====

export const hoSoDoiTuongApi = {
  getAll: (params?: any) => {
    return apiRequest<any>(`/ho-so-doi-tuong${buildQueryString(params)}`);
  },

  getById: (id: string) =>
    apiRequest<any>(`/ho-so-doi-tuong/${id}`),

  getOne: (id: string) =>
    apiRequest<any>(`/ho-so-doi-tuong/${id}`),

  create: (data: any) =>
    apiRequest<any>('/ho-so-doi-tuong', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiRequest<any>(`/ho-so-doi-tuong/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest<any>(`/ho-so-doi-tuong/${id}`, {
      method: 'DELETE',
    }),

  thongKeKhuVuc: () =>
    apiRequest<any>('/ho-so-doi-tuong/thong-ke/khu-vuc'),

  thongKeTrangThai: () =>
    apiRequest<any>('/ho-so-doi-tuong/thong-ke/trang-thai'),

  uploadAnh: async (id: string, files: File[]) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const response = await fetch(`${API_BASE_URL}/ho-so-doi-tuong/${id}/upload-anh`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },
};

// ===== HỒ SƠ VỤ VIỆC =====

export const hoSoVuViecApi = {
  getAll: (params?: any) => {
    return apiRequest<any>(`/ho-so-vu-viec${buildQueryString(params)}`);
  },

  getById: (id: string) =>
    apiRequest<any>(`/ho-so-vu-viec/${id}`),

  getOne: (id: string) =>
    apiRequest<any>(`/ho-so-vu-viec/${id}`),

  create: (data: any) =>
    apiRequest<any>('/ho-so-vu-viec', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiRequest<any>(`/ho-so-vu-viec/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  updateTrangThai: (id: string, data: any) =>
    apiRequest<any>(`/ho-so-vu-viec/${id}/trang-thai`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  updateStatus: (id: string, data: any) =>
    apiRequest<any>(`/ho-so-vu-viec/${id}/trang-thai`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest<any>(`/ho-so-vu-viec/${id}`, {
      method: 'DELETE',
    }),

  thongKeMucDo: () =>
    apiRequest<any>('/ho-so-vu-viec/thong-ke/muc-do'),

  thongKeTrangThai: () =>
    apiRequest<any>('/ho-so-vu-viec/thong-ke/trang-thai'),

  thongKeKhuVuc: () =>
    apiRequest<any>('/ho-so-vu-viec/thong-ke/khu-vuc'),

  thongKeToimDanh: () =>
    apiRequest<any>('/ho-so-vu-viec/thong-ke/toim-danh'),
};

// ===== TÀI LIỆU =====

export const taiLieuApi = {
  uploadDoiTuong: async (hoSoDoiTuongId: string, file: File, loaiTaiLieu: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('hoSoDoiTuongId', hoSoDoiTuongId);
    formData.append('loaiTaiLieu', loaiTaiLieu);
    
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/tai-lieu/doi-tuong`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return response.json();
  },

  getByDoiTuong: (doiTuongId: string) =>
    apiRequest<any>(`/tai-lieu/doi-tuong/${doiTuongId}`),

  deleteDoiTuong: (id: string) =>
    apiRequest<any>(`/tai-lieu/doi-tuong/${id}`, {
      method: 'DELETE',
    }),

  uploadVuViec: async (hoSoVuViecId: string, file: File, loaiTaiLieu: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('hoSoVuViecId', hoSoVuViecId);
    formData.append('loaiTaiLieu', loaiTaiLieu);
    
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/tai-lieu/vu-viec`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return response.json();
  },

  getByVuViec: (vuViecId: string) =>
    apiRequest<any>(`/tai-lieu/vu-viec/${vuViecId}`),

  deleteVuViec: (id: string) =>
    apiRequest<any>(`/tai-lieu/vu-viec/${id}`, {
      method: 'DELETE',
    }),

  delete: (id: string) =>
    apiRequest<any>(`/tai-lieu/${id}`, {
      method: 'DELETE',
    }),

  thongKe: () =>
    apiRequest<any>('/tai-lieu/thong-ke'),
};

// ===== BÁO CÁO =====

export const baoCaoApi = {
  getDashboard: (params?: any) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest<any>(`/bao-cao/dashboard?${query}`);
  },

  baoCaoKhuVuc: (params?: any) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest<any>(`/bao-cao/khu-vuc?${query}`);
  },

  baoCaoToimDanh: (params?: any) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest<any>(`/bao-cao/toim-danh?${query}`);
  },

  baoCaoXuHuong: (params?: any) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest<any>(`/bao-cao/xu-huong?${query}`);
  },

  baoCaoTienDo: (params?: any) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest<any>(`/bao-cao/tien-do?${query}`);
  },

  baoCaoTongHop: (params?: any) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest<any>(`/bao-cao/tong-hop?${query}`);
  },

  // Export APIs - Download file directly
  exportExcel: (params?: any) => {
    const query = params ? new URLSearchParams(params).toString() : '';
    const token = localStorage.getItem('access_token');
    const url = `${API_BASE_URL}/bao-cao/export/excel?${query}`;
    
    // Create a hidden link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `bao-cao-${Date.now()}.xlsx`);
    
    // Add authorization header via fetch and create blob
    return fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) throw new Error('Export failed');
        return response.blob();
      })
      .then((blob) => {
        const blobUrl = window.URL.createObjectURL(blob);
        link.href = blobUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      });
  },

  exportPDF: (params?: any) => {
    const query = params ? new URLSearchParams(params).toString() : '';
    const token = localStorage.getItem('access_token');
    const url = `${API_BASE_URL}/bao-cao/export/pdf?${query}`;
    
    return fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) throw new Error('Export failed');
        return response.blob();
      })
      .then((blob) => {
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.setAttribute('download', `bao-cao-${Date.now()}.pdf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      });
  },

  exportWord: (params?: any) => {
    const query = params ? new URLSearchParams(params).toString() : '';
    const token = localStorage.getItem('access_token');
    const url = `${API_BASE_URL}/bao-cao/export/word?${query}`;
    
    return fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) throw new Error('Export failed');
        return response.blob();
      })
      .then((blob) => {
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.setAttribute('download', `bao-cao-${Date.now()}.docx`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      });
  },
};

// ===== DANH MỤC =====

export const danhMucApi = {
  getDonViHanhChinh: (params?: any) => {
    const query = params ? new URLSearchParams(params).toString() : '';
    return apiRequest<any>(`/don-vi-hanh-chinh?${query}`);
  },

  getToimDanh: (params?: any) => {
    const query = params ? new URLSearchParams(params).toString() : '';
    return apiRequest<any>(`/toim-danh?${query}`);
  },

  getQuanHeXaHoi: () =>
    apiRequest<any>('/quan-he-xa-hoi'),

  getThongBao: (params?: any) => {
    const query = params ? new URLSearchParams(params).toString() : '';
    return apiRequest<any>(`/thong-bao?${query}`);
  },
};

// ===== NGƯỜI DÙNG =====

export const nguoiDungApi = {
  getAll: (params?: any) => {
    const query = params ? new URLSearchParams(params).toString() : '';
    return apiRequest<any>(`/users/list-all-user${query ? '?' + query : ''}`);
  },

  getById: (id: string) =>
    apiRequest<any>(`/users/detail-user?userId=${id}`),

  create: (data: any) =>
    apiRequest<any>('/users/create-user', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiRequest<any>(`/users/update-user?userId=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest<any>(`/users/delete-user?userId=${id}`, {
      method: 'DELETE',
    }),
};

// ===== TỘI DANH =====

export const toimDanhApi = {
  getAll: (params?: any) => {
    const query = params ? new URLSearchParams(params).toString() : '';
    return apiRequest<{ data: any[]; total: number }>(`/toim-danh/list-all?${query}`);
  },

  getById: (id: string) =>
    apiRequest<any>(`/toim-danh/${id}`),

  create: (data: any) =>
    apiRequest<any>('/toim-danh/create', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiRequest<any>(`/toim-danh/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest<any>(`/toim-danh/${id}`, {
      method: 'DELETE',
    }),
};

// ===== QUAN HỆ XÃ HỘI =====

export const quanHeXaHoiApi = {
  getAll: (params?: any) => {
    const query = params ? new URLSearchParams(params).toString() : '';
    return apiRequest<{ data: any[]; total: number }>(`/quan-he-xa-hoi/list-all?${query}`);
  },

  getById: (id: string) =>
    apiRequest<any>(`/quan-he-xa-hoi/${id}`),

  create: (data: any) =>
    apiRequest<any>('/quan-he-xa-hoi/create', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiRequest<any>(`/quan-he-xa-hoi/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest<any>(`/quan-he-xa-hoi/${id}`, {
      method: 'DELETE',
    }),
};

// ===== ĐƠN VỊ HÀNH CHÍNH =====

export const donViHanhChinhApi = {
  getAll: (params?: any) => {
    const query = params ? new URLSearchParams(params).toString() : '';
    return apiRequest<{ data: any[]; total: number }>(`/don-vi-hanh-chinh/list-all?${query}`);
  },

  getTree: (params?: any) => {
    const query = params ? new URLSearchParams(params).toString() : '';
    return apiRequest<any[]>(`/don-vi-hanh-chinh/tree?${query}`);
  },

  getTinhThanhPho: (params?: any) => {
    const query = params ? new URLSearchParams(params).toString() : '';
    return apiRequest<{ data: any[]; total: number }>(`/don-vi-hanh-chinh/tinh-thanh-pho?${query}`);
  },

  getById: (id: string) =>
    apiRequest<any>(`/don-vi-hanh-chinh/${id}`),

  create: (data: any) =>
    apiRequest<any>('/don-vi-hanh-chinh', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiRequest<any>(`/don-vi-hanh-chinh/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest<any>(`/don-vi-hanh-chinh/${id}`, {
      method: 'DELETE',
    }),
};

// ===== VAI TRÒ =====

export const rolesApi = {
  getAll: (params?: any) => {
    const query = params ? new URLSearchParams(params).toString() : '';
    return apiRequest<any[]>(`/roles/list-all-role?${query}`);
  },

  getById: (id: string) =>
    apiRequest<any>(`/roles/detail-role?roleId=${id}`),

  create: (data: any) =>
    apiRequest<any>('/roles/create-role', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiRequest<any>(`/roles/update-role?roleId=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest<any>(`/roles/delete-role?roleId=${id}`, {
      method: 'DELETE',
    }),

  // Lấy danh sách permissions của vai trò
  getPermissions: (roleId: string) =>
    apiRequest<any[]>(`/roles/${roleId}/permissions`),

  // Gán permissions cho vai trò
  assignPermissions: (roleId: string, permissionIds: string[]) =>
    apiRequest<any>(`/roles/${roleId}/permissions`, {
      method: 'POST',
      body: JSON.stringify({ permissionIds }),
    }),
};

// ===== QUYỀN =====

export const permissionsApi = {
  getAll: (params?: any) => {
    const query = params ? new URLSearchParams(params).toString() : '';
    return apiRequest<any[]>(`/permissions/list-all-permission?${query}`);
  },
};

// ===== CẤU HÌNH HỆ THỐNG =====

export const cauHinhApi = {
  getAll: (params?: any) => {
    const query = params ? new URLSearchParams(params).toString() : '';
    return apiRequest<{ data: any[]; total: number }>(`/cau-hinh/list-all?${query}`);
  },

  getAsObject: () =>
    apiRequest<any>('/cau-hinh/as-object'),

  getByKey: (key: string) =>
    apiRequest<any>(`/cau-hinh/by-key/${key}`),

  create: (data: any) =>
    apiRequest<any>('/cau-hinh/create', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiRequest<any>(`/cau-hinh/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  updateMultiple: (data: any) =>
    apiRequest<any>('/cau-hinh/update-multiple', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  initialize: () =>
    apiRequest<any>('/cau-hinh/initialize', {
      method: 'POST',
    }),

  delete: (id: string) =>
    apiRequest<any>(`/cau-hinh/${id}`, {
      method: 'DELETE',
    }),
};

// ===== BACKUP =====

export const backupApi = {
  list: () =>
    apiRequest<{ statusCode: number; message: string; data: any[]; total: number }>('/backup/list'),

  manual: () =>
    apiRequest<{ statusCode: number; message: string; data: any }>('/backup/manual', {
      method: 'POST',
    }),

  restore: (backupFileName: string) =>
    apiRequest<{ statusCode: number; message: string; data: any }>('/backup/restore', {
      method: 'POST',
      body: JSON.stringify({ backupFileName }),
    }),
};

// ===== BIỂU MẪU =====

export const bieuMauApi = {
  getAll: (params?: any) => {
    const query = params ? new URLSearchParams(params).toString() : '';
    return apiRequest<{ data: any[]; total: number }>(`/bieu-mau/list-all?${query}`);
  },

  getById: (id: string) =>
    apiRequest<any>(`/bieu-mau/${id}`),

  create: (data: any) =>
    apiRequest<any>('/bieu-mau/create', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiRequest<any>(`/bieu-mau/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest<any>(`/bieu-mau/${id}`, {
      method: 'DELETE',
    }),
};

// ===== THÔNG BÁO =====

export const thongBaoApi = {
  getAll: (params?: any) => {
    const query = params ? new URLSearchParams(params).toString() : '';
    return apiRequest<{ data: any[]; total: number }>(`/thong-bao/list-all?${query}`);
  },

  getById: (id: string) =>
    apiRequest<any>(`/thong-bao/${id}`),

  create: (data: any) =>
    apiRequest<any>('/thong-bao/create', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiRequest<any>(`/thong-bao/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  toggleStatus: (id: string) =>
    apiRequest<any>(`/thong-bao/${id}/toggle-status`, {
      method: 'PATCH',
    }),

  delete: (id: string) =>
    apiRequest<any>(`/thong-bao/${id}`, {
      method: 'DELETE',
    }),
};

// ===== USER NOTIFICATIONS =====

export const userNotificationApi = {
  // Lấy danh sách thông báo của user hiện tại
  getMyNotifications: (params?: { page?: number; pageSize?: number }) => {
    const query = params ? new URLSearchParams(params as any).toString() : '';
    return apiRequest<{
      data: Array<{
        id: string;
        tieuDe: string;
        noiDung: string;
        loaiThongBao: string;
        uu_tien: number;
        ngayTao: string;
        daDoc: boolean;
        ngayDoc: string | null;
      }>;
      total: number;
    }>(`/user-notifications/my-notifications?${query}`);
  },

  // Đếm số thông báo chưa đọc
  getUnreadCount: () =>
    apiRequest<{ unreadCount: number; totalCount: number }>(
      '/user-notifications/unread-count'
    ),

  // Đánh dấu 1 thông báo là đã đọc
  markAsRead: (id: string) =>
    apiRequest<any>(`/user-notifications/${id}/mark-as-read`, {
      method: 'PATCH',
    }),

  // Đánh dấu tất cả thông báo là đã đọc
  markAllAsRead: () =>
    apiRequest<any>('/user-notifications/mark-all-as-read', {
      method: 'PATCH',
    }),
};

// ===== ĐƠN VỊ TỔ CHỨC =====

export const donViApi = {
  getAll: (params?: any) => {
    const query = params ? new URLSearchParams(params).toString() : '';
    return apiRequest<any[]>(`/units/list-all-unit?${query}`);
  },

  getTree: (params?: any) => {
    const query = params ? new URLSearchParams(params).toString() : '';
    return apiRequest<any[]>(`/units/list-tree-unit?${query}`);
  },

  getById: (id: string) =>
    apiRequest<any>(`/units/${id}`),

  create: (data: any) =>
    apiRequest<any>('/units/create-unit', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiRequest<any>(`/units/update-unit/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (unitId: string) =>
    apiRequest<any>(`/units/delete-unit?unitId=${unitId}`, {
      method: 'DELETE',
    }),
};
