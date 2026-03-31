'use client';

import React, { useState, useRef, useEffect, useCallback, FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from 'reactstrap';
import { X, RotateCcw, Copy, Trash2, ChevronDown } from 'react-feather';
import { notification } from 'antd';
import { askChatbot, askChatbotStream } from '../../api/chatbot';
import {
  setMessages,
  addMessage,
  updateMessage,
  removeMessage,
  setLoading,
  setError,
  clearError,
  selectMessages,
  selectChatbotLoading,
  selectChatbotError,
} from '../../redux/chatbotSlice';
import styles from './ChatWidget.module.css';

// Constants
const CHATBOT_BASE = process.env.NEXT_PUBLIC_CHATBOT_API || 'http://103.161.17.191:8001';
const STREAM_ENABLED = true;
const TYPEWRITER_SPEED = 20; // ms per character
const TOAST_DURATION = 2600; // ms
const MAX_STORED_MESSAGES = 100;

// Types
interface Position {
  x: number;
  y: number;
}

interface Dimensions {
  w: number;
  h: number;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface Message {
  id: string;
  from: 'user' | 'bot';
  text: string;
  displayText?: string;
  typing?: boolean;
  ellipsis?: boolean;
}

interface TypewriterState {
  full: string;
  shown: string;
  queue: string[];
  timer: NodeJS.Timeout | null;
  done: boolean;
}

// Helper: Generate unique ID
const generateId = (): string => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Helper: Check if user is authenticated
const isUserLoggedIn = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    const userData = localStorage.getItem('userData');
    return !!userData;
  } catch {
    return false;
  }
};

