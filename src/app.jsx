// src/App.jsx
import React, { useState, useEffect } from "react";
import { auth, database } from "./services/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { ref, get, set } from "firebase/database";
import ChatroomPage from "./pages/ChatroomPage";
import ProfilePage from "./pages/ProfilePage";

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('login');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await checkProfileAndSetPage(currentUser);
      } else {
        setUser(null);
        setPage('login');
      }
    });

    return () => unsubscribe();
  }, []);

  const checkProfileAndSetPage = async (currentUser) => {
    try {
      const profileRef = ref(database, `profiles/${currentUser.uid}`);
      const snapshot = await get(profileRef);

      if (!snapshot.exists() || !snapshot.val().username || snapshot.val().username.trim() === "") {
        setPage('profile');  // ✅ 沒有設定 username，留在個人檔案頁面
      } else {
        setPage('chatroom'); // ✅ 有 username，才能進聊天室
      }
    } catch (error) {
      console.error('檢查profile失敗：', error);
      setPage('profile'); // 如果錯誤，保險起見，強制要求設定個人資料
    }
  };

  const handleSignup = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      alert('註冊成功，請設定您的個人資料');
      // 初始化空的個人資料
      await set(ref(database, `profiles/${userCredential.user.uid}`), {
        pfp: '',
        username: '',
        bio: ''
      });
      setPage('profile');
      setEmail('');
      setPassword('');
    } catch (error) {
      alert(error.message);
    }
  };

  const handleSignin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      alert('登入成功！');
      await checkProfileAndSetPage(userCredential.user);
      setEmail('');
      setPassword('');
    } catch (error) {
      alert(error.message);
    }
  };

  const handleSignout = async () => {
    await signOut(auth);
    setUser(null);
    setPage('login');
    alert('已登出');
  };

  if (!user || page === 'login') {
    return (
      <div style={{ padding: '20px' }}>
        <h1>登入 / 註冊</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ marginBottom: '10px', display: 'block' }}
        />
        <input
          type="password"
          placeholder="密碼"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ marginBottom: '10px', display: 'block' }}
        />
        <button onClick={handleSignup} style={{ marginRight: '10px' }}>註冊</button>
        <button onClick={handleSignin}>登入</button>
      </div>
    );
  }

  if (page === 'profile') {
    return <ProfilePage user={user} onBack={async () => await checkProfileAndSetPage(user)} />;
  }

  return <ChatroomPage user={user} onSignOut={handleSignout} onEditProfile={() => setPage('profile')} />;
}

export default App;
