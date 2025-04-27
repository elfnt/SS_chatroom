import React from 'react';

function ProfileModal({ profile, user, onClose, onBlockToggle, isBlocked }) {
  const isSelf = profile.uid === user.uid;

  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.5)',
      display:'flex', justifyContent:'center', alignItems:'center', zIndex:1000
    }}>
      <div style={{
        background:'#fff', padding:20, borderRadius:10, textAlign:'center', width:280
      }}>
        {profile.pfp && <img src={profile.pfp} alt="pfp"
          style={{ width:100, height:100, borderRadius:'50%', objectFit:'cover' }} />}
        <h3 style={{ margin:'10px 0' }}>{profile.username || '使用者'}</h3>
        <p>{profile.bio || ''}</p>

        {!isSelf && (
          <button onClick={onBlockToggle}
            style={{
              padding:'8px 16px', borderRadius:6,
              background:isBlocked?'#ffaaaa':'#aaffaa', border:'none', marginBottom:10
            }}>
            {isBlocked?'解除封鎖':'封鎖此用戶'}
          </button>
        )}
        <br/>
        <button onClick={onClose}
          style={{ padding:'6px 20px', borderRadius:6, background:'#ddd', border:'none' }}>
          關閉
        </button>
      </div>
    </div>
  );
}

export default ProfileModal;
