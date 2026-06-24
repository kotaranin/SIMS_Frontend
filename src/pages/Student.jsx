import React, { useState, useEffect } from 'react';
import { UserPlus, Edit2, Save } from 'lucide-react';
import http from '../api/http';
import Button from '../components/Button';
import InputField from '../components/InputField';
import SearchPanel from '../components/SearchPanel';
import Modal from '../components/Modal';
import '../css/Student.css';

const Student = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);

    const [cities, setCities] = useState([]);
    const [studyPrograms, setStudyPrograms] = useState([]);
    const [availableModules, setAvailableModules] = useState([]);

    const [searchParams, setSearchParams] = useState({
        indexNumber: '',
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        yearOfStudy: '',
        idCity: '',
        idStudyProgram: '',
        idModule: ''
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);

    const [formData, setFormData] = useState({
        indexNumber: '',
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        yearOfStudy: '',
        city: '',
        studyProgram: '',
        module: ''
    });

    const fetchStudents = async () => {
        setLoading(true);
        try {
            let url = 'student';
            const hasSearchValues = Object.values(searchParams).some(val => val !== '');

            if (hasSearchValues) {
                const queryParts = [];
                Object.entries(searchParams).forEach(([key, val]) => {
                    if (val) queryParts.push(`${key}=${encodeURIComponent(val)}`);
                });
                url = `student/search?${queryParts.join('&')}`;
            }

            const response = await http.get(url);
            setStudents(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchLookups = async () => {
        try {
            const [citiesRes, programsRes] = await Promise.all([
                http.get('city'),
                http.get('study-program')
            ]);
            setCities(citiesRes.data);
            setStudyPrograms(programsRes.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchStudents();
        fetchLookups();
    }, []);

    const handleReset = async () => {
        const cleared = {
            indexNumber: '',
            firstName: '',
            lastName: '',
            dateOfBirth: '',
            yearOfStudy: '',
            idCity: '',
            idStudyProgram: '',
            idModule: ''
        };
        setSearchParams(cleared);
        setLoading(true);
        try {
            const response = await http.get('student');
            setStudents(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const openAddModal = () => {
        setIsEditMode(false);
        setCurrentId(null);
        setAvailableModules([]);
        setFormData({
            indexNumber: '',
            firstName: '',
            lastName: '',
            dateOfBirth: '',
            yearOfStudy: '',
            city: '',
            studyProgram: '',
            module: ''
        });
        setIsModalOpen(true);
    };

    const openEditModal = async (id) => {
        setIsEditMode(true);
        setCurrentId(id);
        try {
            const response = await http.get(`student/${id}`);
            const student = response.data;

            if (student.studyProgram) {
                const fullProgram = studyPrograms.find(p => p.idStudyProgram === student.studyProgram.idStudyProgram);
                setAvailableModules(fullProgram?.modules || []);
            } else {
                setAvailableModules([]);
            }

            setFormData({
                indexNumber: student.indexNumber || '',
                firstName: student.firstName || '',
                lastName: student.lastName || '',
                dateOfBirth: student.dateOfBirth || '',
                yearOfStudy: student.yearOfStudy || '',
                city: student.city ? JSON.stringify(student.city) : '',
                studyProgram: student.studyProgram ? JSON.stringify(student.studyProgram) : '',
                module: student.module ? JSON.stringify(student.module) : ''
            });
            setIsModalOpen(true);
        } catch (error) {
            console.error(error);
            alert("Nije moguće učitati podatke o studentu.");
        }
    };

    const handleFormChange = (field, value) => {
        if (field === 'studyProgram') {
            if (!value) {
                setFormData(prev => ({ ...prev, studyProgram: '', module: '' }));
                setAvailableModules([]);
            } else {
                const parsedProgram = JSON.parse(value);
                setFormData(prev => ({ ...prev, studyProgram: value, module: '' }));
                setAvailableModules(parsedProgram.modules || []);
            }
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.indexNumber || !formData.firstName || !formData.lastName ||
            !formData.dateOfBirth || !formData.yearOfStudy || !formData.city || !formData.studyProgram) {
            alert("Molimo popunite sva obavezna polja!");
            return;
        }

        const indexRegex = /^\d{4}\/\d+$/;
        if (!indexRegex.test(formData.indexNumber.trim())) {
            alert("Broj indeksa mora biti u formatu GGGG/BBBB (npr. 2026/0015).");
            return;
        }

        const birthDate = new Date(formData.dateOfBirth);
        if (birthDate > new Date()) {
            alert("Datum rođenja ne može biti u budućnosti.");
            return;
        }

        const year = parseInt(formData.yearOfStudy, 10);
        if (isNaN(year) || year < 1) {
            alert("Godina studija mora biti pozitivan ceo broj.");
            return;
        }

        const isDuplicate = students.some(
            (s) =>
                s.indexNumber.toLowerCase().trim() === formData.indexNumber.toLowerCase().trim() &&
                s.idStudent !== currentId
        );

        if (isDuplicate) {
            alert("Student sa ovim brojem indeksa već postoji u sistemu!");
            return;
        }

        const parsedCity = JSON.parse(formData.city);
        const parsedProgram = JSON.parse(formData.studyProgram);
        const parsedModule = formData.module ? JSON.parse(formData.module) : null;

        const payload = {
            idStudent: isEditMode ? currentId : null,
            indexNumber: formData.indexNumber.trim(),
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim(),
            dateOfBirth: formData.dateOfBirth,
            yearOfStudy: parseInt(formData.yearOfStudy, 10),
            city: {
                idCity: parsedCity.idCity,
                name: parsedCity.name,
                country: parsedCity.country
            },
            studyProgram: {
                idStudyProgram: parsedProgram.idStudyProgram,
                name: parsedProgram.name,
                studyLevel: parsedProgram.studyLevel
            },
            module: parsedModule ? {
                idModule: parsedModule.idModule,
                name: parsedModule.name
            } : null
        };

        try {
            if (isEditMode) {
                await http.put(`student/${currentId}`, payload);
            } else {
                await http.post('student', payload);
            }
            setIsModalOpen(false);
            fetchStudents();
        } catch (error) {
            console.error(error);
            alert("Proverite validnost podataka.");
        }
    };

    return (
        <div className="student-container">
            <div className="student-header">
                <div>
                    <h1>Studenti</h1>
                    <p>Evidencija, pretraga i ažuriranje podataka o studentima, njihovim studijskim programima i modulima.</p>
                </div>
                <button className="btn-add-student" onClick={openAddModal}>
                    <UserPlus size={18} style={{ marginRight: '8px' }} /> Dodaj studenta
                </button>
            </div>

            <SearchPanel onSearch={fetchStudents} onReset={handleReset}>
                <div className="search-grid-inputs">
                    <InputField
                        label="Broj indeksa"
                        placeholder="Npr. 2026/0015"
                        value={searchParams.indexNumber}
                        onChange={(e) => setSearchParams({ ...searchParams, indexNumber: e.target.value })}
                    />
                    <InputField
                        label="Ime"
                        placeholder="Pretraži po imenu"
                        value={searchParams.firstName}
                        onChange={(e) => setSearchParams({ ...searchParams, firstName: e.target.value })}
                    />
                    <InputField
                        label="Prezime"
                        placeholder="Pretraži po prezimenu"
                        value={searchParams.lastName}
                        onChange={(e) => setSearchParams({ ...searchParams, lastName: e.target.value })}
                    />
                    <InputField
                        label="Godina studija"
                        type="number"
                        placeholder="Npr. 1"
                        value={searchParams.yearOfStudy}
                        onChange={(e) => setSearchParams({ ...searchParams, yearOfStudy: e.target.value })}
                    />

                    <div className="form-group-select">
                        <label className="select-label">Grad</label>
                        <select
                            className="custom-select"
                            value={searchParams.idCity}
                            onChange={(e) => setSearchParams({ ...searchParams, idCity: e.target.value })}
                        >
                            <option value="">Svi gradovi</option>
                            {cities.map(c => <option key={c.idCity} value={c.idCity}>{c.name}</option>)}
                        </select>
                    </div>

                    <div className="form-group-select">
                        <label className="select-label">Studijski program</label>
                        <select
                            className="custom-select"
                            value={searchParams.idStudyProgram}
                            onChange={(e) => {
                                const progId = e.target.value;
                                setSearchParams({ ...searchParams, idStudyProgram: progId, idModule: '' });
                            }}
                        >
                            <option value="">Svi programi</option>
                            {studyPrograms.map(p => <option key={p.idStudyProgram} value={p.idStudyProgram}>{p.name}</option>)}
                        </select>
                    </div>

                    <div className="form-group-select">
                        <label className="select-label">Modul</label>
                        <select
                            className="custom-select"
                            value={searchParams.idModule}
                            disabled={!searchParams.idStudyProgram}
                            onChange={(e) => setSearchParams({ ...searchParams, idModule: e.target.value })}
                        >
                            <option value="">Svi moduli</option>
                            {searchParams.idStudyProgram &&
                                studyPrograms.find(p => p.idStudyProgram === parseInt(searchParams.idStudyProgram, 10))
                                    ?.modules?.map(m => <option key={m.idModule} value={m.idModule}>{m.name}</option>)
                            }
                        </select>
                    </div>

                    <InputField
                        label="Datum rođenja"
                        type="date"
                        value={searchParams.dateOfBirth}
                        onChange={(e) => setSearchParams({ ...searchParams, dateOfBirth: e.target.value })}
                    />
                </div>
            </SearchPanel>

            <div className="table-wrapper">
                {loading ? (
                    <div className="loading-placeholder">Učitavanje podataka...</div>
                ) : (
                    <table className="student-table">
                        <thead>
                            <tr>
                                <th>Indeks</th>
                                <th>Ime i Prezime</th>
                                <th>Datum rođenja</th>
                                <th>Godina</th>
                                <th>Mesto stanovanja</th>
                                <th>Studijski program / Modul</th>
                                <th className="text-center" style={{ width: '80px' }}>Akcije</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.length > 0 ? (
                                students.map((student) => (
                                    <tr key={student.idStudent}>
                                        <td className="index-cell">{student.indexNumber}</td>
                                        <td className="name-cell">{student.firstName} {student.lastName}</td>
                                        <td>{student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString('sr-RS') : '-'}</td>
                                        <td className="text-center"><span className="year-badge">{student.yearOfStudy}.</span></td>
                                        <td>
                                            <div className="city-info">
                                                <strong>{student.city?.name}</strong>
                                                <span className="country-sub">{student.city?.country?.name}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="program-display-stack">
                                                <span className="main-program-txt">{student.studyProgram?.name}</span>
                                                {student.module ? (
                                                    <span className="sub-module-txt">Smer/Modul: {student.module.name}</span>
                                                ) : (
                                                    <span className="no-module-txt">Opšti smer / Nema modula</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="text-center">
                                            <Button
                                                variant="action-edit"
                                                title="Izmeni studenta"
                                                onClick={() => openEditModal(student.idStudent)}
                                                icon={<Edit2 size={16} />}
                                            />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="no-data">
                                        Nema pronađenih studenata na osnovu zadatih kriterijuma.
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
                title={isEditMode ? "Izmena Podataka o Studentu" : "Unos Novog Studenta"}
            >
                <form onSubmit={handleSubmit} className="student-form-layout">
                    <div className="form-row-two-col">
                        <InputField
                            label="Broj indeksa *"
                            placeholder="GGGG/BBBB"
                            value={formData.indexNumber}
                            onChange={(e) => handleFormChange('indexNumber', e.target.value)}
                            required
                        />
                        <InputField
                            label="Godina studija *"
                            type="number"
                            placeholder="Npr. 1"
                            value={formData.yearOfStudy}
                            onChange={(e) => handleFormChange('yearOfStudy', e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-row-two-col">
                        <InputField
                            label="Ime *"
                            placeholder="Unesite ime"
                            value={formData.firstName}
                            onChange={(e) => handleFormChange('firstName', e.target.value)}
                            required
                        />
                        <InputField
                            label="Prezime *"
                            placeholder="Unesite prezime"
                            value={formData.lastName}
                            onChange={(e) => handleFormChange('lastName', e.target.value)}
                            required
                        />
                    </div>

                    <InputField
                        label="Datum Rođenja *"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => handleFormChange('dateOfBirth', e.target.value)}
                        required
                    />

                    <div className="form-group-select">
                        <label className="select-label">Grad / Mesto stanovanja *</label>
                        <select
                            className="custom-select"
                            value={formData.city}
                            onChange={(e) => handleFormChange('city', e.target.value)}
                            required
                        >
                            <option value="" disabled>Izaberite grad...</option>
                            {cities.map(c => (
                                <option key={c.idCity} value={JSON.stringify(c)}>
                                    {c.name} ({c.country?.name})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group-select">
                        <label className="select-label">Studijski program *</label>
                        <select
                            className="custom-select"
                            value={formData.studyProgram}
                            onChange={(e) => handleFormChange('studyProgram', e.target.value)}
                            required
                        >
                            <option value="" disabled>Izaberite program...</option>
                            {studyPrograms.map(p => (
                                <option key={p.idStudyProgram} value={JSON.stringify(p)}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group-select">
                        <label className="select-label">Izborni Modul</label>
                        <select
                            className="custom-select"
                            value={formData.module}
                            disabled={!formData.studyProgram || availableModules.length === 0}
                            onChange={(e) => handleFormChange('module', e.target.value)}
                        >
                            <option value="">Opšti smer (Bez modula)</option>
                            {availableModules.map(m => (
                                <option key={m.idModule} value={JSON.stringify(m)}>
                                    {m.name}
                                </option>
                            ))}
                        </select>
                        {!formData.studyProgram && (
                            <p className="select-hint-text">Prvo izaberite studijski program kako biste videli module.</p>
                        )}
                        {formData.studyProgram && availableModules.length === 0 && (
                            <p className="select-hint-text green-hint">Ovaj program nema definisane ugnježdene module.</p>
                        )}
                    </div>

                    <div className="form-actions-row">
                        <button type="button" className="btn-form-cancel" onClick={() => setIsModalOpen(false)}>
                            Otkaži
                        </button>
                        <button type="submit" className="btn-form-save">
                            <Save size={16} style={{ marginRight: '6px' }} /> Sačuvaj
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Student;