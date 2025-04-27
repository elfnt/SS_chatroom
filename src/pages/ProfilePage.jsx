import React, { useState, useEffect } from 'react';
import { auth, database } from '../services/firebase';
import { ref, get, set } from 'firebase/database';
import { updateEmail } from 'firebase/auth';

function ProfilePage({ user, onBack }) {
  const [username, setUsername] = useState('');
  const [email, setEmail]         = useState('');
  const [phone, setPhone]         = useState('');
  const [address, setAddress]     = useState('');
  const [bio, setBio]             = useState('');
  const [pfpUrl, setPfpUrl]       = useState('');
  const [allProfiles, setAllProfiles] = useState({});
  const isEmailPasswordUser = user.providerData[0]?.providerId === 'password';

  // 載入自己的 Profile + 所有 Profiles
  useEffect(() => {
    const loadProfiles = async () => {
      const snapshot = await get(ref(database, 'profiles'));
      if (snapshot.exists()) {
        const profiles = snapshot.val();
        setAllProfiles(profiles);

        if (profiles[user.uid]) {
            const myProfile = profiles[user.uid];
            setUsername(myProfile.username || '');
            setEmail(myProfile.email || user.email || '');
            setPhone(myProfile.phone || '');
            setAddress(myProfile.address || '');
            setBio(myProfile.bio || '');
            setPfpUrl(myProfile.pfp || '');
          } else {
            await set(ref(database, `profiles/${user.uid}`), {
              username: '',
              email: user.email,
              phone: '',
              address: '',
              bio: '',
              pfp: ''
            });
            setUsername('');
            setEmail(user.email || '');
            setPhone('');
            setAddress('');
            setBio('');
            setPfpUrl('');
          }
          
      }
    };
    loadProfiles();
  }, [user.uid, user.email]);

  const handleSave = async () => {
    const trimmedUsername = username.trim();
    const trimmedEmail    = email.trim().toLowerCase();

    // 檢查空白
    if (!trimmedUsername || !trimmedEmail) {
      alert('Username 和 Email 不能空白');
      return;
    }

    // 檢查 username、email 是否與別人重複
    for (const uid in allProfiles) {
      if (uid === user.uid) continue;
      const profile = allProfiles[uid];
      if (profile.username === trimmedUsername) {
        alert('這個 username 已被使用');
        return;
      }
      if (profile.email === trimmedEmail) {
        alert('這個 email 已被使用');
        return;
      }
    }

    // 如果 Email 有修改，且是 Email/Password 使用者，更新 Firebase Auth
    if (isEmailPasswordUser && trimmedEmail !== user.email) {
      try {
        await updateEmail(user, trimmedEmail);
      } catch (error) {
        alert('更新 email 失敗：' + error.message);
        return;
      }
    }

    // 寫回 Firebase Database
    await set(ref(database, `profiles/${user.uid}`), {
      username: trimmedUsername,
      email: trimmedEmail,
      phone,
      address,
      bio,
      pfp: pfpUrl
    });

    alert('個人檔案已更新成功！');
    onBack();  // 回到聊天室
  };

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: '0 auto' }}>
      <h2>編輯個人檔案</h2>

      {/* 頭貼 */}
      {pfpUrl && (
        <img src={pfpUrl} alt="pfp"
          style={{ width:100, height:100, borderRadius:'50%', marginBottom:10 }} />
      )}
      <div style={{ marginBottom:10 }}>
        <label>大頭貼圖片網址</label><br />
        <input
          type="text"
          value={pfpUrl}
          onChange={e => setPfpUrl(e.target.value)}
          style={{ width:'100%', padding:8 }}
        />
      </div>

      {/* username */}
      <div style={{ marginBottom:10 }}>
        <label>使用者名稱</label><br />
        <input
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          style={{ width:'100%', padding:8 }}
        />
      </div>

      {/* email */}
      <div style={{ marginBottom:10 }}>
        <label>Email</label><br />
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          disabled={!isEmailPasswordUser}   // Google登入不允許改 Email
          style={{
            width:'100%', padding:8,
            background: isEmailPasswordUser ? 'white' : '#eee'
          }}
        />
        {!isEmailPasswordUser && (
          <div style={{ fontSize:'0.8em', color:'#888' }}>
            （Google登入帳號，無法修改 Email）
          </div>
        )}
      </div>

      {/* phone */}
      <div style={{ marginBottom:10 }}>
        <label>手機號碼</label><br />
        <input
          type="text"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          style={{ width:'100%', padding:8 }}
        />
      </div>

      {/* address */}
      <div style={{ marginBottom:10 }}>
        <label>地址</label><br />
        <input
          type="text"
          value={address}
          onChange={e => setAddress(e.target.value)}
          style={{ width:'100%', padding:8 }}
        />
      </div>

      {/* bio */}
      <div style={{ marginBottom:20 }}>
        <label>個人簡介</label><br />
        <textarea
          value={bio}
          onChange={e => setBio(e.target.value)}
          rows={4}
          style={{ width:'100%', padding:8 }}
        />
      </div>

      {/* 按鈕 */}
      <div style={{ display:'flex', gap:10 }}>
        <button onClick={handleSave} style={{ padding:'8px 20px' }}>
          儲存
        </button>
        <button onClick={onBack} style={{ padding:'8px 20px', background:'#ddd' }}>
          返回
        </button>
      </div>
    </div>
  );
}

export default ProfilePage;
