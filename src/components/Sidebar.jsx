import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    Home, GraduationCap, Calendar, Globe,
    Building2, UserCheck, Award, Users, Briefcase, LogOut
} from 'lucide-react';
import '../css/Sidebar.css';

const Sidebar = () => {
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

                <div className="menu-group-label">Šifrarnici i Zahtevi</div>

                <NavLink to="/teacher" className={({ isActive }) => isActive ? "sidebar-item active" : "sidebar-item"}>
                    <GraduationCap size={18} />
                    <span>Nastavnici</span>
                </NavLink>

                <NavLink to="/exam-period" className={({ isActive }) => isActive ? "sidebar-item active" : "sidebar-item"}>
                    <Calendar size={18} />
                    <span>Ispitni rokovi</span>
                </NavLink>

                <NavLink to="/registration-request" className={({ isActive }) => isActive ? "sidebar-item active" : "sidebar-item"}>
                    <UserCheck size={18} />
                    <span>Zahtevi za registraciju</span>
                </NavLink>

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
                <div className="user-profile">
                    <div className="user-avatar">AD</div>
                    <div className="user-details">
                        <span className="user-name">Admin Dashboard</span>
                        <span className="user-role">Studentska Služba</span>
                    </div>
                </div>
                <button className="btn-sidebar-logout" title="Odjavi se">
                    <LogOut size={16} />
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;