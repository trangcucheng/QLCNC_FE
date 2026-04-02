# 🚀 Chatbot AI Integration - Implementation Checklist

## Installation & Setup

### Step 1: Install Dependencies
```bash
npm install
# or
yarn install
```

**Dependencies added:**
- ✅ @reduxjs/toolkit@^1.9.7 - Redux state management
- ✅ react-redux@^8.1.3 - React Redux bindings
- ✅ axios@^1.6.7 - HTTP client
- ✅ reactstrap@^9.2.1 - Bootstrap components
- ✅ bootstrap@^5.3.3 - Bootstrap CSS
- ✅ antd@^5.14.2 - Ant Design components
- ✅ react-feather@^2.0.10 - Feather icons

### Step 2: Verify Environment Variables
Check `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:6061
NEXT_PUBLIC_CHATBOT_API=http://103.161.17.191:8001
```

Update `NEXT_PUBLIC_CHATBOT_API` if needed.

### Step 3: Start Development Server
```bash
npm run dev
# App will be at http://localhost:3000
```

---

## Testing ChatWidget

### Test 1: User Authentication
- [ ] Login to the application
- [ ] ChatWidget bubble should appear at bottom-right corner
- [ ] Logout
- [ ] ChatWidget bubble should disappear

### Test 2: Bubble Interactions
- [ ] Drag bubble to different positions
- [ ] Refresh page - position should persist
- [ ] Click bubble to open panel
- [ ] Panel should open with animation
- [ ] Click X button - panel should close

### Test 3: Chat Functionality
- [ ] Type message in input
- [ ] Press Enter or click Send button
- [ ] Message appears on right (user message)
- [ ] Bot typing indicator appears (3 dots)
- [ ] Bot response appears on left
- [ ] Typewriter effect shows characters one by one
- [ ] Previous messages visible in list

### Test 4: Message Tools
- [ ] Hover over any message
- [ ] Copy button appears - clicking copies text
- [ ] Delete button appears - clicking removes message
- [ ] Toast notification shows "Đã copy"

### Test 5: Scroll & Navigation
- [ ] Send multiple messages to fill chat
- [ ] Auto-scroll to bottom
- [ ] Scroll up to see history
- [ ] "↓" button appears when not at bottom
- [ ] Click "↓" to scroll back to bottom

### Test 6: Welcome Screen
- [ ] Open chat with no messages
- [ ] Welcome screen shows with icon and suggestions
- [ ] Click suggestion button - text fills input
- [ ] Can modify text and send

### Test 7: Refresh/Reset
- [ ] Send several messages
- [ ] Click refresh button (🔄) in header
- [ ] Confirmation dialog appears
- [ ] Click "Xóa toàn bộ"
- [ ] All messages cleared
- [ ] Welcome screen reappears

### Test 8: Keyboard & Shortcuts
- [ ] Type message - Enter key sends (single line)
- [ ] ESC key closes panel
- [ ] Tab navigation works

### Test 9: Responsive Design
- [ ] Open on mobile (< 480px)
- [ ] Panel should be full width minus margins
- [ ] Buttons still clickable
- [ ] Input still works
- [ ] Messages readable
- [ ] Bubble visible

### Test 10: Error Handling
- [ ] Close internet connection
- [ ] Try to send message
- [ ] Error toast appears "Mất kết nối"
- [ ] Reconnect internet
- [ ] Success toast appears "Kết nối lại thành công"

---

## Testing DocumentManagement

### Access the Page
- Navigate to: `http://localhost:3000/chatbot-documents`
- Page should load with table view
- "Thêm tài liệu" button visible

### Test 1: Create Document
- [ ] Click "Thêm tài liệu" button
- [ ] Modal opens with form
- [ ] Fill "Tên tài liệu" field
- [ ] Select a PDF file
- [ ] Click OK
- [ ] Upload progress bar shows
- [ ] Document appears in table after upload

### Test 2: View Table
- [ ] Verify columns: Tên, Kích thước, Trạng thái, Ngày tạo, Trang, Hành động
- [ ] Pagination controls visible
- [ ] Can change page size (10, 20, 50)
- [ ] Sort by clicking headers

### Test 3: View Details
- [ ] Click "Xem" button on any document
- [ ] Drawer opens on right side
- [ ] Shows all document info
- [ ] "Sửa" and "Tải xuống" buttons present

### Test 4: Edit Document
- [ ] Click Edit icon or "Sửa" in drawer
- [ ] Modal opens with current name
- [ ] Change name
- [ ] Click OK
- [ ] Success message appears
- [ ] Table updates

### Test 5: Download Document
- [ ] Click Download icon
- [ ] File downloads to local machine
- [ ] Success message "Tải xuống thành công"

### Test 6: Process Document
- [ ] Click "Xử lý" button on pending document
- [ ] Button shows loading state
- [ ] After completion, status changes to "Hoàn tát"
- [ ] Success message appears

### Test 7: Delete Document
- [ ] Click Delete icon
- [ ] Confirmation dialog appears
- [ ] Click "Xóa"
- [ ] Document removed from table
- [ ] Success message "Xóa tài liệu thành công"

### Test 8: Form Validation
- [ ] Click "Thêm tài liệu"
- [ ] Try to submit without name - error message
- [ ] Try to submit without file - error message
- [ ] Select non-PDF file - error message
- [ ] Select PDF > 10MB - error message

---

## Redux DevTools Testing

