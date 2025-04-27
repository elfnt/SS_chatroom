import React, { useState, useEffect } from 'react';
import { auth, database } from './services/firebase';
import { ref, set, get } from 'firebase/database';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';
import ChatroomPage from './pages/ChatroomPage';
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
      <div style={{ padding: 20, maxWidth: 400, margin: '0 auto' }}>
        <h2>登入 / 註冊</h2>

        <div style={{ marginBottom: 10 }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ width: '100%', padding: 8 }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', padding: 8 }}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <button onClick={signup} style={{ width: '100%', padding: 10 }}>註冊</button>
        </div>

        <div style={{ marginBottom: 10 }}>
          <button onClick={signin} style={{ width: '100%', padding: 10 }}>登入</button>
        </div>

        <div style={{ marginBottom: 10 }}>
          <button onClick={googleSignin}
            style={{
              width: '100%', padding: 10,
              backgroundColor: '#4285F4', color: 'white', border: 'none'
            }}>
            使用 Google 登入
          </button>
        </div>
      </div>
    );
  }

  if (page === 'profile') {
    return <ProfilePage user={user} onBack={() => checkProfileAndSetPage(user)} />;
  }

  return <ChatroomPage user={user} onSignOut={signout} onEditProfile={() => setPage('profile')} />;
}

export default App;
