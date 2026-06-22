import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';
import http from '../api/http';
import '../css/Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await http.post('auth/login', { email, password });

            const { token, user } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            navigate('/');
        } catch (err) {
            if (err.response && err.response.status === 401) {
                setError('Pogrešan e-mail ili lozinka. Pokušajte ponovo.');
            } else {
                setError('Došlo je do greške prilikom povezivanja sa serverom.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page-wrapper">
            <div className="login-card">
                <div className="login-brand">
                    <div className="login-logo-box">
                        <GraduationCap size={36} className="login-logo-icon" />
                    </div>
                    <h2>SIMS Fakultet</h2>
                    <p>Prijavite se na studentski administrativni sistem</p>
                </div>

                {error && (
                    <div className="login-error-badge">
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="login-input-group">
                        <label>E-mail adresa</label>
                        <div className="login-input-wrapper">
                            <Mail size={18} className="input-icon" />
                            <input
                                type="email"
                                placeholder="ime.prezime@fon.bg.ac.rs"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="login-input-group">
                        <label>Lozinka</label>
                        <div className="login-input-wrapper">
                            <Lock size={18} className="input-icon" />
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-login-submit" disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 size={16} className="spinner-icon" />
                                Prijavljivanje...
                            </>
                        ) : (
                            'Prijavi se'
                        )}
                    </button>

                    <div className="login-footer-links">
                        <p>Nemate nalog? <Link to="/register" className="register-link">Registrujte se ovde</Link></p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;