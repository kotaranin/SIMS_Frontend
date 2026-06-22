import React, { useState, useEffect } from 'react';
import { Building2, Edit2 } from 'lucide-react';
import http from '../api/http';
import Button from '../components/Button';
import InputField from '../components/InputField';
import SearchPanel from '../components/SearchPanel';
import Modal from '../components/Modal';
import '../css/Company.css';

const Company = () => {
    const [companies, setCompanies] = useState([]);
    const [cities, setCities] = useState([]);
    const [searchName, setSearchName] = useState('');
    const [searchAddress, setSearchAddress] = useState('');
    const [loading, setLoading] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentCompanyId, setCurrentCompanyId] = useState(null);
    const [formName, setFormName] = useState('');
    const [formAddress, setFormAddress] = useState('');
    const [formCityId, setFormCityId] = useState('');

    const fetchCompanies = async () => {
        setLoading(true);
        try {
            let url = 'company';
            if (searchName || searchAddress) {
                url = `company/search?name=${searchName}&address=${searchAddress}`;
            }
            const response = await http.get(url);
            setCompanies(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCities = async () => {
        try {
            const response = await http.get('city');
            setCities(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchCompanies();
        fetchCities();
    }, []);

    const handleReset = async () => {
        setSearchName('');
        setSearchAddress('');
        setLoading(true);
        try {
            const response = await http.get('company');
            setCompanies(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const openAddModal = () => {
        setIsEditMode(false);
        setCurrentCompanyId(null);
        setFormName('');
        setFormAddress('');
        setFormCityId(cities[0]?.idCity || '');
        setIsModalOpen(true);
    };

    const openEditModal = async (id) => {
        try {
            const response = await http.get(`company/${id}`);
            setIsEditMode(true);
            setCurrentCompanyId(id);
            setFormName(response.data.name);
            setFormAddress(response.data.address);
            setFormCityId(response.data.city?.idCity || response.data.idCity || '');
            setIsModalOpen(true);
        } catch (error) {
            console.error(error);
            alert("Nije moguće učitati podatke o kompaniji.");
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        if (!formName.trim() || !formAddress.trim() || !formCityId) {
            alert("Sva polja su obavezna!");
            return;
        }

        const selectedCityObject = cities.find(c => c.idCity === parseInt(formCityId));

        const companyData = {
            name: formName,
            address: formAddress,
            city: selectedCityObject
        };

        try {
            if (isEditMode) {
                await http.put(`company/${currentCompanyId}`, companyData);
            } else {
                await http.post('company', companyData);
            }
            setIsModalOpen(false);
            fetchCompanies();
        } catch (error) {
            console.error(error);
            alert("Došlo je do greške na serveru.");
        }
    };

    return (
        <div className="company-container">
            <div className="company-header">
                <div>
                    <h1>Kompanije</h1>
                    <p>Pregled, pretraga i upravljanje podacima o partnerskim kompanijama.</p>
                </div>
                <Button variant="primary" icon={<Building2 size={18} />} onClick={openAddModal}>
                    Dodaj kompaniju
                </Button>
            </div>

            <SearchPanel onSearch={fetchCompanies} onReset={handleReset}>
                <InputField
                    label="Naziv kompanije"
                    placeholder="Pretraži po nazivu..."
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                />
                <InputField
                    label="Adresa"
                    placeholder="Pretraži po adresi..."
                    value={searchAddress}
                    onChange={(e) => setSearchAddress(e.target.value)}
                />
            </SearchPanel>

            <div className="table-wrapper">
                {loading ? (
                    <div className="loading-placeholder">Učitavanje podataka...</div>
                ) : (
                    <table className="company-table">
                        <thead>
                            <tr>
                                <th>Naziv kompanije</th>
                                <th>Adresa</th>
                                <th>Grad</th>
                                <th className="text-center">Akcije</th>
                            </tr>
                        </thead>
                        <tbody>
                            {companies.length > 0 ? (
                                companies.map((company) => (
                                    <tr key={company.idCompany}>
                                        <td className="font-semibold">{company.name}</td>
                                        <td>{company.address}</td>
                                        <td>{company.city?.name || 'Nije dodeljen'}</td>
                                        <td className="text-center actions-cell">
                                            <Button
                                                variant="action-edit"
                                                title="Ažuriraj"
                                                onClick={() => openEditModal(company.idCompany)}
                                                icon={<Edit2 size={16} />}
                                            />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="no-data">
                                        Nema pronađenih kompanija u bazi.
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
                title={isEditMode ? "Izmeni kompaniju" : "Dodaj novu kompaniju"}
            >
                <form onSubmit={handleFormSubmit} className="modal-form">
                    <InputField
                        label="Naziv kompanije"
                        placeholder="Unesite naziv kompanije..."
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                    />
                    <InputField
                        label="Adresa kompanije"
                        placeholder="Unesite adresu..."
                        value={formAddress}
                        onChange={(e) => setFormAddress(e.target.value)}
                    />

                    <div className="select-field-wrapper">
                        <label className="select-field-label">Grad</label>
                        <select
                            value={formCityId}
                            onChange={(e) => setFormCityId(e.target.value)}
                            className="select-field-dropdown"
                        >
                            {cities.map((city) => (
                                <option key={city.idCity} value={city.idCity}>
                                    {city.name}
                                </option>
                            ))}
                        </select>
                    </div>

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

export default Company;