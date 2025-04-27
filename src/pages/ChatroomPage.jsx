// src/pages/ChatroomPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { database } from '../services/firebase';
import { ref, push, onChildAdded, get } from 'firebase/database';

function ChatroomPage({ user, onSignOut, onEditProfile }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [userProfiles, setUserProfiles] = useState({});
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const messagesRef = ref(database, 'messages');

    onChildAdded(messagesRef, async (snapshot) => {
      const msg = snapshot.val();

      if (!userProfiles[msg.uid]) {
        const profileRef = ref(database, `profiles/${msg.uid}`);
        const profileSnap = await get(profileRef);
        if (profileSnap.exists()) {
          setUserProfiles(prev => ({
            ...prev,
            [msg.uid]: profileSnap.val()
          }));
        }
      }

      setMessages((prevMessages) => [...prevMessages, msg]);
    });
  }, [userProfiles]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = () => {
    if (newMessage.trim() === '') return;

    const messagesRef = ref(database, 'messages');
    push(messagesRef, {
      uid: user.uid,
      text: newMessage,
      timestamp: Date.now(),
    });

    setNewMessage('');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>聊天室</h2>
        <div>
          <button onClick={onSignOut} style={{ marginRight: '10px' }}>登出</button>
          <button onClick={onEditProfile}>個人檔案</button>
        </div>
      </div>

      <div style={{ border: '1px solid #ccc', padding: '10px', height: '400px', overflowY: 'scroll', backgroundColor: '#f9f9f9', marginBottom: '20px', borderRadius: '8px' }}>
        {messages.map((msg, index) => {
          const profile = userProfiles[msg.uid];
          return (
            <div key={index} style={{ marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
              {profile && profile.pfp ? (
                <img
                  src={profile.pfp}
                  alt="pfp"
                  style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px' }}
                />
              ) : (
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#ccc', marginRight: '10px' }}></div>
              )}
              <div>
                <div><strong>{profile ? profile.username : '使用者'}</strong></div>
                <div>{msg.text}</div>
                <div style={{ fontSize: '0.8em', color: '#888' }}>
                  {new Date(msg.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef}></div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        <input
          type="text"
          placeholder="輸入訊息..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          style={{ flex: '1', padding: '8px' }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
        />
        <button onClick={handleSend} style={{ padding: '8px 20px' }}>
          發送
        </button>
      </div>
    </div>
  );
}

export default ChatroomPage;
