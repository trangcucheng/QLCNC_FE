import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Conversation state
  currentConversation: null,
  messages: [],
  conversations: [],

  // UI state
  isLoading: false,
  isTyping: false,
  error: null,

  // Suggestions & FAQ
  suggestedQuestions: [],
  faqCategories: [],
  currentFAQ: [],

  // Search
  searchResults: [],
  searchLoading: false,

  // Settings
  settings: {
    autoSave: true,
    soundEnabled: false,
    theme: 'light',
  },
};

const chatbotSlice = createSlice({
  name: 'chatbot',
  initialState,
  reducers: {
    // Conversation reducers
    setCurrentConversation: (state, action) => {
      state.currentConversation = action.payload;
    },
    setConversations: (state, action) => {
      state.conversations = action.payload;
    },
    addConversation: (state, action) => {
      state.conversations.push(action.payload);
    },
    updateConversation: (state, action) => {
      const index = state.conversations.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) {
        state.conversations[index] = {
          ...state.conversations[index],
          ...action.payload,
        };
      }
    },
    removeConversation: (state, action) => {
      state.conversations = state.conversations.filter((c) => c.id !== action.payload);
    },

    // Message reducers
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    updateMessage: (state, action) => {
      const index = state.messages.findIndex((m) => m.id === action.payload.id);
      if (index !== -1) {
        state.messages[index] = {
          ...state.messages[index],
          ...action.payload,
        };
      }
    },
    removeMessage: (state, action) => {
      state.messages = state.messages.filter((m) => m.id !== action.payload);
    },
    clearMessages: (state) => {
      state.messages = [];
    },

    // Loading & Error reducers
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setTyping: (state, action) => {
      state.isTyping = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },

    // Suggestions & FAQ reducers
    setSuggestedQuestions: (state, action) => {
      state.suggestedQuestions = action.payload;
    },
    setFAQCategories: (state, action) => {
      state.faqCategories = action.payload;
    },
    setCurrentFAQ: (state, action) => {
      state.currentFAQ = action.payload;
    },

    // Search reducers
    setSearchResults: (state, action) => {
      state.searchResults = action.payload;
    },
    setSearchLoading: (state, action) => {
      state.searchLoading = action.payload;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },

    // Settings reducers
    updateSettings: (state, action) => {
      state.settings = {
        ...state.settings,
        ...action.payload,
      };
    },

    // Reset chatbot (keep settings)
    resetChatbot: (state) => {
      state.currentConversation = null;
      state.messages = [];
      state.isLoading = false;
      state.isTyping = false;
      state.error = null;
      state.suggestedQuestions = [];
      state.faqCategories = [];
      state.currentFAQ = [];
      state.searchResults = [];
      state.searchLoading = false;
      // settings are preserved
    },
  },
});

export const {
  setCurrentConversation,
  setConversations,
  addConversation,
  updateConversation,
  removeConversation,
  setMessages,
  addMessage,
  updateMessage,
  removeMessage,
  clearMessages,
  setLoading,
  setTyping,
  setError,
  clearError,
  setSuggestedQuestions,
  setFAQCategories,
  setCurrentFAQ,
  setSearchResults,
  setSearchLoading,
  clearSearchResults,
  updateSettings,
  resetChatbot,
} = chatbotSlice.actions;

// Selectors
export const selectCurrentConversation = (state) => state.chatbot.currentConversation;
export const selectMessages = (state) => state.chatbot.messages;
export const selectConversations = (state) => state.chatbot.conversations;
export const selectChatbotLoading = (state) => state.chatbot.isLoading;
export const selectChatbotTyping = (state) => state.chatbot.isTyping;
export const selectChatbotError = (state) => state.chatbot.error;
export const selectSuggestedQuestions = (state) => state.chatbot.suggestedQuestions;
export const selectFAQCategories = (state) => state.chatbot.faqCategories;
export const selectCurrentFAQ = (state) => state.chatbot.currentFAQ;
export const selectSearchResults = (state) => state.chatbot.searchResults;
export const selectSearchLoading = (state) => state.chatbot.searchLoading;
export const selectChatbotSettings = (state) => state.chatbot.settings;

export default chatbotSlice.reducer;
