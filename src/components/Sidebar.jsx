import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    Home, GraduationCap, Calendar, Globe,
    Building2, UserCheck, Award, Users, Briefcase, LogOut
} from 'lucide-react';
import '../css/Sidebar.css';

const Sidebar = () => {
    const navigate = useNavigate();

    const loggedInUser = JSON.parse(localStorage.getItem('user')) || {
        firstName: 'Admin',
        lastName: 'Dashboard',
        admin: true
    };

    const getInitials = () => {
        const firstLetter = loggedInUser.firstName ? loggedInUser.firstName.charAt(0).toUpperCase() : 'A';
        const lastLetter = loggedInUser.lastName ? loggedInUser.lastName.charAt(0).toUpperCase() : 'D';
        return `${firstLetter}${lastLetter}`;
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <GraduationCap size={28} className="brand-icon" />
                <div className="brand-info">
                    <span className="brand-title">SIMS</span>
                    <span className="brand-subtitle">Student Internship Management System</span>
                </div>
            </div>

            <nav className="sidebar-menu">
                <div className="menu-group-label">Glavni Meni</div>

                <NavLink to="/" className={({ isActive }) => isActive ? "sidebar-item active" : "sidebar-item"}>
                    <Home size={18} />
                    <span>Početna</span>
                </NavLink>

                <NavLink to="/internship" className={({ isActive }) => isActive ? "sidebar-item active" : "sidebar-item"}>
                    <Briefcase size={18} />
                    <span>Stručne prakse</span>
                </NavLink>

                <NavLink to="/student" className={({ isActive }) => isActive ? "sidebar-item active" : "sidebar-item"}>
                    <Users size={18} />
                    <span>Studenti</span>
                </NavLink>

                <NavLink to="/company" className={({ isActive }) => isActive ? "sidebar-item active" : "sidebar-item"}>
                    <Building2 size={18} />
                    <span>Kompanije</span>
                </NavLink>

                <div className="menu-group-label">Šifarnici i Zahtevi</div>

                <NavLink to="/teacher" className={({ isActive }) => isActive ? "sidebar-item active" : "sidebar-item"}>
                    <GraduationCap size={18} />
                    <span>Nastavnici</span>
                </NavLink>

                <NavLink to="/exam-period" className={({ isActive }) => isActive ? "sidebar-item active" : "sidebar-item"}>
                    <Calendar size={18} />
                    <span>Ispitni rokovi</span>
                </NavLink>

                {loggedInUser.admin && (
                    <NavLink to="/registration-request" className={({ isActive }) => isActive ? "sidebar-item active" : "sidebar-item"}>
                        <UserCheck size={18} />
                        <span>Zahtevi za registraciju</span>
                    </NavLink>
                )}

                <NavLink to="/study-level" className={({ isActive }) => isActive ? "sidebar-item active" : "sidebar-item"}>
                    <Award size={18} />
                    <span>Nivoi studija</span>
                </NavLink>

                <NavLink to="/country" className={({ isActive }) => isActive ? "sidebar-item active" : "sidebar-item"}>
                    <Globe size={18} />
                    <span>Države i gradovi</span>
                </NavLink>
            </nav>

            <div className="sidebar-footer">
                <NavLink
                    to="/user-profile"
                    className={({ isActive }) => isActive ? "user-profile active-profile" : "user-profile"}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                >
                    <div className="user-avatar">{getInitials()}</div>
                    <div className="user-details">
                        <span className="user-name">{loggedInUser.firstName} {loggedInUser.lastName}</span>
                        <span className="user-role">
                            {loggedInUser.admin ? 'Administrator' : 'Studentska Služba'}
                        </span>
                    </div>
                </NavLink>

                <button className="btn-sidebar-logout" title="Odjavi se" onClick={handleLogout}>
                    <LogOut size={16} />
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;