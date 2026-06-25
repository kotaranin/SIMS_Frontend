import React, { useState, useEffect } from 'react';
import { UserPlus, Edit2 } from 'lucide-react';
import http from '../api/http';
import Button from '../components/Button';
import InputField from '../components/InputField';
import SearchPanel from '../components/SearchPanel';
import Modal from '../components/Modal';
import '../css/Teacher.css';

const Teacher = () => {
    const [teachers, setTeachers] = useState([]);
    const [searchFirstName, setSearchFirstName] = useState('');
    const [searchLastName, setSearchLastName] = useState('');
    const [loading, setLoading] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentTeacherId, setCurrentTeacherId] = useState(null);
    const [formFirstName, setFormFirstName] = useState('');
    const [formLastName, setFormLastName] = useState('');

    const fetchTeachers = async () => {
        setLoading(true);
        try {
            let url = 'teacher';
            if (searchFirstName || searchLastName) {
                url = `teacher/search?firstName=${searchFirstName}&lastName=${searchLastName}`;
            }
            const response = await http.get(url);
            setTeachers(response.data);
        } catch (error) {
            console.error("Greška pri dobavljanju nastavnika:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeachers();
    }, []);

    const handleReset = async () => {
        setSearchFirstName('');
        setSearchLastName('');
        setLoading(true);
        try {
            const response = await http.get('teacher');
            setTeachers(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const openAddModal = () => {
        setIsEditMode(false);
        setCurrentTeacherId(null);
        setFormFirstName('');
        setFormLastName('');
        setIsModalOpen(true);
    };

    const openEditModal = async (id) => {
        try {
            const response = await http.get(`teacher/${id}`);
            setIsEditMode(true);
            setCurrentTeacherId(id);
            setFormFirstName(response.data.firstName);
            setFormLastName(response.data.lastName);
            setIsModalOpen(true);
        } catch (error) {
            console.error("Greška pri dobavljanju detalja o nastavniku:", error);
            alert("Nije moguće učitati podatke o nastavniku.");
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        if (!formFirstName.trim() || !formLastName.trim()) {
            alert("Sva polja su obavezna!");
            return;
        }

        const teacherData = {
            firstName: formFirstName,
            lastName: formLastName
        };

        try {
            if (isEditMode) {
                await http.put(`teacher/${currentTeacherId}`, teacherData);
            } else {
                await http.post('teacher', teacherData);
            }

            setIsModalOpen(false);
            fetchTeachers();
        } catch (error) {
            console.error("Greška prilikom čuvanja podataka:", error);
            alert("Došlo je do greške na serveru.");
        }
    };

    return (
        <div className="teacher-container">
            <div className="teacher-header">
                <div>
                    <h1>Nastavnici</h1>
                    <p>Pregled, pretraga i upravljanje podacima o nastavnom osoblju.</p>
                </div>
                <Button variant="primary" icon={<UserPlus size={18} />} onClick={openAddModal}>
                    Dodaj nastavnika
                </Button>
            </div>

            <SearchPanel onSearch={fetchTeachers} onReset={handleReset}>
                <InputField
                    label="Ime"
                    placeholder="Pretraži po imenu..."
                    value={searchFirstName}
                    onChange={(e) => setSearchFirstName(e.target.value)}
                />
                <InputField
                    label="Prezime"
                    placeholder="Pretraži po prezimenu..."
                    value={searchLastName}
                    onChange={(e) => setSearchLastName(e.target.value)}
                />
            </SearchPanel>

            <div className="table-wrapper">
                {loading ? (
                    <div className="loading-placeholder">Učitavanje podataka...</div>
                ) : (
                    <table className="teacher-table">
                        <thead>
                            <tr>
                                <th>Ime nastavnika</th>
                                <th>Prezime nastavnika</th>
                                <th className="text-center">Akcije</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teachers.length > 0 ? (
                                teachers.map((teacher) => (
                                    <tr key={teacher.idTeacher}>
                                        <td>{teacher.firstName}</td>
                                        <td>{teacher.lastName}</td>
                                        <td className="text-center actions-cell">
                                            <Button
                                                variant="action-edit"
                                                title="Ažuriraj"
                                                onClick={() => openEditModal(teacher.idTeacher)}
                                                icon={<Edit2 size={16} />}
                                            />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="no-data">
                                        Nema pronađenih nastavnika u bazi.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={isEditMode ? "Izmena podataka o nastavniku" : "Unošenje novog nastavnika"}
            >
                <form onSubmit={handleFormSubmit} className="modal-form">
                    <InputField
                        label="Ime nastavnika *"
                        placeholder="Unesite ime..."
                        value={formFirstName}
                        onChange={(e) => setFormFirstName(e.target.value)}
                    />
                    <InputField
                        label="Prezime nastavnika *"
                        placeholder="Unesite prezime..."
                        value={formLastName}
                        onChange={(e) => setFormLastName(e.target.value)}
                    />

                    <div className="modal-footer-buttons">
                        <Button variant="reset" onClick={() => setIsModalOpen(false)}>
                            Otkaži
                        </Button>
                        <Button type="submit" variant="primary">
                            {isEditMode ? "Sačuvaj izmene" : "Kreiraj"}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Teacher;