// Helper: Get user data
const getUserData = (): any => {
  if (typeof window === 'undefined') return null;
  try {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
};

// Helper: Check permission
const checkCanUseChatbot = (): boolean => {
  const user = getUserData();
  return !!user;
};

// Typewriter effect manager
class TypewriterManager {
  private states: Record<string, TypewriterState> = {};
  private speed: number;

  constructor(speed: number = TYPEWRITER_SPEED) {
    this.speed = speed;
  }

  init(messageId: string, fullText: string): void {
    this.states[messageId] = {
      full: fullText,
      shown: '',
      queue: fullText.split(''),
      timer: null,
      done: false,
    };
  }

  process(messageId: string, callback: (shown: string) => void): boolean {
    if (!this.states[messageId] || this.states[messageId].done) return false;

    const st = this.states[messageId];
    if (st.queue.length === 0) {
      st.done = true;
      return true;
    }

    const char = st.queue.shift();
    if (char) {
      st.shown += char;
      callback(st.shown);
    }

    return false;
  }

  clear(messageId: string): void {
    if (this.states[messageId]) {
      if (this.states[messageId].timer) {
        clearInterval(this.states[messageId].timer!);
      }
      delete this.states[messageId];
    }
  }

  clearAll(): void {
    Object.keys(this.states).forEach((id) => this.clear(id));
  }

  getState(messageId: string): TypewriterState | null {
    return this.states[messageId] || null;
  }
}

// Main Component
const ChatWidget: FC = () => {
  const dispatch = useDispatch();
  const messages = useSelector(selectMessages) as Message[];
  const loading = useSelector(selectChatbotLoading) as boolean;
  const error = useSelector(selectChatbotError) as string | null;

  // Position & UI state
  const [pos, setPos] = useState<Position>({ x: 0, y: 0 });
  const [open, setOpen] = useState(false);
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [isAuth, setIsAuth] = useState(true); // DEV: Auto-auth enabled
  const [canUseChatbot, setCanUseChatbot] = useState(true); // DEV: Always allow
  const [question, setQuestion] = useState('');
  const [showWelcome, setShowWelcome] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [dims, setDims] = useState<Dimensions>({ w: 760, h: 0 });
  const [atBottom, setAtBottom] = useState(true);
  const [headerShadow, setHeaderShadow] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [displayTexts, setDisplayTexts] = useState<Record<string, string>>({});

  // Refs
  const bubbleRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragOffsetRef = useRef<Position>({ x: 0, y: 0 });
  const streamControllersRef = useRef<Record<string, AbortController>>({});
  const typewriterRef = useRef(new TypewriterManager(TYPEWRITER_SPEED));

  // Handlers - Defined before useEffects
  const pushToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = generateId();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, TOAST_DURATION);

    notification[type]({
      message,
      duration: 2.6,
      placement: 'topRight',
    });
  }, []);

  // Init & Auth Check
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedPos = localStorage.getItem('chatWidgetPos');
        if (savedPos) {
          setPos(JSON.parse(savedPos));
        } else {
          setPos({
            x: window.innerWidth - 80,
            y: window.innerHeight - 80,
          });
        }
      } catch {
        setPos({
          x: window.innerWidth - 80,
          y: window.innerHeight - 80,
        });
      }

      try {
        const savedMessages = localStorage.getItem('chatWidgetHistory');
        if (savedMessages) {
          const msgs = JSON.parse(savedMessages);
          const normalized = msgs.map((m: any) => ({
            ...m,
            text: m.text || m.rendered || '',
            displayText: m.displayText || m.text || m.rendered || '',
          }));
          dispatch(setMessages(normalized));
          setShowWelcome(normalized.length === 0);
        }
      } catch {
        // Ignore
      }
    }

    const timer = setTimeout(() => {
      setBubbleVisible(true);
    }, 40);

    return () => clearTimeout(timer);
  }, [dispatch]);

  // Online/offline events
  useEffect(() => {
    const handleOnline = () => {
      pushToast('Kết nối lại thành công', 'success');
    };

    const handleOffline = () => {
      pushToast('Mất kết nối. Vui lòng kiểm tra internet', 'warning');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [pushToast]);

  // Auto-scroll
  useEffect(() => {
    if (atBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, atBottom]);

  // Save messages
  useEffect(() => {
    if (typeof window !== 'undefined' && canUseChatbot) {
      try {
        const toSave = messages.slice(-MAX_STORED_MESSAGES);
        localStorage.setItem('chatWidgetHistory', JSON.stringify(toSave));
      } catch {
        // Ignore
      }
    }
  }, [messages, canUseChatbot]);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    setAtBottom(true);
  }, []);

  const onScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const isAtBottom = Math.abs(el.scrollHeight - el.clientHeight - el.scrollTop) < 20;
    setAtBottom(isAtBottom);
    setHeaderShadow(el.scrollTop > 0);
  }, []);

  const toggleOpen = useCallback(() => {
    setOpen((prev) => !prev);
    if (!open) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  const onMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0 || !bubbleRef.current) return;

    const rect = bubbleRef.current.getBoundingClientRect();
    dragOffsetRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    const onMouseMove = (moveEvent: MouseEvent) => {
      let newX = moveEvent.clientX - dragOffsetRef.current.x;
      let newY = moveEvent.clientY - dragOffsetRef.current.y;

      newX = Math.max(0, Math.min(newX, window.innerWidth - 60));
      newY = Math.max(0, Math.min(newY, window.innerHeight - 60));

      setPos({ x: newX, y: newY });
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);

      if (typeof window !== 'undefined') {
        localStorage.setItem('chatWidgetPos', JSON.stringify(pos));
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, [pos]);

  useEffect(() => {
    const handleResize = () => {
      setPos((prevPos) => ({
        x: Math.max(0, Math.min(prevPos.x, window.innerWidth - 60)),
        y: Math.max(0, Math.min(prevPos.y, window.innerHeight - 60)),
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const startResize = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = dims.w;
    const startH = dims.h;

    const onMouseMove = (moveEvent: MouseEvent) => {
      let newW = startW + (moveEvent.clientX - startX);
      let newH = startH + (moveEvent.clientY - startY);

      newW = Math.max(420, Math.min(newW, window.innerWidth - 40));
      newH = Math.max(400, Math.min(newH, window.innerHeight - 40));

      setDims({ w: newW, h: newH });
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, [dims]);

  const extractAnswer = (res: any): string => {
    if (!res) return '';
    const answer =
      res.answer || res.content || (res.data && res.data.answer) || (res.data && res.data.content) || '';
    if (typeof answer === 'object') {
      return JSON.stringify(answer, null, 2);
    }
    return String(answer);
  };

  const renderAnswer = (value: string): React.ReactElement => {
    if (!value) return <></>;

    let text = String(value);
    text = text.replace(/([^\n]):([^\n])/g, '$1:\n$2');
    text = text.replace(/([^\n])(\n)?(\d+\.)/g, '$1\n$3');
    text = text.replace(/([^\n])([-*])/g, '$1\n$2');
    text = text.replace(/\n{3,}/g, '\n\n');

    return <pre className={styles.msgText}>{text}</pre>;
  };

  const stopStreaming = useCallback(() => {
    Object.values(streamControllersRef.current).forEach((controller) => {
      if (controller) controller.abort();
    });
    streamControllersRef.current = {};
    typewriterRef.current.clearAll();
    dispatch(setLoading(false));
    pushToast('Đã dừng', 'info');
  }, [dispatch, pushToast]);

  const sendQuestion = useCallback(async () => {
    if (!question.trim() || loading) return;

    const userMsg: Message = {
      id: generateId(),
      from: 'user',
      text: question,
      displayText: question,
      typing: false,
    };

    dispatch(addMessage(userMsg));
    setQuestion('');
    setShowWelcome(false);

    const botMsgId = generateId();
    const botMsg: Message = {
      id: botMsgId,
      from: 'bot',
      text: '',
      displayText: '',
      typing: true,
      ellipsis: true,
    };

    dispatch(addMessage(botMsg));
    dispatch(setLoading(true));
    dispatch(clearError());

    try {
      if (STREAM_ENABLED) {
        const controller = new AbortController();
        streamControllersRef.current[botMsgId] = controller;

        try {
          let fullText = '';
          await askChatbotStream(question, {
            onToken: (accum: string, delta: string) => {
              fullText = accum;

              try {
                const parsed = JSON.parse(fullText);
                const answer = extractAnswer(parsed);

                if (answer && !typewriterRef.current.getState(botMsgId)) {
                  typewriterRef.current.init(botMsgId, answer);
                  dispatch(
                    updateMessage({
                      id: botMsgId,
                      ellipsis: false,
                      text: answer,
                    })
                  );

                  const st = typewriterRef.current.getState(botMsgId);
                  if (st) {
                    st.timer = setInterval(() => {
                      const finished = typewriterRef.current.process(botMsgId, (shown) => {
                        setDisplayTexts((prev) => ({
                          ...prev,
                          [botMsgId]: shown,
                        }));
                      });

                      if (finished && st.timer) {
                        clearInterval(st.timer);
                        st.done = true;
                        dispatch(
                          updateMessage({
                            id: botMsgId,
                            displayText: st.full,
                            typing: false,
                          })
                        );
                      }
                    }, TYPEWRITER_SPEED);
                  }
                }
              } catch {
                // JSON parse failed
              }
            },
            abortSignal: controller.signal,
          });

          if (!typewriterRef.current.getState(botMsgId) && fullText) {
            typewriterRef.current.init(botMsgId, fullText);
            dispatch(
              updateMessage({
                id: botMsgId,
                ellipsis: false,
                text: fullText,
              })
            );

            const st = typewriterRef.current.getState(botMsgId);
            if (st) {
              st.timer = setInterval(() => {
                const finished = typewriterRef.current.process(botMsgId, (shown) => {
                  setDisplayTexts((prev) => ({
                    ...prev,
                    [botMsgId]: shown,
                  }));
                });

                if (finished && st.timer) {
                  clearInterval(st.timer);
                  dispatch(
                    updateMessage({
                      id: botMsgId,
                      displayText: st.full,
                      typing: false,
                    })
                  );
                }
              }, TYPEWRITER_SPEED);
            }
          }
        } catch (err: any) {
          if (err.name !== 'AbortError') {
            throw err;
          }
        }
      } else {
        const response = await askChatbot(question);
        const answer = extractAnswer(response);

        typewriterRef.current.init(botMsgId, answer);
        dispatch(
          updateMessage({
            id: botMsgId,
            text: answer,
            displayText: answer,
            typing: false,
          })
        );
      }

      delete streamControllersRef.current[botMsgId];
    } catch (err: any) {
      let errorMsg = 'Lỗi khi xử lý câu hỏi';

      if (!navigator.onLine) {
        errorMsg = 'Mất kết nối internet';
      } else if (err.message) {
        errorMsg = err.message;
      }

      dispatch(setError(errorMsg));
      pushToast(errorMsg, 'error');

      dispatch(
        updateMessage({
          id: botMsgId,
          text: `❌ ${errorMsg}`,
          displayText: `❌ ${errorMsg}`,
          typing: false,
          ellipsis: false,
        })
      );
    } finally {
      dispatch(setLoading(false));
    }
  }, [question, loading, dispatch, pushToast]);

  const deleteMessage = useCallback((id: string) => {
    if (!messagesRef.current) return;
    
    const prevBottomGap =
      messagesRef.current.scrollHeight - messagesRef.current.clientHeight - messagesRef.current.scrollTop;

    dispatch(removeMessage(id));
    typewriterRef.current.clear(id);

    setTimeout(() => {
      if (messagesRef.current) {
        messagesRef.current.scrollTop =
          messagesRef.current.scrollHeight - messagesRef.current.clientHeight - prevBottomGap;
      }
    }, 0);
  }, [dispatch]);

  const copyMessage = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        pushToast('Đã copy', 'success');
      } catch {
        pushToast('Copy thất bại', 'error');
      }
    },
    [pushToast]
  );

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendQuestion();
      }
    },
    [sendQuestion]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Escape') {
        if (showConfirm || showResetConfirm) {
          setShowConfirm(false);
          setShowResetConfirm(false);
        } else {
          setOpen(false);
        }
      }
    },
    [showConfirm, showResetConfirm]
  );

  const handleReset = useCallback(() => {
    dispatch(setMessages([]));
    setShowWelcome(true);
    setDisplayTexts({});
    typewriterRef.current.clearAll();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('chatWidgetHistory');
    }
    setShowResetConfirm(false);
    pushToast('Đã xóa hội thoại', 'success');
  }, [dispatch, pushToast]);

  const handleSuggestClick = useCallback((text: string) => {
    setQuestion(text);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  }, []);

  if (!canUseChatbot || !bubbleVisible) {
    return null;
  }

  return (
    <div
      className={styles.chatWidget}
      onKeyDown={handleKeyDown}
      role="region"
      aria-label="Chat Widget">
      {open && (
        <div
          className={styles.chatWidgetBackdrop}
          onClick={() => setOpen(false)}
        />
      )}

      {open && (
        <div
          className={styles.chatWidgetPanel}
          ref={panelRef}>
          <div
            className={`${styles.chatWidgetHeader} ${
              headerShadow ? styles.hasShadow : ''
            }`}>
            <h3 className={styles.chatTitle}>💬 Trợ lý thông minh</h3>
            <div className={styles.chatHeaderActions}>
              {messages.length > 0 && (
                <button
                  className={styles.iconBtn}
                  onClick={() => setShowConfirm(true)}
                  title="Làm mới">
                  <RotateCcw size={18} />
                </button>
              )}
              <button
                className={styles.iconBtn}
                onClick={() => setOpen(false)}
                title="Đóng">
                <X size={18} />
              </button>
            </div>
          </div>

          <div
            className={styles.chatWidgetBody}
            ref={messagesRef}
            onScroll={onScroll}>
            {toasts.length > 0 && (
              <div className={styles.toastContainer}>
                <div
                  className={`${styles.toast} ${styles[
                    toasts[toasts.length - 1].type
                  ]}`}>
                  {toasts[toasts.length - 1].message}
                </div>
              </div>
            )}

            {showConfirm && (
              <div className={styles.confirmPopup}>
                <p>Làm mới hội thoại?</p>
                <div className={styles.confirmActions}>
                  <Button size="sm" color="secondary" onClick={() => setShowConfirm(false)}>
                    Hủy
                  </Button>
                  <Button
                    size="sm"
                    color="danger"
                    onClick={() => {
                      setShowConfirm(false);
                      setShowResetConfirm(true);
                    }}>
                    Xóa
                  </Button>
                </div>
              </div>
            )}

            {showResetConfirm && (
              <div className={styles.confirmPopup}>
                <p>Xóa toàn bộ hội thoại? Không thể hoàn tác!</p>
                <div className={styles.confirmActions}>
                  <Button size="sm" color="secondary" onClick={() => setShowResetConfirm(false)}>
                    Hủy
                  </Button>
                  <Button size="sm" color="danger" onClick={handleReset}>
                    Xóa toàn bộ
                  </Button>
                </div>
              </div>
            )}

            <div className={styles.messages}>
              {showWelcome && messages.length === 0 && (
                <div className={styles.welcomeScreen}>
                  <div className={styles.welcomeLeft}>
                    <div className={styles.welcomeIcon}>🏛️</div>
                    <p>
                      Xin chào! Tôi là trợ lý thông minh, sẵn sàng giúp bạn trả
                      lời các câu hỏi về công đoàn.
                    </p>
                  </div>
                  <div className={styles.welcomeRight}>
                    <p className={styles.suggestLabel}>Câu hỏi gợi ý:</p>
                    <div className={styles.suggestButtons}>
                      {[
                        'Quyền lợi khi tham gia công đoàn?',
                        'Làm sao để tham gia công đoàn?',
                        'Công đoàn có những chức năng gì?',
                      ].map((q, i) => (
                        <button
                          key={i}
                          className={styles.suggestBtn}
                          onClick={() => handleSuggestClick(q)}>
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {messages.map((msg) => {
                const displayText = displayTexts[msg.id] || msg.displayText || msg.text;
                return (
                  <div key={msg.id} className={`${styles.msgRow} ${styles[msg.from]}`}>
                    {msg.from === 'bot' && (
                      <div className={styles.msgAvatar} data-role="bot">
                        🤖
                      </div>
                    )}
                    <div className={`${styles.msg} ${msg.typing ? styles.typing : ''}`}>
                      <div className={styles.msgTools}>
                        <button
                          className={styles.toolIcon}
                          onClick={() => copyMessage(msg.text)}>
                          <Copy size={14} />
                        </button>
                        <button
                          className={styles.toolIcon}
                          onClick={() => deleteMessage(msg.id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className={styles.msgContent}>
                        {msg.typing ? (
                          msg.ellipsis ? (
                            <span className={styles.ellipsis}>
                              <span></span>
                              <span></span>
                              <span></span>
                            </span>
                          ) : (
                            renderAnswer(displayText)
                          )
                        ) : (
                          renderAnswer(displayText)
                        )}
                      </div>
                    </div>
                    {msg.from === 'user' && (
                      <div className={styles.msgAvatar} data-role="user">
                        🧑
                      </div>
                    )}
                  </div>
                );
              })}

              {!atBottom && (
                <button className={styles.scrollBottomBtn} onClick={scrollToBottom}>
                  <ChevronDown size={20} />
                </button>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className={styles.chatInput}>
            <input
              ref={inputRef}
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="Ví dụ: Quyền lợi khi tham gia công đoàn?"
              disabled={loading}
              className={styles.inputField}
            />
            {loading && streamControllersRef.current[messages[messages.length - 1]?.id] ? (
              <Button
                color="danger"
                size="sm"
                onClick={stopStreaming}
                className={styles.btnAction}>
                ⏹️ Dừng
              </Button>
            ) : (
              <Button
                color="primary"
                size="sm"
                onClick={sendQuestion}
                disabled={loading || !question.trim()}
                className={styles.btnAction}>
                📩 Gửi
              </Button>
            )}
          </div>

          {error && <div className={styles.chatError}>{error}</div>}
        </div>
      )}

      <div
        className={`${styles.chatWidgetBubble} ${
          bubbleVisible ? styles.visible : ''
        } ${open ? styles.hidden : ''}`}
        ref={bubbleRef}
        style={{
          left: `${pos.x}px`,
          top: `${pos.y}px`,
        }}
        onMouseDown={onMouseDown}
        onClick={toggleOpen}
        role="button"
        tabIndex={0}
        title="Mở chat"
        aria-label="Chat widget bubble">
        <div className={styles.chatWidgetIcon}>💬</div>
      </div>
    </div>
  );
};

export default ChatWidget;
