// src/pages/ChatroomPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { database } from '../services/firebase';
import { ref, push, onChildAdded } from 'firebase/database';

// 小工具：簡單消毒訊息，防止 script attack
function sanitize(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 小工具：格式化時間
function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString(); // 根據使用者地區自動格式化
}

function ChatroomPage({ user, onSignOut }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null); // 用來捲到最底部

  useEffect(() => {
    const messagesRef = ref(database, 'messages');

    onChildAdded(messagesRef, (snapshot) => {
      const msg = snapshot.val();
      setMessages((prevMessages) => [...prevMessages, msg]);
    });
  }, []);

  useEffect(() => {
    // 每次訊息更新後，自動滾到底部
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = () => {
    if (newMessage.trim() === '') return;

    const messagesRef = ref(database, 'messages');
    push(messagesRef, {
      uid: user.uid,
      email: user.email,
      text: sanitize(newMessage),
      timestamp: Date.now(),
    });

    setNewMessage('');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>聊天室</h2>
        <button onClick={onSignOut}>登出</button>
      </div>

      <div style={{
        border: '1px solid #ccc',
        padding: '10px',
        height: '400px',
        overflowY: 'scroll',
        backgroundColor: '#f9f9f9',
        marginBottom: '20px',
        borderRadius: '8px'
      }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ marginBottom: '10px' }}>
            <strong>{msg.email}</strong>：
            <span dangerouslySetInnerHTML={{ __html: msg.text }} /> {/* 已消毒過的訊息 */}
            <div style={{ fontSize: '0.8em', color: '#888' }}>
              {formatTime(msg.timestamp)}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef}></div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        <input
          type="text"
          placeholder="輸入訊息..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          style={{ flex: '1', padding: '8px' }}
        />
        <button onClick={handleSend} style={{ padding: '8px 20px' }}>
          發送
        </button>
      </div>
    </div>
  );
}

export default ChatroomPage;
