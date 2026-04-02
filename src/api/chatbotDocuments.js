import axios from 'axios';

// ===== Axios instance cho Chatbot API =====
const ChatbotAPI = axios.create({
  baseURL: process.env.NEXT_PUBLIC_CHATBOT_API || 'http://103.161.17.191:8001',
  timeout: 30000,
});

// Add auth token interceptor
ChatbotAPI.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      } catch (e) {
        console.error('Failed to parse userData from localStorage', e);
      }
    }
  }
  return config;
});

// ===== Hàm validate dữ liệu =====
export const validateDocumentData = (data, isUpdate = false) => {
  const errors = [];

  if (!data.name || data.name.trim() === '') {
    errors.push('Tên tài liệu là bắt buộc');
  }

  if (!isUpdate) {
    if (!data.file) {
      errors.push('Tệp PDF là bắt buộc khi tạo tài liệu');
    } else {
      if (data.file.type !== 'application/pdf') {
        errors.push('Chỉ chấp nhận tệp PDF');
      }
      if (data.file.size > 50 * 1024 * 1024) {
        errors.push('Kích thước tệp không vượt quá 50MB');
      }
    }
  }

  return errors;
};

// ===== Hàm upload với progress callback =====
export const uploadWithProgress = async (endpoint, formData, onProgress) => {
  try {
    const response = await ChatbotAPI.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Upload failed to ${endpoint}:`, error);
    throw error;
  }
};

// ===== CRUD functions =====

/**
 * GET /documents - Lấy danh sách tài liệu
 * @param {Object} params - Query parameters { page, pageSize, search, etc. }
 */
export const getChatbotDocuments = async (params = {}) => {
  try {
    const response = await ChatbotAPI.get('/documents', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch chatbot documents:', error);
    throw error;
  }
};

/**
 * POST /documents - Tạo tài liệu mới
 * @param {Object} documentData - { name: string, file: File }
 */
export const createChatbotDocument = async (documentData) => {
  try {
    const formData = new FormData();
    formData.append('name', documentData.name);
    if (documentData.file) {
      formData.append('file', documentData.file);
    }

    const response = await ChatbotAPI.post('/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to create chatbot document:', error);
    throw error;
  }
};

/**
 * GET /documents/:id - Lấy chi tiết tài liệu
 * @param {string} id - Document ID
 */
export const getChatbotDocumentById = async (id) => {
  try {
    const response = await ChatbotAPI.get(`/documents/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch chatbot document ${id}:`, error);
    throw error;
  }
};

/**
 * PUT /documents/:id - Cập nhật tài liệu (chỉ name)
 * @param {string} id - Document ID
 * @param {Object} data - { name: string }
 */
export const updateChatbotDocument = async (id, data) => {
  try {
    const response = await ChatbotAPI.put(`/documents/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Failed to update chatbot document ${id}:`, error);
    throw error;
  }
};

/**
 * DELETE /documents/:id - Xóa tài liệu
 * @param {string} id - Document ID
 */
export const deleteChatbotDocument = async (id) => {
  try {
    const response = await ChatbotAPI.delete(`/documents/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to delete chatbot document ${id}:`, error);
    throw error;
  }
};

/**
 * POST /documents/:id/process - Xử lý/parse tài liệu
 * @param {string} id - Document ID
 * @param {Object} opts - Options { document_id, ...other options }
 */
export const processChatbotDocument = async (id, opts = {}) => {
  try {
    const payload = {
      document_id: id,
      ...opts,
    };
    const response = await ChatbotAPI.post(`/documents/${id}/process`, payload);
    return response.data;
  } catch (error) {
    console.error(`Failed to process chatbot document ${id}:`, error);
    throw error;
  }
};

/**
 * GET /documents/:id/download - Download tài liệu
 * @param {string} id - Document ID
 * @param {string} fileName - File name for download
 */
export const downloadChatbotDocument = async (id, fileName = 'document.pdf') => {
  try {
    const response = await ChatbotAPI.get(`/documents/${id}/download`, {
      responseType: 'blob',
    });

    // Tạo link và trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error(`Failed to download chatbot document ${id}:`, error);
    throw error;
  }
};

export default ChatbotAPI;
