'use client';

import { Provider } from 'react-redux';
import { store } from '@/redux/store';
import dynamic from 'next/dynamic';

// Dynamic import ChatWidget to avoid SSR issues
const ChatWidget = dynamic(() => import('@/components/ChatWidget'), {
  ssr: false,
});

export function RootProvider({ children }) {
  return (
    <Provider store={store}>
      {children}
      <ChatWidget />
    </Provider>
  );
}
