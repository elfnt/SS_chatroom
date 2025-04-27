import React, { useState, useEffect } from "react";
import { auth } from "./services/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import ChatroomPage from "./pages/ChatroomPage"; 

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleSignup = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert('註冊成功！');
      setEmail('');
      setPassword('');
    } catch (error) {
      alert(error.message);
    }
  };

  const handleSignin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert('登入成功！');
      setEmail('');
      setPassword('');
    } catch (error) {
      alert(error.message);
    }
  };

  const handleSignout = async () => {
    await signOut(auth);
    alert('已登出');
  };

  if (user) {
    return <ChatroomPage user={user} onSignOut={handleSignout} />; 
  }

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

export default App;
