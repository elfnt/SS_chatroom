import React from 'react';

function ProfileModal({ profile, user, onClose, onBlockToggle, isBlocked }) {
  const isSelf = profile.uid === user.uid;

  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.5)',
      display:'flex', justifyContent:'center', alignItems:'center', zIndex:1000
    }}>
      <div style={{
        background:'#fff', padding:20, borderRadius:10, width:300
      }}>
        {/* 頭貼 */}
        {profile.pfp && (
          <img src={profile.pfp} alt="pfp"
            style={{ width:100, height:100, borderRadius:'50%', objectFit:'cover', margin:'0 auto', display:'block' }}
          />
        )}

        {/* 使用者名稱 */}
        <h3 style={{ textAlign: 'center', marginTop: 10 }}>{profile.username || '使用者'}</h3>

        {/* 基本資訊（置左） */}
        <div style={{ marginTop: 15, fontSize: '0.9em', color: '#555', textAlign: 'left' }}>
          {profile.email && <div><strong>Email:</strong> {profile.email}</div>}
          {profile.phone && <div><strong>Phone:</strong> {profile.phone}</div>}
          {profile.address && <div><strong>地址:</strong> {profile.address}</div>}
        </div>

        {/* 簡介 */}
        {profile.bio && (
          <p style={{ marginTop:10, fontSize:'0.9em', color:'#666', textAlign:'left' }}>
            {profile.bio}
          </p>
        )}

        {/* 封鎖按鈕 */}
        {!isSelf && (
          <button
            onClick={() => onBlockToggle(profile.uid)}
            style={{
              marginTop: '10px',
              padding: '8px 20px',
              borderRadius: '6px',
              backgroundColor: isBlocked ? '#ffaaaa' : '#aaffaa',
              border: 'none',
              width: '100%'
            }}
          >
            {isBlocked ? '解除封鎖' : '封鎖此用戶'}
          </button>
        )}

        {/* 關閉按鈕 */}
        <button
          onClick={onClose}
          style={{
            marginTop: '10px',
            padding: '8px 20px',
            borderRadius: '6px',
            backgroundColor: '#ccc',
            border: 'none',
            width: '100%'
          }}
        >
          關閉
        </button>
      </div>
    </div>
  );
}

export default ProfileModal;
