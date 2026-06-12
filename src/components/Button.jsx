import React from 'react';
import '../components.css';

const Button = ({
    children,
    onClick,
    type = 'button',
    variant = 'primary', // primary, search, reset, action-edit
    icon,
    title
}) => {
    return (
        <button
            type={type}
            className={`btn btn-${variant}`}
            onClick={onClick}
            title={title}
        >
            {icon && <span className="btn-icon">{icon}</span>}
            {children}
        </button>
    );
};

export default Button;