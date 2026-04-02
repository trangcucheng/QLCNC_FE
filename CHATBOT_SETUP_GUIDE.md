# Hướng dẫn tích hợp Chatbot AI

## 📋 Tổng quan

Hệ thống Chatbot AI đã được tích hợp đầy đủ với các tính năng:

- **ChatWidget**: Bubble nổi có thể kéo thả, panel chat modal với streaming
- **DocumentManagement**: Trang quản lý tài liệu PDF cho chatbot
- **Redux State Management**: Quản lý trạng thái chatbot
- **API Integration**: Kết nối với Chatbot API ngoài

## 🚀 Quick Start

### 1. Cài đặt Dependencies

Dependencies đã được thêm vào `package.json`. Cài đặt:

```bash
npm install
```

Hoặc nếu dùng yarn:

```bash
yarn install
```

### 2. Cấu hình Environment

Kiểm tra `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:6061
NEXT_PUBLIC_CHATBOT_API=http://103.161.17.191:8001
```

Cập nhật URL theo môi trường của bạn.

### 3. Sử dụng ChatWidget trong Layout

ChatWidget đã được tích hợp sẵn vào trong layout thông qua Redux Provider.

Nếu bạn muốn thêm ChatWidget vào một page cụ thể, thêm import:

```jsx
'use client';

import ChatWidget from '@/components/ChatWidget';

export default function MyPage() {
  return (
    <div>
      <ChatWidget />
      {/* Nội dung trang */}
    </div>
  );
}
```

### 4. Truy cập Trang Quản lý Tài liệu

Trang quản lý tài liệu Chatbot tại:

```
/chatbot-documents
```

Tính năng:
- Xem danh sách tài liệu
- Thêm tài liệu mới (upload PDF)
- Sửa tên tài liệu
- Xóa tài liệu
- Tải xuống tài liệu
- Xử lý tài liệu (parse PDF)
- Xem chi tiết tài liệu

## 📁 Cấu trúc Thư mục

```
src/
├── api/
│   ├── chatbot.js              # API cho chatbot QA
│   └── chatbotDocuments.js     # API quản lý tài liệu
├── components/
│   ├── ChatWidget/
│   │   ├── index.js            # Component ChatWidget chính
│   │   └── ChatWidget.module.css # Styling
│   └── DocumentManagement/
│       ├── index.js            # Trang quản lý tài liệu
│       └── DocumentManagement.module.css
├── redux/
│   ├── chatbotSlice.js         # Redux slice
│   └── store.js                # Redux store
├── utils/
│   └── chatbot.js              # Utility functions
└── app/
    ├── RootProvider.jsx        # Redux Provider wrapper
    ├── layout.tsx              # Root layout (có Redux)
    └── (admin)/
        └── chatbot-documents/
            └── page.tsx        # Trang quản lý tài liệu
```

## 🔧 API Endpoints

### Chatbot Documents API

Base URL: `http://103.161.17.191:8001`

- `GET /documents` - Lấy danh sách tài liệu
- `POST /documents` - Tạo tài liệu (multipart/form-data)
- `GET /documents/:id` - Lấy chi tiết tài liệu
- `PUT /documents/:id` - Cập nhật tài liệu
- `DELETE /documents/:id` - Xóa tài liệu
- `POST /documents/:id/process` - Xử lý tài liệu
- `GET /documents/:id/download` - Tải xuống tài liệu

### Chatbot QA API

- `POST /chatbot` - Gửi câu hỏi (stream hoặc không)

Body:
```json
{
  "question": "Câu hỏi của bạn",
  "stream": false
}
```

Response:
```json
{
  "answer": "Trả lời",
  "content": "Nội dung",
  "data": {
    "answer": "...",
    "content": "..."
  }
}
```

### Internal Backend API

- `POST /chat/messages` - Gửi tin nhắn
- `GET /chat/conversations/:id/messages` - Lấy lịch sử chat
- `POST /chat/conversations` - Tạo cuộc hội thoại
- `GET /chat/conversations` - Lấy danh sách hội thoại
- `DELETE /chat/conversations/:id` - Xóa hội thoại
- `PUT /chat/conversations/:id` - Cập nhật hội thoại
- `GET /chat/suggestions` - Lấy câu hỏi gợi ý
- `GET /chat/search` - Tìm kiếm cơ sở kiến thức
- `POST /chat/messages/:id/rate` - Đánh giá phản hồi

## 🎯 Tính năng ChatWidget

### Bubble (Nút nổi)

- ✅ Có thể kéo thả tự do trên màn hình
- ✅ Vị trí được lưu vào localStorage
- ✅ Tự động clamp vị trí khi resize window
- ✅ Hiệu ứng hover và animation
- ✅ Chỉ hiển thị khi user đã login

### Chat Panel

- ✅ Modal style với border-radius, shadow
- ✅ Header gradient màu tím
- ✅ Responsive (mobile friendly)
- ✅ Có thể resize (drag góc dưới-phải)

