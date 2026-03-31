// src/utils/chatbot.js - Utility functions for chatbot

/**
 * Format bytes to human readable format
 */
export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Check if user is logged in
 */
export const isUserLoggedIn = () => {
  if (typeof window === 'undefined') return false;
  try {
    const userData = localStorage.getItem('userData');
    return !!userData;
  } catch {
    return false;
  }
};

/**
 * Get user data from localStorage
 */
export const getUserData = () => {
  if (typeof window === 'undefined') return null;
  try {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
};

/**
 * Check if user has permission to use chatbot
 */
export const canUseChatbot = () => {
  const user = getUserData();
  // Assume all logged-in users can use chatbot
  // Or implement specific permission check
  return !!user;
};

/**
 * Dispatch custom event for auth state change
 */
export const dispatchAuthStateChanged = () => {
  if (typeof window !== 'undefined') {
    const event = new Event('authStateChanged');
    window.dispatchEvent(event);
  }
};

/**
 * Generate unique ID
 */
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Format date to Vietnamese locale
 */
export const formatDate = (date, includeTime = false) => {
  if (!date) return '';
  const d = new Date(date);
  if (includeTime) {
    return d.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  return d.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

/**
 * Sanitize HTML string
 */
export const sanitizeHTML = (html) => {
  if (typeof window === 'undefined') return html;
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
};

/**
 * Format chat message
 */
export const formatChatMessage = (message) => {
  if (!message) return '';

  let text = String(message);

  // Add newline after ':' if not present
  text = text.replace(/([^\n]):([^\n])/g, '$1:\n$2');

  // Add newline before numbered list items
  text = text.replace(/([^\n])(\n)?(\d+\.)/g, '$1\n$3');

  // Add newline before bullets
  text = text.replace(/([^\n])([-*])/g, '$1\n$2');

  // Normalize multiple newlines to max 2
  text = text.replace(/\n{3,}/g, '\n\n');

  return text;
};

/**
 * Extract answer from chatbot response
 */
export const extractAnswerFromResponse = (response) => {
  if (!response) return '';

  const answer =
    response.answer ||
    response.content ||
    (response.data && response.data.answer) ||
    (response.data && response.data.content) ||
    '';

  if (typeof answer === 'object') {
    return JSON.stringify(answer, null, 2);
  }

  return String(answer);
};
