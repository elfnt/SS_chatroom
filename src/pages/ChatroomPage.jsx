import React, { useState, useEffect, useRef } from 'react';
import { ref, push, remove, onChildAdded, onChildRemoved, get ,set} from 'firebase/database';
import { database } from '../services/firebase';
import ProfileModal from './ProfileModal';

export default function ChatroomPage({ user, roomID }) {
  const [messages, setMessages]   = useState([]);
  const [profiles, setProfiles]   = useState({});
  const [newMsg, setNewMsg]       = useState('');
  const [hoverKey, setHoverKey]   = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalProfile, setModalProfile] = useState(null);
  const [blocked, setBlocked]     = useState(JSON.parse(localStorage.getItem('blockedUsers') || '[]'));
  const [lastSentKey, setLastSentKey]   = useState(null);
  const [searchText, setSearchText]     = useState('');
  const bottomRef = useRef(null);
  const [inviteName, setInviteName] = useState('');


  /* 監聽訊息 */
  useEffect(() => {
    setMessages([]);
    const mRef = ref(database, `chatrooms/${roomID}/messages`);
    const offAdd = onChildAdded(mRef, snap => {
      setMessages(p => p.find(m => m.key === snap.key) ? p : [...p, { key: snap.key, ...snap.val() }]);
    });
    const offRem = onChildRemoved(mRef, snap => {
      setMessages(p => p.filter(m => m.key !== snap.key));
    });
    return () => { offAdd(); offRem(); };
  }, [roomID]);

  /* lazy 取 profile */
  useEffect(() => {
    (async () => {
      const unknown = messages.map(m => m.uid)
        .filter(uid => !profiles[uid])
        .filter((uid, i, a) => a.indexOf(uid) === i);
      if (!unknown.length) return;
      const upd = {};
      for (const uid of unknown) {
        const s = await get(ref(database, `profiles/${uid}`));
        if (s.exists()) upd[uid] = s.val();
      }
      if (Object.keys(upd).length) setProfiles(p => ({ ...p, ...upd }));
    })();
  }, [messages, profiles]);

  useEffect(() => bottomRef.current?.scrollIntoView({ behavior: 'auto' }), [messages]);

  /* 發送 / 收回 */
  const sendMsg = async () => {
    if (!newMsg.trim()) return;
    const newRef = await push(ref(database, `chatrooms/${roomID}/messages`), {
      uid: user.uid, text: newMsg.trim(), timestamp: Date.now()
    });
    setNewMsg(''); setLastSentKey(newRef.key);
  };
  const recall = key => remove(ref(database, `chatrooms/${roomID}/messages/${key}`));

  const toggleBlock = uid => {
    if (uid === user.uid) return alert('不能封鎖自己！');
    const upd = blocked.includes(uid) ? blocked.filter(i => i !== uid) : [...blocked, uid];
    setBlocked(upd);
    localStorage.setItem('blockedUsers', JSON.stringify(upd));
    setShowModal(false);
  };

  const shown = messages.filter(m => m.text.toLowerCase().includes(searchText.toLowerCase()));

  const handleInvite = async () => {
    const name = inviteName.trim();
    if (!name) return alert('請輸入 username');
    if (name === profiles[user.uid]?.username) return alert('不能邀請自己');
  
    const snapshot = await get(ref(database, 'profiles'));
    const allProfiles = snapshot.val() || {};
  
    const matchedUid = Object.keys(allProfiles).find(
      uid => allProfiles[uid].username === name
    );
  
    if (!matchedUid) {
      return alert('找不到該 username');
    }
  
    if (matchedUid === user.uid) {
      return alert('不能邀請自己');
    }
  
    const memberRef = ref(database, `chatrooms/${roomID}/members/${matchedUid}`);
    const memberSnap = await get(memberRef);
    if (memberSnap.exists()) {
      return alert('此用戶已在聊天室中');
    }
  
    await set(memberRef, true);
    alert('已成功邀請該用戶！');
    setInviteName('');
  };
  

  return (
    <>
    {/* --- 邀請用戶欄 --- */}
    <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
      <input
        className="input"
        placeholder="輸入使用者名稱以邀請"
        value={inviteName}
        onChange={e => setInviteName(e.target.value)}
      />
      <button className="button" style={{ flexShrink: 0, width: 90 }} onClick={handleInvite}>
        邀請
      </button>
    </div>

      {/* 搜尋 */}
      <input className="input" placeholder="搜尋訊息…" value={searchText}
             onChange={e => setSearchText(e.target.value)} />

      {/* 訊息清單 */}
      <div className="message-list">
        {shown.map(m => {
          const prof = profiles[m.uid] || {};
          const me   = m.uid === user.uid;
          const mute = blocked.includes(m.uid);

          return (
            <div key={m.key}
                 className={`message-item ${m.key === lastSentKey ? 'super-animate' : ''}`}
                 style={{ opacity: mute ? 0.5 : 1, color: mute ? '#888' : '#000' }}
                 onMouseEnter={() => setHoverKey(m.key)}
                 onMouseLeave={() => setHoverKey(null)}>
              {/* 頭貼 */}
              <div className="avatar"
                   style={{ background: `url(${prof.pfp || ''}) center/cover,#3f51b5` }}
                   onClick={() => { setModalProfile({ ...prof, uid: m.uid }); setShowModal(true); }}/>
              {/* 文字 */}
              <div className="msg-body">
                <div style={{ fontWeight:'bold', cursor:'pointer' }}
                     onClick={() => { setModalProfile({ ...prof, uid: m.uid }); setShowModal(true); }}>
                  {prof.username || '使用者'}
                </div>
                <div>{mute ? '（已屏蔽）' : m.text}</div>
                <div style={{ fontSize:'0.8em', color:'#666' }}>
                  {new Date(m.timestamp).toLocaleString()}
                </div>
              </div>
              {/* 收回 */}
              {me && hoverKey === m.key && (
                <button className="recall-btn" onClick={() => recall(m.key)}>
                  收回
                </button>
              )}
            </div>
          );
        })}
        <div ref={bottomRef}></div>
      </div>

      {/* 送訊息列 */}
      <div className="send-bar">
        <input className="input" style={{ flex:1 }} placeholder="輸入訊息…"
               value={newMsg} onChange={e => setNewMsg(e.target.value)}
               onKeyDown={e => { if (e.key === 'Enter') sendMsg(); }}/>
        <button className="button" style={{ width:90 }} onClick={sendMsg}>發送</button>
      </div>

      {/* Modal */}
      {showModal && modalProfile && (
        <ProfileModal
          profile={modalProfile}
          user={user}
          isBlocked={blocked.includes(modalProfile.uid)}
          onBlockToggle={() => toggleBlock(modalProfile.uid)}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
