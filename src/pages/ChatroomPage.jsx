import React, { useState, useEffect, useRef } from 'react';
import { database } from '../services/firebase';
import { ref, push, onChildAdded, onChildRemoved, get } from 'firebase/database';
import ProfileModal from './ProfileModal';

function ChatroomPage({ user, onSignOut, onEditProfile }) {
  /* ---------- state ---------- */
  const [messages, setMessages]   = useState([]);            // 所有訊息
  const [profiles, setProfiles]   = useState({});            // uid → {username,pfp,bio}
  const [newMsg, setNewMsg]       = useState('');            // 輸入框
  const [hoverKey, setHoverKey]   = useState(null);          // hover 訊息 id
  const [showModal, setShowModal] = useState(false);         // ProfileModal 開關
  const [modalProfile, setModalProfile] = useState(null);    // Modal 內要看的 profile
  const [blocked, setBlocked]     = useState(() =>
    JSON.parse(localStorage.getItem('blockedUsers') || '[]')
  );

  const bottomRef = useRef(null);

  /* ---------- 訊息監聽：只綁一次 ---------- */
  useEffect(() => {
    const msgRef = ref(database, 'messages');

    onChildAdded(msgRef, snap => {
      const key = snap.key;
      const data = snap.val();

      setMessages(prev =>
        prev.find(m => m.key === key) ? prev : [...prev, { key, ...data }]
      );
    });

    onChildRemoved(msgRef, snap => {
      const key = snap.key;
      setMessages(prev => prev.filter(m => m.key !== key));
    });
  }, []);                         // ← 依賴陣列為 []，只在掛載時執行一次

  /* ---------- 當有新 uid 出現時去拉取 profile ---------- */
  useEffect(() => {
    (async () => {
      const unknownUids = messages
        .map(m => m.uid)
        .filter(uid => !profiles[uid])
        .filter((uid, idx, arr) => arr.indexOf(uid) === idx); // 去重

      if (unknownUids.length === 0) return;

      const updates = {};
      await Promise.all(
        unknownUids.map(async uid => {
          const snap = await get(ref(database, `profiles/${uid}`));
          if (snap.exists()) updates[uid] = snap.val();
        })
      );
      if (Object.keys(updates).length)
        setProfiles(prev => ({ ...prev, ...updates }));
    })();
  }, [messages, profiles]);

  /* ---------- 訊息更新後自動滑到底 ---------- */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [messages]);

  /* ---------- 事件 handler ---------- */
  const sendMessage = () => {
    if (newMsg.trim() === '') return;
    push(ref(database, 'messages'), {
      uid: user.uid,
      text: newMsg.trim(),
      timestamp: Date.now()
    });
    setNewMsg('');
  };

  const recallMessage = key => {
    push(ref(database, `messages/${key}`), null);            // remove() 在瀏覽器端不可直接 off，所以用 push(null) 簡易刪
  };

  const toggleBlock = uid => {
    if (uid === user.uid) { alert('不能封鎖自己！'); return; }

    const updated = blocked.includes(uid)
      ? blocked.filter(id => id !== uid)
      : [...blocked, uid];

    setBlocked(updated);
    localStorage.setItem('blockedUsers', JSON.stringify(updated));
    setShowModal(false);
  };

  /* ---------- JSX ---------- */
  return (
    <div style={{ padding: 20, maxWidth: 600, margin: '0 auto' }}>
      {/* 頂欄 */}
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
        <h2>聊天室</h2>
        <div>
          <button onClick={onSignOut} style={{ marginRight:10 }}>登出</button>
          <button onClick={onEditProfile}>個人檔案</button>
        </div>
      </div>

      {/* 訊息列表 */}
      <div style={{
        border:'1px solid #ccc', padding:10, height:400, overflowY:'auto',
        background:'#fafafa', borderRadius:8, marginBottom:20
      }}>
        {messages.map((m, i) => {
          const prof   = profiles[m.uid] || {};
          const me     = m.uid === user.uid;
          const muted  = blocked.includes(m.uid);

          return (
            <div key={m.key} style={{
              display:'flex', alignItems:'center', position:'relative',
              marginBottom:15, opacity: muted?0.5:1, color: muted?'#888':'#000'
            }}
              onMouseEnter={()=>setHoverKey(m.key)}
              onMouseLeave={()=>setHoverKey(null)}
            >
              {/* 頭貼 */}
              <div onClick={()=>{setModalProfile({ ...prof, uid:m.uid });setShowModal(true);}}
                style={{
                  width:40, height:40, borderRadius:'50%', marginRight:10,
                  background:`url(${prof.pfp||''}) center/cover,#ccc`, cursor:'pointer'
              }}></div>

              {/* 文字 */}
              <div style={{ flexGrow:1 }}>
                <div style={{ fontWeight:'bold', cursor:'pointer' }}
                  onClick={()=>{setModalProfile({ ...prof, uid:m.uid });setShowModal(true);}}>
                  {prof.username || '使用者'}
                </div>
                <div>{muted ? '（已屏蔽）' : m.text}</div>
                <div style={{ fontSize:'0.8em', color:'#666' }}>
                  {new Date(m.timestamp).toLocaleString()}
                </div>
              </div>

              {/* 收回按鈕 */}
              {me && hoverKey===m.key && (
                <button onClick={()=>recallMessage(m.key)}
                  style={{
                    position:'absolute', right:0, top:10, background:'#ffd9d9',
                    border:'none', borderRadius:4, padding:'4px 8px', cursor:'pointer'
                  }}>
                  收回
                </button>
              )}
            </div>
          );
        })}
        <div ref={bottomRef}></div>
      </div>

      {/* 輸入框 */}
      <div style={{ display:'flex', gap:10 }}>
        <input
          style={{ flex:1, padding:8 }}
          placeholder="輸入訊息..."
          value={newMsg}
          onChange={e=>setNewMsg(e.target.value)}
          onKeyDown={e=>{ if(e.key==='Enter') sendMessage(); }}
        />
        <button onClick={sendMessage} style={{ padding:'0 20px' }}>發送</button>
      </div>

      {/* 個人檔案 Modal */}
      {showModal && modalProfile && (
        <ProfileModal
          profile={modalProfile}
          user={user}
          isBlocked={blocked.includes(modalProfile.uid)}
          onBlockToggle={()=>toggleBlock(modalProfile.uid)}
          onClose={()=>setShowModal(false)}
        />
      )}
    </div>
  );
}

export default ChatroomPage;
