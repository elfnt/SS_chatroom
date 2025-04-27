import React, { useState, useEffect, useRef } from 'react';
import { database } from '../services/firebase';
import { ref, push, remove, onChildAdded, onChildRemoved, get } from 'firebase/database';
import ProfileModal from './ProfileModal';

function ChatroomPage({ user, onSignOut, onEditProfile }) {
  const [messages, setMessages] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [newMsg, setNewMsg] = useState('');
  const [hoverKey, setHoverKey] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalProfile, setModalProfile] = useState(null);
  const [blocked, setBlocked] = useState(
    JSON.parse(localStorage.getItem('blockedUsers') || '[]')
  );
  const bottomRef = useRef(null);

  useEffect(() => {
    const msgRef = ref(database, 'messages');

    onChildAdded(msgRef, snap => {
      const key = snap.key, data = snap.val();
      setMessages(prev => (prev.find(m => m.key === key) ? prev : [...prev, { key, ...data }]));
    });
    onChildRemoved(msgRef, snap => {
      const key = snap.key;
      setMessages(prev => prev.filter(m => m.key !== key));
    });
  }, []);

  useEffect(() => {
    (async () => {
      const unknown = messages.map(m => m.uid)
        .filter(uid => !profiles[uid])
        .filter((uid, idx, arr) => arr.indexOf(uid) === idx);
      if (!unknown.length) return;

      const upd = {};
      await Promise.all(
        unknown.map(async uid => {
          const s = await get(ref(database, `profiles/${uid}`));
          if (s.exists()) upd[uid] = s.val();
        })
      );
      if (Object.keys(upd).length) setProfiles(p => ({ ...p, ...upd }));
    })();
  }, [messages, profiles]);

  useEffect(() => bottomRef.current?.scrollIntoView({ behavior: 'auto' }), [messages]);

  const sendMessage = () => {
    if (!newMsg.trim()) return;
    push(ref(database, 'messages'), {
      uid: user.uid,
      text: newMsg.trim(),
      timestamp: Date.now()
    });
    setNewMsg('');
  };

  const recall = key => {
    remove(ref(database, `messages/${key}`))
      .then(() => console.log('收回成功'))
      .catch(err => {
        console.error('收回失敗', err);
        alert('收回失敗：' + err.message);
      });
  };

  const toggleBlock = uid => {
    if (uid === user.uid) return alert('不能封鎖自己！');
    const upd = blocked.includes(uid) ? blocked.filter(id => id !== uid) : [...blocked, uid];
    setBlocked(upd);
    localStorage.setItem('blockedUsers', JSON.stringify(upd));
    setShowModal(false);
  };

  return (
    <div className="container">
      {/* 頂欄 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 className="title">聊天室</h2>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="button" onClick={onEditProfile}>Profile</button>
          <button className="button" onClick={onSignOut}>Logout</button>
        </div>
      </div>

      {/* 訊息列表 */}
      <div className="message-list">
        {messages.map(m => {
          const prof = profiles[m.uid] || {};
          const me = m.uid === user.uid;
          const mute = blocked.includes(m.uid);

          return (
            <div
              key={m.key}
              className="message-item"
              style={{ opacity: mute ? 0.5 : 1, color: mute ? '#888' : '#000' }}
              onMouseEnter={() => setHoverKey(m.key)}
              onMouseLeave={() => setHoverKey(null)}
            >
              {/* 頭貼 */}
              <div
                style={{
                  width: 40, height: 40, borderRadius: '50%', marginRight: 10, flexShrink: 0,
                  background: `url(${prof.pfp || ''}) center/cover,#ccc`, cursor: 'pointer'
                }}
                onClick={() => { setModalProfile({ ...prof, uid: m.uid }); setShowModal(true); }}
              />

              {/* 文字 */}
              <div style={{ flexGrow: 1 }}>
                <div
                  style={{ fontWeight: 'bold', cursor: 'pointer' }}
                  onClick={() => { setModalProfile({ ...prof, uid: m.uid }); setShowModal(true); }}
                >
                  {prof.username || '使用者'}
                </div>
                <div>{mute ? '（已屏蔽）' : m.text}</div>
                <div style={{ fontSize: '0.8em', color: '#666' }}>
                  {new Date(m.timestamp).toLocaleString()}
                </div>
              </div>

              {/* 收回 */}
              {me && hoverKey === m.key && (
                <button
                  className="button recall-btn"
                  style={{ background: '#ffd9d9', width: 'auto', padding: '4px 8px', position:'absolute', right:0, top:6 }}
                  onClick={() => recall(m.key)}
                >
                  收回
                </button>
              )}
            </div>
          );
        })}
        <div ref={bottomRef}></div>
      </div>

      {/* 輸入區 */}
      <div style={{ display: 'flex', gap: 10 }}>
        <input
          className="input"
          placeholder="輸入訊息…"
          value={newMsg}
          onChange={e => setNewMsg(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
        />
        <button className="button" style={{ flexShrink: 0, width: 90 }} onClick={sendMessage}>
          發送
        </button>
      </div>

      {/* Profile Modal */}
      {showModal && modalProfile && (
        <ProfileModal
          profile={modalProfile}
          user={user}
          isBlocked={blocked.includes(modalProfile.uid)}
          onBlockToggle={() => toggleBlock(modalProfile.uid)}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

export default ChatroomPage;
