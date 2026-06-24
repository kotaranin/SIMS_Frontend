import React from 'react';
import PasswordResetForm from './PasswordResetForm';

const UserProfile = () => {
    const user = JSON.parse(localStorage.getItem('user')) || {};

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="auth-title">Moj Profil</h2>
                <div style={{ marginBottom: '20px', color: '#475569', fontSize: '14px' }}>
                    <p><strong>Ime i prezime:</strong> {user.firstName} {user.lastName}</p>
                    <p><strong>E-mail:</strong> {user.email}</p>
                    <p><strong>Uloga:</strong> {user.admin ? 'Administrator' : 'Službenik'}</p>
                </div>

                <hr style={{ margin: '20px 0', border: '0', borderTop: '1px solid #e2e8f0' }} />

                <PasswordResetForm initialEmail={user.email} />
            </div>
        </div>
    );
};

export default UserProfile;