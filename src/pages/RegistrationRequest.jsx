import React, { useState, useEffect } from 'react';
import { UserCheck, UserX } from 'lucide-react';
import http from '../api/http';

import Button from '../components/Button';
import InputField from '../components/InputField';
import SearchPanel from '../components/SearchPanel';
import Modal from '../components/Modal';
import '../css/RegistrationRequest.css';

const RegistrationRequest = () => {
    const [requests, setRequests] = useState([]);
    const [searchFirstName, setSearchFirstName] = useState('');
    const [searchLastName, setSearchLastName] = useState('');
    const [loading, setLoading] = useState(false);

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            let url = 'registration-request';
            if (searchFirstName || searchLastName) {
                url = `registration-request/search?firstName=${encodeURIComponent(searchFirstName)}&lastName=${encodeURIComponent(searchLastName)}`;
            }
            const response = await http.get(url);
            setRequests(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleReset = async () => {
        setSearchFirstName('');
        setSearchLastName('');
        setLoading(true);
        try {
            const response = await http.get('registration-request');
            setRequests(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveClick = (request) => {
        const isAdminRequest = request.admin === true || request.admin === "b'1'" || request.admin === 1;

        if (isAdminRequest) {
            setSelectedRequest(request);
            setIsConfirmModalOpen(true);
        } else {
            sendApproval(request, false);
        }
    };

    const handleConfirmAdmin = (shouldBeAdmin) => {
        setIsConfirmModalOpen(false);
        if (selectedRequest) {
            sendApproval(selectedRequest, shouldBeAdmin);
        }
    };

    const sendApproval = async (request, adminStatus) => {
        try {
            const finalAdminValue = typeof adminStatus === 'boolean' ? adminStatus : (adminStatus === true || adminStatus === 1);

            const studentOfficerPayload = {
                idStudentOfficer: null,
                firstName: request.firstName,
                lastName: request.lastName,
                email: request.email,
                passwordSalt: request.password,
                hashedPassword: request.hashedPassword,
                question: request.question,
                answerSalt: request.answer,
                hashedAnswer: request.hashedAnswer,
                admin: finalAdminValue,
                studyLevel: {
                    idStudyLevel: request.studyLevel?.idStudyLevel,
                    name: request.studyLevel?.name,
                    studyPrograms: []
                }
            };

            await http.post('student-officer', studentOfficerPayload);

            await http.delete(`registration-request/${request.idRegistrationRequest}`);

            fetchRequests();
        } catch (error) {
            console.error("Greška prilikom odobravanja zahteva:", error);
            alert("Došlo je do greške na serveru.");
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm("Da li ste sigurni da želite da odbijete i obrišete ovaj zahtev?")) return;
        try {
            await http.delete(`registration-request/${id}`);
            fetchRequests();
        } catch (error) {
            console.error(error);
            alert("Došlo je do greške pri odbijanju zahteva.");
        }
    };

    const renderAdminCell = (adminValue) => {
        if (adminValue === true || adminValue === "b'1'" || adminValue === 1) {
            return <span className="badge-admin">Da</span>;
        }
        return <span className="badge-user">Ne</span>;
    };

    return (
        <div className="request-container">
            <div className="request-header">
                <div>
                    <h1>Zahtevi za registraciju</h1>
                    <p>Upravljanje i provera dolaznih zahteva za kreiranje naloga zaposlenih na studentskoj službi.</p>
                </div>
            </div>

            <SearchPanel onSearch={fetchRequests} onReset={handleReset}>
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
                    <div className="loading-placeholder">Učitavanje zahteva...</div>
                ) : (
                    <table className="request-table">
                        <thead>
                            <tr>
                                <th>Ime</th>
                                <th>Prezime</th>
                                <th>E-mail</th>
                                <th className="text-center">Traži Admin Prava</th>
                                <th className="text-center">Akcije</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.length > 0 ? (
                                requests.map((req) => (
                                    <tr key={req.idRegistrationRequest}>
                                        <td className="font-semibold">{req.firstName}</td>
                                        <td className="font-semibold">{req.lastName}</td>
                                        <td>{req.email}</td>
                                        <td className="text-center">{renderAdminCell(req.admin)}</td>
                                        <td className="text-center actions-cell">
                                            <Button
                                                variant="action-edit"
                                                title="Odobri zahtev"
                                                onClick={() => handleApproveClick(req)}
                                                icon={<UserCheck size={16} />}
                                            />
                                            <Button
                                                variant="reset"
                                                title="Odbij zahtev"
                                                onClick={() => handleReject(req.idRegistrationRequest)}
                                                icon={<UserX size={16} />}
                                            />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="no-data">
                                        Trenutno nema otvorenih zahteva za registraciju.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            <Modal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                title="Potvrda administratorskih prava"
            >
                <div className="confirm-modal-content">
                    <p>Korisnik je poslao zahtev sa naznačenim <strong>administratorskim privilegijama</strong>.</p>
                    <p>Da li želite da odobrite ovaj nalog kao <strong>administratorski</strong> ili kao <strong>standardni</strong> nalog?</p>

                    <div className="confirm-modal-buttons">
                        <button
                            type="button"
                            className="btn-confirm-admin"
                            onClick={() => handleConfirmAdmin(true)}
                        >
                            Odobri kao Admin
                        </button>
                        <button
                            type="button"
                            className="btn-confirm-officer"
                            onClick={() => handleConfirmAdmin(false)}
                        >
                            Odobri kao standardni nalog
                        </button>
                        <button
                            type="button"
                            className="btn-confirm-cancel"
                            onClick={() => setIsConfirmModalOpen(false)}
                        >
                            Otkaži
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default RegistrationRequest;