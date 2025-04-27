// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { database } from '../services/firebase';
import { ref as dbRef, set, get } from 'firebase/database';

function ProfilePage({ user, onBack }) {
  const [pfpUrl, setPfpUrl] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    const profileRef = dbRef(database, `profiles/${user.uid}`);
    get(profileRef).then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setPfpUrl(data.pfp || '');
        setUsername(data.username || '');
        setBio(data.bio || '');
      }
    });
  }, [user.uid]);

  const handleSave = async () => {
    try {
      const profileRef = dbRef(database, `profiles/${user.uid}`);
      await set(profileRef, {
        pfp: pfpUrl, // ✅ 直接存 URL，不再上傳
        username: username,
        bio: bio
      });

      alert('個人檔案已儲存成功！');
      onBack();
    } catch (error) {
      console.error('儲存個人檔案失敗：', error);
      alert('儲存失敗：' + error.message);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>編輯個人檔案</h2>

      {pfpUrl && (
        <img
          src={pfpUrl}
          alt="大頭貼"
          style={{ width: '100px', height: '100px', borderRadius: '50%', marginBottom: '10px' }}
        />
      )}

      <div style={{ marginBottom: '10px' }}>
        <label>大頭貼圖片網址</label><br/>
        <input
          type="text"
          placeholder="請輸入圖片的網址"
          value={pfpUrl}
          onChange={(e) => setPfpUrl(e.target.value)}
          style={{ width: '100%', padding: '8px' }}
        />
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label>使用者名稱</label><br/>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ width: '100%', padding: '8px' }}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label>個人簡介</label><br/>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows="4"
          style={{ width: '100%', padding: '8px' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={handleSave} style={{ padding: '10px 20px' }}>儲存</button>
        <button onClick={onBack} style={{ padding: '10px 20px' }}>取消</button>
      </div>
    </div>
  );
}

export default ProfilePage;
