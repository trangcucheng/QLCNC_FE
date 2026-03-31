import axios from 'axios';

const CHATBOT_BASE = process.env.NEXT_PUBLIC_CHATBOT_API || 'https://chatbot.justtuananh.io.vn';

// Internal API instance
const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  timeout: 30000,
});

// Add auth token interceptor
API.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      } catch (e) {
        console.error('Failed to parse userData', e);
      }
    }
  }
  return config;
});

// ===== Helper: Extract answer từ response =====
const extractAnswer = (res) => {
  if (!res) return 'Không có phản hồi từ chatbot';

  // Ưu tiên: answer > content > data.answer > data.content
  let answer =
    res.answer ||
    res.content ||
    (res.data && res.data.answer) ||
    (res.data && res.data.content) ||
    null;

  if (answer) {
    // Nếu là object, JSON.stringify
    if (typeof answer === 'object') {
      return JSON.stringify(answer, null, 2);
    }
    return String(answer);
  }

  return 'Không thể trích xuất câu trả lời';
};

// ===== External Chatbot API (native fetch) =====

/**
 * Hỏi chatbot (single request/response)
 * @param {string} question - Câu hỏi
 * @param {Object} opts - { stream=false, paramKey='question' }
 */
export const askChatbot = async (question, opts = {}) => {
  const { stream = false, paramKey = 'question' } = opts;

  try {
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev) {
      console.debug('[askChatbot] Calling:', `${CHATBOT_BASE}/chatbot`, {
        [paramKey]: question,
        stream,
      });
    }

    const response = await fetch(`${CHATBOT_BASE}/chatbot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        [paramKey]: question,
        stream,
      }),
    });

    if (!response.ok) {
      throw new Error(`Chatbot API error: ${response.status} ${response.statusText}`);
    }

    // Auto-detect content type
    const contentType = response.headers.get('content-type') || '';
    let data;

    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // Treat as plaintext
      const text = await response.text();
      data = { content: text };
    }

    if (isDev) {
      console.debug('[askChatbot] Response:', data);
    }

    return data;
  } catch (error) {
    console.error('[askChatbot] Error:', error);
    throw error;
  }
};

/**
 * Hỏi chatbot với streaming
 * @param {string} question - Câu hỏi
 * @param {Object} opts - { paramKey='question', onToken(accum, delta), abortSignal }
 * @returns {Promise<string>} - Chuỗi full trả lời
 */
export const askChatbotStream = async (question, opts = {}) => {
  const { paramKey = 'question', onToken, abortSignal } = opts;

  try {
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev) {
      console.debug('[askChatbotStream] Calling:', `${CHATBOT_BASE}/chatbot`, {
        [paramKey]: question,
        stream: true,
      });
    }

    const response = await fetch(`${CHATBOT_BASE}/chatbot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        [paramKey]: question,
        stream: true,
      }),
      signal: abortSignal,
    });

    if (!response.ok) {
      throw new Error(`Chatbot API error: ${response.status} ${response.statusText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let accum = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const delta = decoder.decode(value, { stream: true });
      accum += delta;

      if (onToken) {
        onToken(accum, delta);
      }
    }

    if (isDev) {
      console.debug('[askChatbotStream] Final accumulated:', accum);
    }

    return accum;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('[askChatbotStream] Stream aborted');
      return '';
    }
    console.error('[askChatbotStream] Error:', error);
    throw error;
  }
};

// ===== Internal Backend API (via axios) =====

/**
 * Gửi tin nhắn chat
 */
export const sendChatMessage = async (conversationId, message) => {
  try {
    const response = await API.post(`/chat/messages`, {
      conversationId,
      message,
    });
    return response.data;
  } catch (error) {
    console.error('Failed to send chat message:', error);
    throw error;
  }
};

/**
 * Lấy lịch sử chat
 */
export const getChatHistory = async (conversationId, params = {}) => {
  try {
    const response = await API.get(`/chat/conversations/${conversationId}/messages`, {
      params,
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch chat history:', error);
    throw error;
  }
};

/**
 * Tạo cuộc hội thoại mới
 */
export const createConversation = async (data = {}) => {
  try {
    const response = await API.post('/chat/conversations', data);
    return response.data;
  } catch (error) {
    console.error('Failed to create conversation:', error);
    throw error;
  }
};

/**
 * Lấy danh sách cuộc hội thoại
 */
export const getConversations = async (params = {}) => {
  try {
    const response = await API.get('/chat/conversations', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch conversations:', error);
    throw error;
  }
};

/**
 * Xóa cuộc hội thoại
 */
export const deleteConversation = async (conversationId) => {
  try {
    const response = await API.delete(`/chat/conversations/${conversationId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete conversation:', error);
    throw error;
  }
};

/**
 * Cập nhật tiêu đề cuộc hội thoại
 */
export const updateConversationTitle = async (conversationId, title) => {
  try {
    const response = await API.put(`/chat/conversations/${conversationId}`, { title });
    return response.data;
  } catch (error) {
    console.error('Failed to update conversation title:', error);
    throw error;
  }
};

/**
 * Lấy câu hỏi gợi ý
 */
export const getSuggestedQuestions = async () => {
  try {
    const response = await API.get('/chat/suggestions');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch suggested questions:', error);
    throw error;
  }
};

/**
 * Tìm kiếm cơ sở kiến thức
 */
export const searchKnowledgeBase = async (query, params = {}) => {
  try {
    const response = await API.get('/chat/search', {
      params: { ...params, q: query },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to search knowledge base:', error);
    throw error;
  }
};

/**
 * Đánh giá phản hồi chat
 */
export const rateChatResponse = async (messageId, rating) => {
  try {
    const response = await API.post(`/chat/messages/${messageId}/rate`, { rating });
    return response.data;
  } catch (error) {
    console.error('Failed to rate chat response:', error);
    throw error;
  }
};

/**
 * Lấy danh mục FAQ
 */
export const getFAQCategories = async () => {
  try {
    const response = await API.get('/chat/faq/categories');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch FAQ categories:', error);
    throw error;
  }
};

/**
 * Lấy FAQ theo danh mục
 */
export const getFAQByCategory = async (categoryId) => {
  try {
    const response = await API.get(`/chat/faq/categories/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch FAQ by category:', error);
    throw error;
  }
};

export { extractAnswer };
export default { askChatbot, askChatbotStream };
