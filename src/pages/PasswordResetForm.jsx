import React, { useState, useEffect } from 'react';
import http from '../api/http';

const PasswordResetForm = ({ initialEmail = "", onPasswordChanged }) => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState(initialEmail);
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        if (initialEmail) {
            setEmail(initialEmail);
            fetchSecurityQuestion(initialEmail);
        }
    }, [initialEmail]);

    const fetchSecurityQuestion = async (targetEmail) => {
        try {
            setError("");
            const res = await http.get(`student-officer/get-question?email=${targetEmail}`);
            setQuestion(res.data);
            setStep(2);
        } catch (err) {
            setError("Korisnik sa ovom e-mail adresom nije pronađen.");
        }
    };

    const handleVerifyAnswer = async (e) => {
        e.preventDefault();
        try {
            setError("");
            const res = await http.post('student-officer/reset-password/verify-question', { email, answer });
            if (res.data === true) {
                setStep(3);
            } else {
                setError("Netačan odgovor na sigurnosno pitanje!");
            }
        } catch (err) {
            setError("Greška prilikom provere odgovora.");
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError("Lozinke se ne podudaraju!");
            return;
        }

        try {
            setError("");
            await http.put('student-officer/reset-password/update', { email, newPassword });
            setSuccess("Lozinka je uspešno promenjena!");
            setStep(4);
            if (onPasswordChanged) onPasswordChanged();
        } catch (err) {
            setError("Greška prilikom izmene lozinke.");
        }
    };

    return (
        <div className="password-reset-box">
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {step === 1 && (
                <form onSubmit={(e) => { e.preventDefault(); fetchSecurityQuestion(email); }}>
                    <h3 className="auth-title">Zaboravljena lozinka</h3>
                    <div className="form-group-custom">
                        <label>E-mail adresa</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn-login-submit" style={{ width: '100%' }}>Dalje</button>
                </form>
            )}

            {step === 2 && (
                <form onSubmit={handleVerifyAnswer}>
                    <h3 className="auth-title">Sigurnosna provera</h3>
                    <p style={{ fontSize: '13px', color: '#64748b' }}><strong>Pitanje:</strong> {question}</p>
                    <div className="form-group-custom">
                        <label>Vaš odgovor</label>
                        <input type="text" value={answer} onChange={(e) => setAnswer(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn-login-submit" style={{ width: '100%' }}>Proveri odgovor</button>
                </form>
            )}

            {step === 3 && (
                <form onSubmit={handlePasswordUpdate}>
                    <h3 className="auth-title">Nova lozinka</h3>
                    <div className="form-group-custom">
                        <label>Nova lozinka</label>
                        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                    </div>
                    <div className="form-group-custom">
                        <label>Potvrdite lozinku</label>
                        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn-login-submit" style={{ width: '100%' }}>Sačuvaj</button>
                </form>
            )}

            {step === 4 && (
                <div style={{ textAlign: 'center', color: '#166534', padding: '10px' }}>
                    <p>Lozinka je uspešno promenjena.</p>
                </div>
            )}
        </div>
    );
};

export default PasswordResetForm;