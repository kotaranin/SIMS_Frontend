import React, { useState, useEffect } from 'react';
import { Globe, Plus, Edit2 } from 'lucide-react';
import http from '../api/http';
import Button from '../components/Button';
import InputField from '../components/InputField';
import SearchPanel from '../components/SearchPanel';
import Modal from '../components/Modal';
import '../css/Country.css';

const Country = () => {
    const [countries, setCountries] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [searchName, setSearchName] = useState('');
    const [loading, setLoading] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentCountryId, setCurrentCountryId] = useState(null);
    const [formCountryName, setFormCountryName] = useState('');

    const [formCities, setFormCities] = useState([]);
    const [newCityName, setNewCityName] = useState('');

    const fetchCountries = async () => {
        setLoading(true);
        try {
            let url = '/country';
            if (searchName) {
                url = `/country/search?name=${encodeURIComponent(searchName)}`;
            }
            const response = await http.get(url);
            setCountries(response.data);

            if (selectedCountry) {
                const updatedSelected = response.data.find(c => c.idCountry === selectedCountry.idCountry);
                setSelectedCountry(updatedSelected || null);
            }
        } catch (error) {
            console.error("Greška pri dobavljanju država:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCountries();
    }, []);

    const handleReset = async () => {
        setSearchName('');
        setSelectedCountry(null);
        setLoading(true);
        try {
            const response = await http.get('/country');
            setCountries(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectCountry = (country) => {
        setSelectedCountry(country);
    };

    const openAddModal = () => {
        setIsEditMode(false);
        setCurrentCountryId(null);
        setFormCountryName('');
        setFormCities([]);
        setNewCityName('');
        setIsModalOpen(true);
    };

    const openEditModal = async (country) => {
        setIsEditMode(true);
        setCurrentCountryId(country.idCountry);
        setFormCountryName(country.name);
        setFormCities(country.cities ? [...country.cities] : []);
        setNewCityName('');
        setIsModalOpen(true);
    };

    const handleAddCityToForm = () => {
        if (!newCityName.trim()) return;

        setFormCities([...formCities, { idCity: null, name: newCityName.trim() }]);
        setNewCityName('');
    };

    const handleCityNameChangeInForm = (index, value) => {
        const updated = [...formCities];
        updated[index].name = value;
        setFormCities(updated);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        if (!formCountryName.trim()) {
            alert("Naziv države je obavezan!");
            return;
        }

        const countryData = {
            name: formCountryName,
            cities: formCities
        };

        try {
            if (isEditMode) {
                await http.put(`/country/${currentCountryId}`, countryData);
            } else {
                await http.post('/country', countryData);
            }
            setIsModalOpen(false);
            fetchCountries();
        } catch (error) {
            console.error("Greška prilikom čuvanja države:", error);
            alert("Došlo je do greške na serveru.");
        }
    };

    return (
        <div className="country-container">
            <div className="country-header">
                <div>
                    <h1>Države i gradovi</h1>
                    <p>Upravljanje državama i gradovima u sistemu.</p>
                </div>
                <Button variant="primary" icon={<Globe size={18} />} onClick={openAddModal}>
                    Dodaj državu
                </Button>
            </div>

            <SearchPanel onSearch={fetchCountries} onReset={handleReset}>
                <InputField
                    label="Naziv države"
                    placeholder="Pretraži po nameni..."
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                />
            </SearchPanel>

            <div className="geo-layout">

                <div className="geo-column">
                    <h3>Države</h3>
                    <div className="table-wrapper">
                        {loading ? (
                            <div className="loading-placeholder">Učitavanje...</div>
                        ) : (
                            <table className="geo-table">
                                <thead>
                                    <tr>
                                        <th>Naziv države</th>
                                        <th className="text-center">Akcije</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {countries.length > 0 ? (
                                        countries.map((country) => (
                                            <tr
                                                key={country.idCountry}
                                                onClick={() => handleSelectCountry(country)}
                                                className={`clickable-row ${selectedCountry?.idCountry === country.idCountry ? 'active-row' : ''}`}
                                            >
                                                <td className="font-semibold">{country.name}</td>
                                                <td className="text-center actions-cell" onClick={(e) => e.stopPropagation()}>
                                                    <Button
                                                        variant="action-edit"
                                                        title="Ažuriraj državu i gradove"
                                                        onClick={() => openEditModal(country)}
                                                        icon={<Edit2 size={16} />}
                                                    />
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="2" className="no-data">Nema pronađenih država.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                <div className="geo-column">
                    <h3>Gradovi {selectedCountry && `— ${selectedCountry.name}`}</h3>
                    <div className="table-wrapper">
                        <table className="geo-table">
                            <thead>
                                <tr>
                                    <th>Naziv grada</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedCountry ? (
                                    selectedCountry.cities && selectedCountry.cities.length > 0 ? (
                                        selectedCountry.cities.map((city) => (
                                            <tr key={city.idCity}>
                                                <td>{city.name}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td className="no-data">Ova država nema unetih gradova.</td>
                                        </tr>
                                    )
                                ) : (
                                    <tr>
                                        <td className="no-data">Kliknite na neku državu sa leve strane da biste videli njene gradove.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={isEditMode ? "Izmeni državu i gradove" : "Dodaj novu državu i gradove"}
            >
                <form onSubmit={handleFormSubmit} className="modal-form">
                    <InputField
                        label="Naziv države"
                        placeholder="Unesite naziv države..."
                        value={formCountryName}
                        onChange={(e) => setFormCountryName(e.target.value)}
                    />

                    <div className="modal-cities-section">
                        <label className="section-label">Gradovi ove države (Dodaj novi ili izmeni postojeće)</label>

                        <div className="add-city-inline">
                            <input
                                type="text"
                                placeholder="Unesite naziv novog grada..."
                                value={newCityName}
                                onChange={(e) => setNewCityName(e.target.value)}
                                className="inline-city-input"
                            />
                            <button type="button" className="btn-inline-add" onClick={handleAddCityToForm}>
                                <Plus size={18} />
                            </button>
                        </div>

                        <div className="form-cities-list">
                            {formCities.map((city, index) => (
                                <div key={index} className="form-city-item">
                                    <input
                                        type="text"
                                        value={city.name}
                                        onChange={(e) => handleCityNameChangeInForm(index, e.target.value)}
                                        className="flat-city-input"
                                        placeholder="Naziv grada..."
                                    />
                                </div>
                            ))}
                            {formCities.length === 0 && (
                                <p className="empty-inline-msg">Trenutno nema dodatih gradova.</p>
                            )}
                        </div>
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

export default Country;