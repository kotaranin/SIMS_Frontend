import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, ArrowLeft } from 'lucide-react';
import http from '../api/http';
import Button from '../components/Button';
import InputField from '../components/InputField';
import '../css/Register.css';

const Register = () => {
    const navigate = useNavigate();
    const [studyLevels, setStudyLevels] = useState([]);

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [studyLevelId, setStudyLevelId] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchStudyLevels = async () => {
            try {
                const response = await http.get('study-level');
                setStudyLevels(response.data);
                if (response.data.length > 0) {
                    setStudyLevelId(response.data[0].idStudyLevel);
                }
            } catch (error) {
                console.error("Greška pri učitavanju nivoa studija:", error);
            }
        };
        fetchStudyLevels();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim() || !question.trim() || !answer.trim() || !studyLevelId) {
            alert("Sva polja su obavezna!");
            return;
        }

        const selectedStudyLevel = studyLevels.find(sl => sl.idStudyLevel === parseInt(studyLevelId));

        const registrationData = {
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: password,
            question: question,
            answer: answer,
            admin: isAdmin,
            studyLevel: selectedStudyLevel
        };

        setLoading(false);
        try {
            await http.post('registration-request', registrationData);
            alert("Zahtev za registraciju je uspešno poslat! Sačekajte odobrenje administratora.");
            navigate('/login');
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Došlo je do greške prilikom registracije.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">
            <div className="register-card">
                <h2>Kreirajte zahtev za nalog</h2>
                <p className="register-subtitle">Unesite podatke kako bi administrator odobrio vaš nalog.</p>

                <form onSubmit={handleSubmit} className="register-form">
                    <div className="form-row">
                        <InputField label="Ime" placeholder="Unesite ime" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                        <InputField label="Prezime" placeholder="Unesite prezime" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                    </div>

                    <InputField label="E-mail adresa" type="email" placeholder="primer@fon.bg.ac.rs" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <InputField label="Lozinka" type="password" placeholder="Unesite lozinku" value={password} onChange={(e) => setPassword(e.target.value)} />

                    <InputField label="Sigurnosno pitanje" placeholder="Npr. Ime prvog kućnog ljubimca?" value={question} onChange={(e) => setQuestion(e.target.value)} />
                    <InputField label="Odgovor na pitanje" placeholder="Unesite odgovor" value={answer} onChange={(e) => setAnswer(e.target.value)} />

                    <div className="form-row select-row">
                        <div className="select-field-wrapper">
                            <label className="select-field-label">Nivo studija</label>
                            <select value={studyLevelId} onChange={(e) => setStudyLevelId(e.target.value)} className="select-field-dropdown">
                                {studyLevels.map((sl) => (
                                    <option key={sl.idStudyLevel} value={sl.idStudyLevel}>{sl.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="checkbox-wrapper">
                            <label className="checkbox-label">
                                <input type="checkbox" checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} />
                                Zahtevaj Admin prava
                            </label>
                        </div>
                    </div>

                    <div className="register-buttons">
                        <Link to="/login" className="back-to-login">
                            <ArrowLeft size={16} /> Nazad na login
                        </Link>
                        <Button type="submit" variant="primary" icon={<UserPlus size={18} />} disabled={loading}>
                            {loading ? "Slanje..." : "Pošalji zahtev"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;