### Install Redux DevTools Extension
- [ ] Install Redux DevTools extension for Chrome/Firefox
- [ ] Open DevTools
- [ ] Find "Redux" tab

### Test Redux State
- [ ] Send a message through ChatWidget
- [ ] Check Redux state: `state.chatbot.messages`
- [ ] Message should appear with id, from, text, displayText
- [ ] Check `state.chatbot.isLoading` during message send
- [ ] Verify state changes timing

---

## API Integration Testing

### Using Browser DevTools Network Tab

#### Test Chatbot API Call
- [ ] Open DevTools > Network tab
- [ ] Send message in ChatWidget
- [ ] Filter requests to find POST to chatbot API
- [ ] Verify URL: `http://103.161.17.191:8001/chatbot`
- [ ] Check request payload: `{ question: "...", stream: true }`
- [ ] Check response: should have `answer` or `content` field

#### Test Document API Calls
- [ ] Navigate to `/chatbot-documents`
- [ ] Check Network tab
- [ ] On page load: GET to `/documents`
- [ ] Click "Thêm tài liệu" > upload: POST to `/documents`
- [ ] Click delete: DELETE to `/documents/:id`
- [ ] Click download: GET to `/documents/:id/download`

---

## Console & Debugging

### Enable Debug Logs
Debug logs enabled when `NODE_ENV === 'development'`

In ChatWidget, check console for:
- `[askChatbot]` logs
- `[askChatbotStream]` logs
- Message state updates

### Common Issues & Fixes

#### ChatWidget not showing
- [ ] Check if user is logged in
- [ ] Check localStorage key `userData`
- [ ] Check browser console for errors
- [ ] Check z-index (should be 998 for bubble, 1000 for panel)

#### Messages not sending
- [ ] Check network tab for API call
- [ ] Verify Chatbot API URL in browser
- [ ] Check CORS headers
- [ ] Verify streaming is enabled

#### Upload fails
- [ ] Check file is PDF
- [ ] Check file size < 10MB
- [ ] Check form validation messages
- [ ] Verify auth token present

#### Responsive layout broken
- [ ] Check CSS module is properly imported
- [ ] Verify media queries in ChatWidget.module.css
- [ ] Test on actual mobile device

---

## Browser Compatibility

Test on:
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Chrome
- [ ] Mobile Safari

---

## Performance Checklist

- [ ] ChatWidget loads without lag
- [ ] Message sending < 1 second response time
- [ ] Scroll smooth when many messages
- [ ] Upload progress shows without freezing
- [ ] No unnecessary re-renders (check React DevTools)
- [ ] Message history persists after page refresh

---

## Deployment Checklist

### Before Production Deploy
- [ ] All tests passing
- [ ] No console errors
- [ ] Chatbot API URL updated for production
- [ ] Backend API URL updated for production
- [ ] Error messages are user-friendly
- [ ] All features tested
- [ ] Responsive design tested on mobile
- [ ] Performance tested
- [ ] Security: no credentials in frontend code
- [ ] Build command: `npm run build`

### Production Build
```bash
npm run build
npm start
```

---

## Configuration Reference

### Environment Variables
```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:6061           # Or your backend URL
NEXT_PUBLIC_CHATBOT_API=http://103.161.17.191:8001  # Or your chatbot URL
```

### Redux Store Location
```
src/redux/store.js
```

### ChatWidget Component
```
src/components/ChatWidget/index.js
src/components/ChatWidget/ChatWidget.module.css
```

### DocumentManagement Component
```
src/components/DocumentManagement/index.js
src/components/DocumentManagement/DocumentManagement.module.css
```

### Document Page Route
```
/chatbot-documents
src/app/(admin)/chatbot-documents/page.tsx
```

---

## Next Steps

1. [ ] Install dependencies
2. [ ] Verify environment variables
3. [ ] Start dev server
4. [ ] Login to application
5. [ ] Verify ChatWidget appears
6. [ ] Test message sending
7. [ ] Navigate to /chatbot-documents
8. [ ] Test document upload
9. [ ] Review redux state
10. [ ] Check browser console for errors
11. [ ] Test responsive design
12. [ ] Prepare for production deploy

---

## Support & Troubleshooting

### Common Questions

**Q: Why is ChatWidget not visible?**
A: Make sure you're logged in. ChatWidget only shows for authenticated users.

**Q: How do I change the Chatbot API URL?**
A: Update `NEXT_PUBLIC_CHATBOT_API` in `.env.local` and restart dev server.

**Q: How do I customize colors?**
A: Edit color values in `ChatWidget.module.css` (search for #667eea, #764ba2)

**Q: Can I disable streaming?**
A: Yes, in ChatWidget component, change `STREAM_ENABLED = false`

**Q: How is message history saved?**
A: Automatically saved to localStorage under key `chatWidgetHistory` (max 100 messages)

**Q: How do I clear message history?**
A: Click refresh button and confirm "Xóa toàn bộ" or manually clear localStorage

---

## Final Checklist Summary

✅ All files created and configured
✅ Dependencies installed in package.json
✅ Redux store setup
✅ API clients ready
✅ ChatWidget component complete
✅ DocumentManagement component complete  
✅ Layout integration done
✅ Routes setup (/chatbot-documents)
✅ Environment variables configured
✅ Styling complete and responsive
✅ Documentation provided

**Ready to start development!** 🎉

---

Version: v1.0
Date: March 20, 2026
Status: ✅ Complete
