import React, { useState, useEffect } from 'react';
import { UserPlus, Edit2, Download, FileText, Save, Trash2 } from 'lucide-react';
import http from '../api/http';

import Button from '../components/Button';
import InputField from '../components/InputField';
import SearchPanel from '../components/SearchPanel';
import Modal from '../components/Modal';
import '../css/Internship.css';

const Internship = () => {
    const [internships, setInternships] = useState([]);
    const [loading, setLoading] = useState(false);

    const [teachers, setTeachers] = useState([]);
    const [examPeriods, setExamPeriods] = useState([]);
    const [studentOfficers, setStudentOfficers] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [students, setStudents] = useState([]);

    const [searchParams, setSearchParams] = useState({
        startDate: '',
        endDate: '',
        defenseDate: '',
        grade: '',
        idTeacher: '',
        idExamPeriod: '',
        idStudentOfficer: '',
        idCompany: '',
        idStudent: ''
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);

    const [formData, setFormData] = useState({
        startDate: '',
        endDate: '',
        defenseDate: '',
        grade: '',
        teacher: '',
        examPeriod: '',
        studentOfficer: '',
        company: '',
        student: '',
        fileName: '',
        fileContent: '',
        idReport: null
    });

    const fetchInternships = async () => {
        setLoading(true);
        try {
            let url = 'internship';
            const hasSearchValues = Object.values(searchParams).some(val => val !== '');

            if (hasSearchValues) {
                const queryParts = [];
                Object.entries(searchParams).forEach(([key, val]) => {
                    if (val) queryParts.push(`${key}=${encodeURIComponent(val)}`);
                });
                url = `internship/search?${queryParts.join('&')}`;
            }

            const response = await http.get(url);
            setInternships(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchLookups = async () => {
        try {
            const [teachersRes, examPeriodsRes, officersRes, companiesRes, studentsRes] = await Promise.all([
                http.get('teacher'),
                http.get('exam-period'),
                http.get('student-officer'),
                http.get('company'),
                http.get('student')
            ]);
            setTeachers(teachersRes.data);
            setExamPeriods(examPeriodsRes.data);
            setStudentOfficers(officersRes.data);
            setCompanies(companiesRes.data);
            setStudents(studentsRes.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchInternships();
        fetchLookups();
    }, []);

    const handleReset = async () => {
        const cleared = {
            startDate: '',
            endDate: '',
            defenseDate: '',
            grade: '',
            idTeacher: '',
            idExamPeriod: '',
            idStudentOfficer: '',
            idCompany: '',
            idStudent: ''
        };
        setSearchParams(cleared);
        setLoading(true);
        try {
            const response = await http.get('internship');
            setInternships(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const base64String = reader.result.split(',')[1];
            setFormData(prev => ({
                ...prev,
                fileName: file.name,
                fileContent: base64String
            }));
        };
        reader.readAsDataURL(file);
    };

    const openAddModal = () => {
        setIsEditMode(false);
        setCurrentId(null);
        setFormData({
            startDate: '',
            endDate: '',
            defenseDate: '',
            grade: '',
            teacher: '',
            examPeriod: '',
            studentOfficer: '',
            company: '',
            student: '',
            fileName: '',
            fileContent: '',
            idReport: null
        });
        setIsModalOpen(true);
    };

    const openEditModal = async (id) => {
        setIsEditMode(true);
        setCurrentId(id);
        try {
            const response = await http.get(`internship/${id}`);
            const data = response.data;

            const selectedTeacher = teachers.find(t => t.idTeacher === data.teacher?.idTeacher) || data.teacher;
            const selectedExamPeriod = examPeriods.find(ep => ep.idExamPeriod === data.examPeriod?.idExamPeriod) || data.examPeriod;

            const selectedOfficer = studentOfficers.find(so =>
                (so.idStudentOfficer && so.idStudentOfficer === data.studentOfficer?.idStudentOfficer) ||
                (so.idRegistrationRequest && so.idRegistrationRequest === data.studentOfficer?.idRegistrationRequest)
            ) || data.studentOfficer;

            const selectedCompany = companies.find(c => c.idCompany === data.company?.idCompany) || data.company;
            const selectedStudent = students.find(s => s.idStudent === data.student?.idStudent) || data.student;

            setFormData({
                startDate: data.startDate || '',
                endDate: data.endDate || '',
                defenseDate: data.defenseDate || '',
                grade: data.grade || '',
                teacher: selectedTeacher ? JSON.stringify(selectedTeacher) : '',
                examPeriod: selectedExamPeriod ? JSON.stringify(selectedExamPeriod) : '',
                studentOfficer: selectedOfficer ? JSON.stringify(selectedOfficer) : '',
                company: selectedCompany ? JSON.stringify(selectedCompany) : '',
                student: selectedStudent ? JSON.stringify(selectedStudent) : '',
                fileName: data.report?.fileName || '',
                fileContent: data.report?.fileContent || '',
                idReport: data.report?.idReport || null
            });
            setIsModalOpen(true);
        } catch (error) {
            console.error(error);
            alert("Nije moguće učitati podatke o stručnoj praksi.");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Da li ste sigurni da želite da obrišete ovu stručnu praksu?")) {
            try {
                await http.delete(`internship/${id}`);
                fetchInternships();
            } catch (error) {
                console.error(error);
                alert("Greška pri brisanju stručne prakse.");
            }
        }
    };

    const downloadFile = (fileName, base64Content) => {
        if (!base64Content) {
            alert("Fajl nije pronađen ili je oštećen.");
            return;
        }
        const link = document.createElement('a');
        link.href = `data:application/octet-stream;base64,${base64Content}`;
        link.download = fileName;
        link.click();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.teacher || !formData.examPeriod || !formData.studentOfficer || !formData.company || !formData.student) {
            alert("Sva relaciona polja su obavezna!");
            return;
        }

        if (!formData.fileContent) {
            alert("Morate odabrati prateći dokument (izveštaj) za stručnu praksu!");
            return;
        }

        const parsedTeacher = JSON.parse(formData.teacher);
        const parsedExamPeriod = JSON.parse(formData.examPeriod);
        const parsedOfficer = JSON.parse(formData.studentOfficer);
        const parsedCompany = JSON.parse(formData.company);
        const parsedStudent = JSON.parse(formData.student);

        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        const defense = new Date(formData.defenseDate);

        if (!(start <= end && end <= defense)) {
            alert("Nevalidan redosled datuma! Redosled mora biti: Početak <= Kraj <= Odbrana.");
            return;
        }

        const examStart = new Date(parsedExamPeriod.startDate);
        const examEnd = new Date(parsedExamPeriod.endDate);

        if (defense < examStart || defense > examEnd) {
            alert(`Datum odbrane mora biti u okviru ispitnog roka: ${parsedExamPeriod.name} (${parsedExamPeriod.startDate} - ${parsedExamPeriod.endDate})`);
            return;
        }

        const alreadyPassed = internships.some(i =>
            i.student.idStudent === parsedStudent.idStudent &&
            i.grade === 'POLOZIO' &&
            (!isEditMode || i.idInternship !== currentId)
        );

        if (alreadyPassed) {
            alert("Ovaj student već ima evidentiranu položenu stručnu praksu!");
            return;
        }

        const payload = {
            idInternship: isEditMode ? currentId : null,
            startDate: formData.startDate,
            endDate: formData.endDate,
            defenseDate: formData.defenseDate,
            grade: formData.grade,
            teacher: parsedTeacher,
            examPeriod: parsedExamPeriod,
            studentOfficer: parsedOfficer,
            company: parsedCompany,
            student: parsedStudent,
            report: {
                idReport: formData.idReport,
                fileName: formData.fileName,
                fileContent: formData.fileContent
            }
        };

        try {
            if (isEditMode) {
                await http.put(`internship/${currentId}`, payload);
            } else {
                await http.post('internship', payload);
            }
            setIsModalOpen(false);
            fetchInternships();
        } catch (error) {
            console.error(error);
            alert("Proverite validnost unetih podataka. Server je odbio zahtev.");
        }
    };

    return (
        <div className="internship-container">
            <div className="internship-header">
                <div>
                    <h1>Stručne prakse</h1>
                    <p>Evidencija, pretraga i ažuriranje stručnih praksi studenata i pripadajućih izveštaja.</p>
                </div>
                <button className="btn-add-internship" onClick={openAddModal}>
                    <UserPlus size={18} style={{ marginRight: '8px' }} /> Dodaj praksu
                </button>
            </div>

            <SearchPanel onSearch={fetchInternships} onReset={handleReset}>
                <div className="search-grid-inputs">
                    <InputField
                        label="Datum početka"
                        type="date"
                        value={searchParams.startDate}
                        onChange={(e) => setSearchParams({ ...searchParams, startDate: e.target.value })}
                    />
                    <InputField
                        label="Datum kraja"
                        type="date"
                        value={searchParams.endDate}
                        onChange={(e) => setSearchParams({ ...searchParams, endDate: e.target.value })}
                    />
                    <InputField
                        label="Datum odbrane"
                        type="date"
                        value={searchParams.defenseDate}
                        onChange={(e) => setSearchParams({ ...searchParams, defenseDate: e.target.value })}
                    />

                    <div className="form-group-select">
                        <label className="select-label">Ocena</label>
                        <select
                            className="custom-select"
                            value={searchParams.grade}
                            onChange={(e) => setSearchParams({ ...searchParams, grade: e.target.value })}
                        >
                            <option value="">Sve ocene</option>
                            <option value="POLOZIO">POLOZIO</option>
                            <option value="NIJE_POLOZIO">NIJE_POLOZIO</option>
                        </select>
                    </div>

                    <div className="form-group-select">
                        <label className="select-label">Student</label>
                        <select
                            className="custom-select"
                            value={searchParams.idStudent}
                            onChange={(e) => setSearchParams({ ...searchParams, idStudent: e.target.value })}
                        >
                            <option value="">Svi studenti</option>
                            {students.map(s => <option key={s.idStudent} value={s.idStudent}>{s.firstName} {s.lastName} ({s.indexNumber})</option>)}
                        </select>
                    </div>

                    <div className="form-group-select">
                        <label className="select-label">Kompanija</label>
                        <select
                            className="custom-select"
                            value={searchParams.idCompany}
                            onChange={(e) => setSearchParams({ ...searchParams, idCompany: e.target.value })}
                        >
                            <option value="">Sve kompanije</option>
                            {companies.map(c => <option key={c.idCompany} value={c.idCompany}>{c.name}</option>)}
                        </select>
                    </div>

                    <div className="form-group-select">
                        <label className="select-label">Nastavnik</label>
                        <select
                            className="custom-select"
                            value={searchParams.idTeacher}
                            onChange={(e) => setSearchParams({ ...searchParams, idTeacher: e.target.value })}
                        >
                            <option value="">Svi nastavnici</option>
                            {teachers.map(t => <option key={t.idTeacher} value={t.idTeacher}>{t.firstName} {t.lastName}</option>)}
                        </select>
                    </div>

                    <div className="form-group-select">
                        <label className="select-label">Ispitni rok</label>
                        <select
                            className="custom-select"
                            value={searchParams.idExamPeriod}
                            onChange={(e) => setSearchParams({ ...searchParams, idExamPeriod: e.target.value })}
                        >
                            <option value="">Svi rokovi</option>
                            {examPeriods.map(ep => <option key={ep.idExamPeriod} value={ep.idExamPeriod}>{ep.name}</option>)}
                        </select>
                    </div>
                </div>
            </SearchPanel>

            <div className="table-wrapper">
                {loading ? (
                    <div className="loading-placeholder">Učitavanje podataka...</div>
                ) : (
                    <table className="internship-table">
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Kompanija</th>
                                <th>Ispitni rok / Odbrana</th>
                                <th>Ocena</th>
                                <th>Nastavnik</th>
                                <th>Dokumentacija</th>
                                <th className="text-center" style={{ width: '110px' }}>Akcije</th>
                            </tr>
                        </thead>
                        <tbody>
                            {internships.length > 0 ? (
                                internships.map((item) => (
                                    <tr key={item.idInternship}>
                                        <td className="font-semibold">
                                            {item.student?.firstName} {item.student?.lastName}<br />
                                            <span className="text-muted">{item.student?.indexNumber}</span>
                                        </td>
                                        <td className="font-semibold">{item.company?.name}</td>
                                        <td>
                                            <div className="date-stack">
                                                <span className="exam-period-name-txt">{item.examPeriod?.name || 'Nema roka'}</span>
                                                <span className="defense-date-txt">
                                                    Odbrana: {item.defenseDate ? new Date(item.defenseDate).toLocaleDateString('sr-RS') : ''}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`grade-badge ${item.grade === 'NIJE_POLOZIO' ? 'badge-failed' : 'badge-passed'}`}>
                                                {item.grade}
                                            </span>
                                        </td>
                                        <td>{item.teacher?.firstName} {item.teacher?.lastName}</td>
                                        <td>
                                            {item.report ? (
                                                <button
                                                    className="file-download-link"
                                                    onClick={() => downloadFile(item.report.fileName, item.report.fileContent)}
                                                    title="Preuzmi i pregledaj dokument"
                                                >
                                                    <FileText size={16} />
                                                    <span className="file-name-truncate">{item.report.fileName}</span>
                                                    <Download size={14} className="dl-icon" />
                                                </button>
                                            ) : (
                                                <span className="no-file">Nema fajla</span>
                                            )}
                                        </td>
                                        <td className="text-center">
                                            <div className="actions-button-group">
                                                <Button
                                                    variant="action-edit"
                                                    title="Izmeni stručnu praksu"
                                                    onClick={() => openEditModal(item.idInternship)}
                                                    icon={<Edit2 size={16} />}
                                                />
                                                <button
                                                    className="btn-action-delete"
                                                    title="Obriši stručnu praksu"
                                                    onClick={() => handleDelete(item.idInternship)}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="no-data">
                                        Nema pronađenih stručnih praksi.
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
                title={isEditMode ? "Izmena Podataka o Stručnoj Praksi" : "Unošenje Nove Stručne Prakse"}
            >
                <form onSubmit={handleSubmit} className="internship-form-layout">
                    <div className="form-row-two-col">
                        <InputField
                            label="Datum početka *"
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            required
                        />
                        <InputField
                            label="Datum završetka *"
                            type="date"
                            value={formData.endDate}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-row-two-col">
                        <InputField
                            label="Datum odbrane *"
                            type="date"
                            value={formData.defenseDate}
                            onChange={(e) => setFormData({ ...formData, defenseDate: e.target.value })}
                            required
                        />
                        <div className="form-group-select">
                            <label className="select-label">Konačna ocena *</label>
                            <select
                                className="custom-select"
                                value={formData.grade}
                                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                                required
                            >
                                <option value="" disabled>Izaberite ocenu...</option>
                                <option value="POLOZIO">POLOZIO</option>
                                <option value="NIJE_POLOZIO">NIJE_POLOZIO</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row-two-col">
                        <div className="form-group-select">
                            <label className="select-label">Student *</label>
                            <select
                                className="custom-select"
                                value={formData.student}
                                onChange={(e) => setFormData({ ...formData, student: e.target.value })}
                                required
                            >
                                <option value="" disabled>Izaberite studenta...</option>
                                {students.map(s => (
                                    <option key={s.idStudent} value={JSON.stringify(s)}>
                                        {s.firstName} {s.lastName} ({s.indexNumber})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group-select">
                            <label className="select-label">Kompanija *</label>
                            <select
                                className="custom-select"
                                value={formData.company}
                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                required
                            >
                                <option value="" disabled>Izaberite kompaniju...</option>
                                {companies.map(c => (
                                    <option key={c.idCompany} value={JSON.stringify(c)}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-row-three-col">
                        <div className="form-group-select">
                            <label className="select-label">Nastavnik *</label>
                            <select
                                className="custom-select"
                                value={formData.teacher}
                                onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                                required
                            >
                                <option value="" disabled>Izaberite nastavnika...</option>
                                {teachers.map(t => (
                                    <option key={t.idTeacher} value={JSON.stringify(t)}>{t.firstName} {t.lastName}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group-select">
                            <label className="select-label">Ispitni rok *</label>
                            <select
                                className="custom-select"
                                value={formData.examPeriod}
                                onChange={(e) => setFormData({ ...formData, examPeriod: e.target.value })}
                                required
                            >
                                <option value="" disabled>Izaberite rok...</option>
                                {examPeriods.map(ep => (
                                    <option key={ep.idExamPeriod} value={JSON.stringify(ep)}>{ep.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group-select">
                            <label className="select-label">Evidentirao *</label>
                            <select
                                className="custom-select"
                                value={formData.studentOfficer}
                                onChange={(e) => setFormData({ ...formData, studentOfficer: e.target.value })}
                                required
                            >
                                <option value="" disabled>Izaberite službenika...</option>
                                {studentOfficers.map(so => (
                                    <option key={so.idStudentOfficer || so.idRegistrationRequest} value={JSON.stringify(so)}>
                                        {so.firstName} {so.lastName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="file-upload-section">
                        <label className="select-label">Izveštaj o stručnoj praksi (Word / PDF) *</label>
                        <div className="file-input-wrapper">
                            <input
                                type="file"
                                id="internship-file"
                                accept=".pdf,.doc,.docx"
                                onChange={handleFileChange}
                                className="hidden-file-input"
                            />
                            <label htmlFor="internship-file" className="file-custom-button">
                                Izaberi novi fajl sa sistema
                            </label>
                            {formData.fileName && (
                                <div className="selected-file-badge">
                                    <FileText size={14} />
                                    <span className="file-badge-name">{formData.fileName}</span>
                                </div>
                            )}
                        </div>
                        <p className="file-hint">Izborom novog fajla automatski zamenjujete prethodnu verziju izveštaja unutar ove prijave.</p>
                    </div>

                    <div className="form-actions-row">
                        <button type="button" className="btn-form-cancel" onClick={() => setIsModalOpen(false)}>
                            Otkaži
                        </button>
                        <button type="submit" className="btn-form-save">
                            <Save size={16} style={{ marginRight: '6px' }} /> Sačuvaj izmene
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Internship;