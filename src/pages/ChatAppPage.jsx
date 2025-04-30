import React, { useState, useEffect } from 'react';
import { ref, push, onValue } from 'firebase/database';
import { database } from '../services/firebase';
import ChatroomPage from './ChatroomPage';

export default function ChatAppPage({ user, onSignOut, onEditProfile }) {
  const [rooms, setRooms]   = useState({});
  const [roomID, setRoomID] = useState(null);
  const [roomName, setRoomName] = useState('');

  /* 監聽自己有權讀的聊天室 */
  useEffect(() => {
    const off = onValue(ref(database, 'chatrooms'), snap => {
      const all = snap.val() || {};
      const mine = {};
      Object.entries(all).forEach(([rid, data]) => {
        if (data.members?.[user.uid]) mine[rid] = data;
      });
      setRooms(mine);
      if (!roomID && Object.keys(mine).length) setRoomID(Object.keys(mine)[0]);
    });
    return () => off();
  }, [user.uid, roomID]);

  /* 建立聊天室 */
  const createRoom = async () => {
    const name = roomName.trim();
    if (!name) { alert('請輸入聊天室名稱'); return; }
    const newRef = await push(ref(database, 'chatrooms'), {
      name,
      owner: user.uid,
      members: { [user.uid]: true }
    });
    setRoomName('');
    setRoomID(newRef.key);
  };

  return (
    <div className="container">   {/* flex 左右 */}
      {/* -------- 左側 Sidebar -------- */}
      <div className="sidebar">
        <div className="sidebar-header-row">
            {/* <h3>聊天室</h3> */}
          <input
            className="input room-input"
            placeholder="新的聊天室名稱"
            value={roomName}
            onChange={e => setRoomName(e.target.value)}
          />
        </div>
          <button className="button room-create-btn" onClick={createRoom}>
            建立
          </button>

        {/* 清單 */}
        {Object.entries(rooms).map(([rid, r]) => (
          <div key={rid}
               className="button"
               style={{background: rid === roomID ? '#4caf50' : '#8bc34a', textAlign:'left'}}
               onClick={() => setRoomID(rid)}>
            {r.name}<br/>
            <span style={{fontSize:12}}>{Object.keys(r.members||{}).length} 人</span>
          </div>
        ))}

        {/* 底部功能 */}
        <div style={{position:'absolute',bottom:15,left:15,right:15,display:'flex',gap:8}}>
          <button className="button" style={{flex:1}} onClick={onEditProfile}>Profile</button>
          <button className="button" style={{flex:1}} onClick={onSignOut}>Logout</button>
        </div>
      </div>

      {/* -------- 右側 Chat area -------- */}
      <div className="chat-area">
        {roomID
          ? <ChatroomPage user={user} roomID={roomID} />
          : <div style={{padding:30,color:'#666'}}>請先建立或點選左側聊天室</div>}
      </div>
    </div>
  );
}
