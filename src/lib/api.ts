// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Helper function to get auth token
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
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
};

// ===== HỒ SƠ ĐỐI TƯỢNG =====

export const hoSoDoiTuongApi = {
  getAll: (params?: any) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest<any>(`/ho-so-doi-tuong?${query}`);
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
};

// ===== HỒ SƠ VỤ VIỆC =====

export const hoSoVuViecApi = {
  getAll: (params?: any) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest<any>(`/ho-so-vu-viec?${query}`);
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
    return apiRequest<any>(`/users?${query}`);
  },

  getById: (id: string) =>
    apiRequest<any>(`/users/${id}`),

  create: (data: any) =>
    apiRequest<any>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiRequest<any>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest<any>(`/users/${id}`, {
      method: 'DELETE',
    }),
};
