// TODO: Replace with your own Firebase config
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
  };
  
  firebase.initializeApp(firebaseConfig);
  
  const auth = firebase.auth();
  const database = firebase.database();
  
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const signupBtn = document.getElementById('signup');
  const signinBtn = document.getElementById('signin');
  const signoutBtn = document.getElementById('signout');
  const chatroomDiv = document.getElementById('chatroom');
  const messagesDiv = document.getElementById('messages');
  const messageInput = document.getElementById('messageInput');
  const sendMessageBtn = document.getElementById('sendMessage');
  
  signupBtn.onclick = () => {
    const email = emailInput.value;
    const password = passwordInput.value;
    auth.createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        alert("Sign up successful!");
      })
      .catch((error) => {
        alert(error.message);
      });
  };
  
  signinBtn.onclick = () => {
    const email = emailInput.value;
    const password = passwordInput.value;
    auth.signInWithEmailAndPassword(email, password)
      .then(() => {
        document.getElementById('auth').style.display = 'none';
        chatroomDiv.style.display = 'block';
        signoutBtn.style.display = 'inline-block';
        listenForMessages();
      })
      .catch((error) => {
        alert(error.message);
      });
  };
  
  signoutBtn.onclick = () => {
    auth.signOut().then(() => {
      document.getElementById('auth').style.display = 'block';
      chatroomDiv.style.display = 'none';
      signoutBtn.style.display = 'none';
    });
  };
  
  sendMessageBtn.onclick = () => {
    const message = messageInput.value;
    const user = auth.currentUser;
    if (message && user) {
      const messageData = {
        uid: user.uid,
        email: user.email,
        text: message,
        timestamp: Date.now()
      };
      database.ref('messages').push(messageData);
      messageInput.value = '';
    }
  };
  
  function listenForMessages() {
    database.ref('messages').on('child_added', (snapshot) => {
      const msg = snapshot.val();
      const div = document.createElement('div');
      div.textContent = `[${msg.email}] ${msg.text}`;
      messagesDiv.appendChild(div);
    });
  }
  