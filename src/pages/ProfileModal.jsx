import React from 'react';

function ProfileModal({ profile, user, onClose, onBlockToggle, isBlocked }) {
  const isSelf = profile.uid === user.uid;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
    }}>
      <div className="profile-modal">
        {/* 頭貼 */}
        {profile.pfp && (
          <img
            src={profile.pfp}
            alt="pfp"
            style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', margin: '0 auto', display: 'block' }}
          />
        )}

        {/* 使用者名稱 */}
        <h3>{profile.username || '使用者'}</h3>

        {/* 基本資訊（置左） */}
        <div style={{ marginTop: 15, fontSize: '0.9em', color: '#555', textAlign: 'left' }}>
          {profile.email   && <div><strong>Email:</strong>   {profile.email}</div>}
          {profile.phone   && <div><strong>Phone:</strong>   {profile.phone}</div>}
          {profile.address && <div><strong>地址:</strong>    {profile.address}</div>}
        </div>

        {/* 簡介 */}
        {profile.bio && (
          <p style={{ marginTop: 10 }}>{profile.bio}</p>
        )}

        {/* 封鎖 / 解除封鎖 */}
        {!isSelf && (
          <button
            className="button"
            style={{ background: isBlocked ? '#aaffaa' : '#ffaaaa', marginTop: 10 }}
            onClick={() => onBlockToggle(profile.uid)}
          >
            {isBlocked ? '解除封鎖' : '封鎖此用戶'}
          </button>
        )}

        {/* 關閉 */}
        <button className="button" style={{ background: '#ccc', marginTop: 10 }} onClick={onClose}>
          關閉
        </button>
      </div>
    </div>
  );
}

export default ProfileModal;
