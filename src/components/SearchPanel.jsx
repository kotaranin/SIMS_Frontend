import React from 'react';
import { Search } from 'lucide-react';
import Button from './Button';
import '../components.css';

const SearchPanel = ({ onSearch, onReset, children }) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch();
    };

    return (
        <div className="search-section">
            <form onSubmit={handleSubmit} className="search-form">
                <div className="search-fields">
                    {children}
                </div>
                <div className="search-buttons">
                    <Button type="submit" variant="search" icon={<Search size={16} />}>
                        Traži
                    </Button>
                    <Button type="button" variant="reset" onClick={onReset}>
                        Poništi
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default SearchPanel;