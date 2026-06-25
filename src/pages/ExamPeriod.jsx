import React, { useState, useEffect } from 'react';
import { CalendarPlus, Edit2 } from 'lucide-react';
import http from '../api//http';
import Button from '../components/Button';
import InputField from '../components/InputField';
import SearchPanel from '../components/SearchPanel';
import Modal from '../components/Modal';
import '../css/ExamPeriod.css';
import { formatDate } from '../utils/formatDate';

const ExamPeriod = () => {
    const [examPeriods, setExamPeriods] = useState([]);
    const [searchName, setSearchName] = useState('');
    const [searchStartDate, setSearchStartDate] = useState('');
    const [searchEndDate, setSearchEndDate] = useState('');
    const [loading, setLoading] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentPeriodId, setCurrentPeriodId] = useState(null);
    const [formName, setFormName] = useState('');
    const [formStartDate, setFormStartDate] = useState('');
    const [formEndDate, setFormEndDate] = useState('');

    const fetchExamPeriods = async () => {
        setLoading(true);
        try {
            let url = 'exam-period';

            if (searchName || searchStartDate || searchEndDate) {
                url = `exam-period/search?name=${encodeURIComponent(searchName)}&startDate=${searchStartDate}&endDate=${searchEndDate}`;
            }

            const response = await http.get(url);
            setExamPeriods(response.data);
        } catch (error) {
            console.error("Greška pri dobavljanju ispitnih rokova:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExamPeriods();
    }, []);

    const handleReset = async () => {
        setSearchName('');
        setSearchStartDate('');
        setSearchEndDate('');
        setLoading(true);
        try {
            const response = await http.get('exam-period');
            setExamPeriods(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const openAddModal = () => {
        setIsEditMode(false);
        setCurrentPeriodId(null);
        setFormName('');
        setFormStartDate('');
        setFormEndDate('');
        setIsModalOpen(true);
    };

    const openEditModal = async (id) => {
        try {
            const response = await http.get(`exam-period/${id}`);
            setIsEditMode(true);
            setCurrentPeriodId(id);
            setFormName(response.data.name);

            const formattedStartDate = response.data.startDate ? response.data.startDate.split('T')[0] : '';
            const formattedEndDate = response.data.endDate ? response.data.endDate.split('T')[0] : '';

            setFormStartDate(formattedStartDate);
            setFormEndDate(formattedEndDate);
            setIsModalOpen(true);
        } catch (error) {
            console.error("Greška pri dobavljanju detalja o roku:", error);
            alert("Nije moguće učitati podatke o ispitnom roku.");
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        if (!formName.trim() || !formStartDate || !formEndDate) {
            alert("Sva polja su obavezna!");
            return;
        }

        if (new Date(formEndDate) <= new Date(formStartDate)) {
            alert("Datum kraja mora biti posle datuma početka!");
            return;
        }

        const periodData = {
            name: formName,
            startDate: formStartDate,
            endDate: formEndDate
        };

        try {
            if (isEditMode) {
                await http.put(`exam-period/${currentPeriodId}`, periodData);
            } else {
                await http.post('exam-period', periodData);
            }
            setIsModalOpen(false);
            fetchExamPeriods();
        } catch (error) {
            console.error("Greška prilikom čuvanja roka:", error);
            alert("Došlo je do greške na serveru.");
        }
    };

    return (
        <div className="period-container">
            <div className="period-header">
                <div>
                    <h1>Ispitni rokovi</h1>
                    <p>Pregled, pretraga i definisanje ispitnih rokova.</p>
                </div>
                <Button variant="primary" icon={<CalendarPlus size={18} />} onClick={openAddModal}>
                    Dodaj ispitni rok
                </Button>
            </div>

            <SearchPanel onSearch={fetchExamPeriods} onReset={handleReset}>
                <InputField
                    label="Naziv ispitnog roka"
                    placeholder="Npr. jun 2026..."
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                />
                <InputField
                    label="Datum početka"
                    type="date"
                    value={searchStartDate}
                    onChange={(e) => setSearchStartDate(e.target.value)}
                />
                <InputField
                    label="Datum završetka"
                    type="date"
                    value={searchEndDate}
                    onChange={(e) => setSearchEndDate(e.target.value)}
                />
            </SearchPanel>

            <div className="table-wrapper">
                {loading ? (
                    <div className="loading-placeholder">Učitavanje podataka...</div>
                ) : (
                    <table className="period-table">
                        <thead>
                            <tr>
                                <th>Naziv ispitnog roka</th>
                                <th>Datum početka</th>
                                <th>Datum završetka</th>
                                <th className="text-center">Akcije</th>
                            </tr>
                        </thead>
                        <tbody>
                            {examPeriods.length > 0 ? (
                                examPeriods.map((period) => (
                                    <tr key={period.idExamPeriod}>
                                        <td className="font-semibold">{period.name}</td>
                                        <td>{formatDate(period.startDate)}</td>
                                        <td>{formatDate(period.endDate)}</td>
                                        <td className="text-center actions-cell">
                                            <Button
                                                variant="action-edit"
                                                title="Ažuriraj"
                                                onClick={() => openEditModal(period.idExamPeriod)}
                                                icon={<Edit2 size={16} />}
                                            />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="no-data">
                                        Nema pronađenih ispitnih rokova u bazi za unete kriterijume.
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
                title={isEditMode ? "Izmena podataka o ispitnom roku" : "Unošenje novog ispitnog roka"}
            >
                <form onSubmit={handleFormSubmit} className="modal-form">
                    <InputField
                        label="Naziv ispitnog roka *"
                        placeholder="Unesite naziv (npr. jul 2026)"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                    />
                    <InputField
                        label="Datum početka *"
                        type="date"
                        value={formStartDate}
                        onChange={(e) => setFormStartDate(e.target.value)}
                    />
                    <InputField
                        label="Datum završetka *"
                        type="date"
                        value={formEndDate}
                        onChange={(e) => setFormEndDate(e.target.value)}
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

export default ExamPeriod;