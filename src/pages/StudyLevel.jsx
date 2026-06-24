import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Save } from 'lucide-react';
import http from '../api/http';

import Button from '../components/Button';
import InputField from '../components/InputField';
import SearchPanel from '../components/SearchPanel';
import Modal from '../components/Modal';
import '../css/StudyLevel.css';

const StudyLevel = () => {
    const [studyLevels, setStudyLevels] = useState([]);
    const [searchName, setSearchName] = useState('');
    const [loading, setLoading] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        studyPrograms: []
    });

    const fetchStudyLevels = async () => {
        setLoading(true);
        try {
            let url = 'study-level';
            if (searchName) {
                url = `study-level/search?name=${encodeURIComponent(searchName)}`;
            }
            const response = await http.get(url);
            setStudyLevels(response.data);
        } catch (error) {
            console.error("Greška pri učitavanju nivoa studija:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudyLevels();
    }, []);

    const handleReset = async () => {
        setSearchName('');
        setLoading(true);
        try {
            const response = await http.get('study-level');
            setStudyLevels(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const openAddModal = () => {
        setIsEditMode(false);
        setCurrentId(null);
        setFormData({
            name: '',
            studyPrograms: []
        });
        setIsModalOpen(true);
    };

    const openEditModal = async (id) => {
        setIsEditMode(true);
        setCurrentId(id);
        try {
            const response = await http.get(`study-level/${id}`);
            setFormData({
                name: response.data.name || '',
                studyPrograms: response.data.studyPrograms || []
            });
            setIsModalOpen(true);
        } catch (error) {
            console.error("Greška pri učitavanju detalja:", error);
            alert("Nije moguće učitati podatke o nivou studija.");
        }
    };

    const handleLevelNameChange = (val) => {
        setFormData(prev => ({ ...prev, name: val }));
    };

    const addStudyProgram = () => {
        setFormData(prev => ({
            ...prev,
            studyPrograms: [
                ...prev.studyPrograms,
                { idStudyProgram: null, name: '', modules: [] }
            ]
        }));
    };

    const handleProgramNameChange = (programIndex, val) => {
        setFormData(prev => {
            const updatedPrograms = prev.studyPrograms.map((prog, idx) => {
                if (idx === programIndex) {
                    return { ...prog, name: val };
                }
                return prog;
            });
            return { ...prev, studyPrograms: updatedPrograms };
        });
    };

    const addModule = (programIndex) => {
        setFormData(prev => {
            const updatedPrograms = prev.studyPrograms.map((prog, idx) => {
                if (idx === programIndex) {
                    return {
                        ...prog,
                        modules: [...(prog.modules || []), { idModule: null, name: '' }]
                    };
                }
                return prog;
            });
            return { ...prev, studyPrograms: updatedPrograms };
        });
    };

    const handleModuleNameChange = (programIndex, moduleIndex, val) => {
        setFormData(prev => {
            const updatedPrograms = prev.studyPrograms.map((prog, pIdx) => {
                if (pIdx === programIndex) {
                    const updatedModules = prog.modules.map((mod, mIdx) => {
                        if (mIdx === moduleIndex) {
                            return { ...mod, name: val };
                        }
                        return mod;
                    });
                    return { ...prog, modules: updatedModules };
                }
                return prog;
            });
            return { ...prev, studyPrograms: updatedPrograms };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            alert("Naziv nivoa studija je obavezno polje!");
            return;
        }

        const nameExists = studyLevels.some(sl =>
            sl.name.toLowerCase() === formData.name.toLowerCase() &&
            sl.idStudyLevel !== currentId
        );

        if (nameExists) {
            alert("Nivo studija sa ovim imenom već postoji!");
            return;
        }

        const programNames = new Set();
        for (const prog of formData.studyPrograms) {
            if (!prog.name.trim()) { alert("Naziv studijskog programa je obavezan!"); return; }
            if (programNames.has(prog.name.toLowerCase())) {
                alert(`Duplikat studijskog programa: ${prog.name}`);
                return;
            }
            programNames.add(prog.name.toLowerCase());

            const moduleNames = new Set();
            for (const mod of prog.modules) {
                if (!mod.name.trim()) { alert("Naziv modula je obavezan!"); return; }
                if (moduleNames.has(mod.name.toLowerCase())) {
                    alert(`Duplikat modula unutar programa ${prog.name}: ${mod.name}`);
                    return;
                }
                moduleNames.add(mod.name.toLowerCase());
            }
        }

        const payload = {
            idStudyLevel: isEditMode ? currentId : null,
            name: formData.name.trim(),
            studyPrograms: formData.studyPrograms.map(prog => ({
                idStudyProgram: prog.idStudyProgram,
                name: prog.name.trim(),
                studyLevel: null,
                modules: (prog.modules || []).map(mod => ({
                    idModule: mod.idModule,
                    name: mod.name.trim(),
                    studyProgram: null
                }))
            }))
        };

        try {
            if (isEditMode) {
                await http.put(`study-level/${currentId}`, payload);
            } else {
                await http.post('study-level', payload);
            }
            setIsModalOpen(false);
            fetchStudyLevels();
        } catch (error) {
            console.error("Greška prilikom čuvanja:", error);
            alert("Došlo je do greške na serveru prilikom validacije podataka.");
        }
    };

    return (
        <div className="study-level-container">
            <div className="study-level-header">
                <div>
                    <h1>Nivoi studija</h1>
                    <p>Pregled, unos i izmena nivoa studija, pripadajućih studijskih programa i njihovih modula.</p>
                </div>
                <Button variant="save" onClick={openAddModal} icon={<Plus size={18} />}>
                    Dodaj Nivo Studija
                </Button>
            </div>

            <SearchPanel onSearch={fetchStudyLevels} onReset={handleReset}>
                <InputField
                    label="Naziv nivoa studija"
                    placeholder="Pretraži po nazivu (npr. Osnovne...)"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                />
            </SearchPanel>

            <div className="table-wrapper">
                {loading ? (
                    <div className="loading-placeholder">Učitavanje podataka...</div>
                ) : (
                    <table className="study-level-table">
                        <thead>
                            <tr>
                                <th>Naziv nivoa studija</th>
                                <th>Studijski programi i moduli</th>
                                <th className="text-center" style={{ width: '100px' }}>Akcije</th>
                            </tr>
                        </thead>
                        <tbody>
                            {studyLevels.length > 0 ? (
                                studyLevels.map((level) => (
                                    <tr key={level.idStudyLevel}>
                                        <td className="level-name-cell">{level.name}</td>
                                        <td>
                                            <div className="nested-programs-list">
                                                {level.studyPrograms && level.studyPrograms.length > 0 ? (
                                                    level.studyPrograms.map((prog) => (
                                                        <div key={prog.idStudyProgram} className="program-badge-group">
                                                            <span className="program-title-badge">{prog.name}</span>
                                                            {prog.modules && prog.modules.length > 0 ? (
                                                                <div className="modules-inline-list">
                                                                    {prog.modules.map(mod => (
                                                                        <span key={mod.idModule} className="module-title-badge">
                                                                            {mod.name}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <span className="no-modules-badge">Nema modula</span>
                                                            )}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <span className="text-muted-gray">Nema definisanih programa</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="text-center">
                                            <Button
                                                variant="action-edit"
                                                title="Izmeni nivo studija"
                                                onClick={() => openEditModal(level.idStudyLevel)}
                                                icon={<Edit2 size={16} />}
                                            />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="no-data">
                                        Nema pronađenih nivoa studija.
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
                title={isEditMode ? "Izmena Nivoa Studija" : "Novi Nivo Studija"}
            >
                <form onSubmit={handleSubmit} className="study-level-form">
                    <InputField
                        label="Naziv Nivoa Studija *"
                        placeholder="Unesite naziv (npr. Master akademske studije)"
                        value={formData.name}
                        onChange={(e) => handleLevelNameChange(e.target.value)}
                        required
                    />

                    <div className="form-programs-section">
                        <div className="section-title-bar">
                            <h3>Studijski programi</h3>
                            <button type="button" className="btn-add-nested" onClick={addStudyProgram}>
                                <Plus size={16} /> Dodaj program
                            </button>
                        </div>

                        {formData.studyPrograms.map((program, pIndex) => (
                            <div key={pIndex} className="program-form-card">
                                <div className="program-card-header">
                                    <div style={{ flex: 1 }}>
                                        <InputField
                                            label={`Naziv programa #${pIndex + 1}`}
                                            placeholder="Npr. Informacioni sistemi i tehnologije"
                                            value={program.name}
                                            onChange={(e) => handleProgramNameChange(pIndex, e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="form-modules-section">
                                    <div className="modules-title-bar">
                                        <h4>Moduli za ovaj program</h4>
                                        <button type="button" className="btn-add-subnested" onClick={() => addModule(pIndex)}>
                                            <Plus size={14} /> Dodaj modul
                                        </button>
                                    </div>

                                    {program.modules && program.modules.map((module, mIndex) => (
                                        <div key={mIndex} className="module-form-row">
                                            <input
                                                type="text"
                                                className="sub-input-field"
                                                placeholder={`Naziv modula #${mIndex + 1}`}
                                                value={module.name}
                                                onChange={(e) => handleModuleNameChange(pIndex, mIndex, e.target.value)}
                                            />
                                        </div>
                                    ))}
                                    {(!program.modules || program.modules.length === 0) && (
                                        <p className="no-subdata-text">Nema dodatih modula za ovaj program.</p>
                                    )}
                                </div>
                            </div>
                        ))}

                        {formData.studyPrograms.length === 0 && (
                            <p className="no-data-text-neutral">Nema dodatih studijskih programa. Kliknite na "Dodaj program" iznad.</p>
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

export default StudyLevel;