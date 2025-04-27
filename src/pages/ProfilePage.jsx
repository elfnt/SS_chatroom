import React, { useState, useEffect } from 'react';
import { auth, database } from '../services/firebase';
import { ref, get, set } from 'firebase/database';
import { updateEmail } from 'firebase/auth';

function ProfilePage({ user, onBack }) {
  const [username, setUsername]   = useState('');
  const [email, setEmail]         = useState('');
  const [phone, setPhone]         = useState('');
  const [address, setAddress]     = useState('');
  const [bio, setBio]             = useState('');
  const [pfpUrl, setPfpUrl]       = useState('');
  const [allProfiles, setAllProfiles] = useState({});
  const isEmailPasswordUser = user.providerData[0]?.providerId === 'password';

  /* 讀取 Profile */
  useEffect(() => {
    const load = async () => {
      const snap = await get(ref(database, 'profiles'));
      if (!snap.exists()) return;
      const profiles = snap.val();
      setAllProfiles(profiles);

      if (profiles[user.uid]) {
        const p = profiles[user.uid];
        setUsername(p.username || '');
        setEmail(p.email || user.email || '');
        setPhone(p.phone || '');
        setAddress(p.address || '');
        setBio(p.bio || '');
        setPfpUrl(p.pfp || '');
      } else {
        // 初始化
        await set(ref(database, `profiles/${user.uid}`), {
          username:'', email:user.email, phone:'', address:'', bio:'', pfp:''
        });
        setEmail(user.email || '');
      }
    };
    load();
  }, [user.uid, user.email]);

  /* 儲存 */
  const handleSave = async () => {
    const u = username.trim();
    const e = email.trim().toLowerCase();
    if (!u || !e) return alert('Username 和 Email 不能空白');

    // 唯一性檢查
    for (const uid in allProfiles) {
      if (uid === user.uid) continue;
      const p = allProfiles[uid];
      if (p.username === u) return alert('這個 username 已被使用');
      if (p.email === e)    return alert('這個 email 已被使用');
    }

    // 若為 email/password 使用者且真的改了 email → 更新 Auth
    if (isEmailPasswordUser && e !== user.email) {
      try { await updateEmail(user, e); }
      catch(err){ return alert('更新 email 失敗：' + err.message); }
    }

    await set(ref(database, `profiles/${user.uid}`), {
      username:u,email:e,phone,address,bio,pfp:pfpUrl
    });

    alert('個人檔案已更新成功！');
    onBack();
  };

  return (
    <div className="container">
      <h2 className="title">編輯個人檔案</h2>

      {/* 頭貼 */}
      {pfpUrl && <img src={pfpUrl} alt="pfp" style={{width:100,height:100,borderRadius:'50%',margin:'0 auto 15px',display:'block'}}/>}
      <input className="input" placeholder="大頭貼圖片網址" value={pfpUrl} onChange={e=>setPfpUrl(e.target.value)} />

      <input className="input" placeholder="使用者名稱" value={username} onChange={e=>setUsername(e.target.value)} />

      <input
        className="input"
        type="email"
        placeholder="Email"
        value={email}
        onChange={e=>setEmail(e.target.value)}
        disabled={!isEmailPasswordUser}
        style={{background:isEmailPasswordUser?'white':'#eee'}}
      />
      {!isEmailPasswordUser && <div style={{fontSize:'0.8em',color:'#888',marginBottom:10}}>（Google登入帳號，無法修改 Email）</div>}

      <input className="input" placeholder="手機號碼" value={phone}    onChange={e=>setPhone(e.target.value)} />
      <input className="input" placeholder="地址"       value={address} onChange={e=>setAddress(e.target.value)} />
      <textarea className="input" placeholder="個人簡介" rows={4} value={bio} onChange={e=>setBio(e.target.value)} />

      <div style={{display:'flex',gap:10,marginTop:15}}>
        <button className="button" onClick={handleSave}>儲存</button>
        <button className="button" style={{background:'#ddd'}} onClick={onBack}>返回</button>
      </div>
    </div>
  );
}

export default ProfilePage;