### Messages

- ✅ Hiển thị welcome screen (2 cột: icon + suggestion)
- ✅ Hiển thị user message (phải, gradient tím)
- ✅ Hiển thị bot message (trái, background xám)
- ✅ Hiệu ứng typing (3 dots animation)
- ✅ Typewriter effect (hiển thị từng ký tự)
- ✅ Auto scroll to bottom
- ✅ Scroll detection + "↓" button
- ✅ Copy & delete tools (hover)

### Input & Actions

- ✅ Input field có placeholder
- ✅ Send button (📩)
- ✅ Stop button khi streaming
- ✅ Enter key để send
- ✅ Disable input khi loading

### Features

- ✅ Streaming mode (default)
- ✅ Non-streaming fallback
- ✅ Error handling & toast notifications
- ✅ Online/offline detection
- ✅ History persistence (localStorage 100 messages)
- ✅ Auth guard
- ✅ Refresh/Reset conversation
- ✅ Confirm dialogs

## 📝 Redux State

```javascript
{
  chatbot: {
    currentConversation: null,
    messages: [],
    conversations: [],
    isLoading: false,
    isTyping: false,
    error: null,
    suggestedQuestions: [],
    faqCategories: [],
    currentFAQ: [],
    searchResults: [],
    searchLoading: false,
    settings: {
      autoSave: true,
      soundEnabled: false,
      theme: 'light'
    }
  }
}
```

## 🔐 Authentication

- ChatWidget chỉ hiển thị khi user login
- Auth được check từ localStorage `userData`
- Lắng nghe event `authStateChanged` để update state
- Lắng nghe sự thay đổi localStorage
- Clear messages khi user logout

## 📱 Responsive

- Mobile: Panel chiếm 100vw - 40px, height tùy chỉnh
- Tablet: Responsive grid
- Desktop: Width 760px (hoặc tùy chỉnh via resize)
- Min width: 420px, Max: window.innerWidth - 40

## 🎨 Styling

- Sử dụng CSS Modules (ChatWidget.module.css, DocumentManagement.module.css)
- Bootstrap classes cho layout
- Ant Design components (Table, Modal, Upload, etc.)
- Reactstrap UI components
- React Feather icons
- Gradient background (667eea - 764ba2)

## 🐛 Debugging

Để enable debug logs, set:

```bash
NODE_ENV=development
```

API calls sẽ log console.debug thông tin.

## 📚 Thêm vào Menu

Để thêm link vào menu admin, cập nhật `src/config/menu.config.ts`:

```typescript
{
  label: 'Chatbot',
  href: '/chatbot-documents',
  icon: 'MessageCircle' // hoặc icon khác
}
```

## 🔄 Cập nhật Chatbot URL

Để đổi Chatbot API URL, cập nhật:

1. `.env.local`:
```env
NEXT_PUBLIC_CHATBOT_API=https://your-chatbot-api.com
```

2. Nếu muốn hardcode trong code:
```javascript
// src/api/chatbot.js
const CHATBOT_BASE = 'https://your-chatbot-api.com';
```

3. Nếu muốn hardcode trong DocumentManagement API:
```javascript
// src/api/chatbotDocuments.js
const ChatbotAPI = axios.create({
  baseURL: 'https://your-chatbot-api.com'
});
```

## 🚨 Known Issues & Fixes

### Issue: ChatWidget không hiển thị

**Giải pháp:**
1. Kiểm tra user đã login chưa
2. Kiểm tra localStorage `userData`
3. Kiểm tra browser console errors
4. Kiểm tra `canUseChatbot` permission

### Issue: Streaming không hoạt động

**Giải pháp:**
1. Kiểm tra Chatbot API support streaming
2. Kiểm tra CORS headers
3. Kiểm tra network tab trong browser DevTools
4. Set `STREAM_ENABLED = false` trong ChatWidget nếu cần

### Issue: PDF upload thất bại

**Giải pháp:**
1. Kiểm tra file size (max 10MB)
2. Kiểm tra file type (application/pdf)
3. Kiểm tra form validation
4. Kiểm tra auth token
5. Kiểm tra API endpoint

## 📞 Support

Nếu gặp vấn đề, kiểm tra:

1. Console logs (Chrome DevTools)
2. Network tab (API calls)
3. Redux DevTools (state)
4. Browser Storage (localStorage)

## ✅ Checklist

- [x] Dependencies cài đặt
- [x] Redux store setup
- [x] API clients (chatbot, documents)
- [x] ChatWidget component
- [x] DocumentManagement component
- [x] Environment variables
- [x] Layout integration
- [x] Page setup (/chatbot-documents)
- [x] Utility functions
- [x] CSS modules
- [x] Responsive design
- [x] Auth guard
- [x] Error handling
- [x] Toast notifications
- [x] History persistence

Tất cả đã hoàn tất! 🎉
