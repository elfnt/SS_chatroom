import React, { useState, useEffect } from 'react';
import { auth, database } from './services/firebase';
import { ref, set, get } from 'firebase/database';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';
import ChatAppPage from './pages/ChatAppPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 監聽登入狀態
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await ensureProfileExists(currentUser);
        await checkProfileAndSetPage(currentUser);
      } else {
        setUser(null);
        setPage('login');
      }
    });
    return () => unsubscribe();
  }, []);

  // 確保 profiles/uid 存在
  const ensureProfileExists = async (currentUser) => {
    const snap = await get(ref(database, `profiles/${currentUser.uid}`));
    if (!snap.exists()) {
      await set(ref(database, `profiles/${currentUser.uid}`), {
        username: '',
        email: currentUser.email,
        phone: '',
        address: '',
        bio: '',
        pfp: currentUser.photoURL || ''
      });
    }
  };

  // 判斷要到 chatroom 還是要編輯 profile
  const checkProfileAndSetPage = async (currentUser) => {
    const profileRef = ref(database, `profiles/${currentUser.uid}`);
    const snapshot = await get(profileRef);

    if (!snapshot.exists() || !snapshot.val().username || snapshot.val().username.trim() === "") {
      setPage('profile');
    } else {
      setPage('chatroom');
    }
  };

  const signup = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await ensureProfileExists(user);
      alert('註冊成功');
    } catch (err) {
      alert(err.message);
    }
  };

  const signin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      alert('登入成功');
    } catch (err) {
      alert(err.message);
    }
  };

  const googleSignin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      await ensureProfileExists(user);
      alert('Google登入成功');
    } catch (err) {
      alert('Google登入失敗：' + err.message);
    }
  };

  const signout = async () => {
    await auth.signOut();
    setUser(null);
    setPage('login');
    alert('已登出');
  };

  if (!user || page === 'login') {
    return (
      <div className="auth-page">
        <h2 className="title">登入 / 註冊</h2>
  
        <input
          className="input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
  
        <input
          className="input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
  
        <button className="button" onClick={signup}>註冊</button>
        <button className="button" onClick={signin}>登入</button>
  
        <button
          className="button google"
          style={{ backgroundColor: '#4285F4' }}   
          onClick={googleSignin}
        >
          使用 Google 登入
        </button>
      </div>
    );
  }
  

  if (page === 'profile') {
    return <ProfilePage user={user} onBack={() => checkProfileAndSetPage(user)} />;
  }

  return <ChatAppPage user={user} onSignOut={signout} onEditProfile={() => setPage('profile')} />;
}

export default App;
