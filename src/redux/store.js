import { configureStore } from '@reduxjs/toolkit';
import chatbotReducer from './chatbotSlice';

export const store = configureStore({
  reducer: {
    chatbot: chatbotReducer,
    // Thêm các reducer khác ở đây
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore non-serializable values trong Redux store
        ignoredActions: ['chatbot/setError'],
        ignoredPaths: ['chatbot.error'],
      },
    }),
});

export default store;
