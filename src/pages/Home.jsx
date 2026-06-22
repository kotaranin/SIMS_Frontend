import React from 'react';
import { Link } from 'react-router-dom';
import {
    Briefcase, Users, Building2, UserCheck,
    PlusCircle, FileText, ArrowRight, Activity
} from 'lucide-react';
import '../css/Home.css';

const Home = () => {
    const stats = [
        { id: 1, title: 'Aktivne prakse', count: '42', icon: <Briefcase size={24} />, class: 'card-blue' },
        { id: 2, title: 'Ukupno studenata', count: '1,248', icon: <Users size={24} />, class: 'card-green' },
        { id: 3, title: 'Partner kompanije', count: '86', icon: <Building2 size={24} />, class: 'card-purple' },
        { id: 4, title: 'Novi zahtevi', count: '7', icon: <UserCheck size={24} />, class: 'card-amber' },
    ];

    const recentActivities = [
        { id: 1, text: 'Student Marko Marković je uspešno odbranio praksu u kompaniji "Nordeus".', time: 'Pre 10 minuta' },
        { id: 2, text: 'Kreiran je novi zahtev za registraciju od strane kompanije "Endava".', time: 'Pre 1 sat' },
        { id: 3, text: 'Nastavnik dr Dragan Lekić je dodat u šifrarnik nastavnika.', time: 'Pre 3 sata' },
        { id: 4, text: 'Odobren je izveštaj o stručnoj praksi za studentkinju Anu Ivanović.', time: 'Juče' },
    ];

    return (
        <div className="home-container">
            <div className="home-header">
                <div>
                    <h1>Dobrodošli nazad, Admin</h1>
                    <p>Pregled stanja i brze akcije za upravljanje studentskim sistemom.</p>
                </div>
                <div className="home-current-date">
                    {new Date().toLocaleDateString('sr-RS', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            <div className="stats-grid">
                {stats.map((stat) => (
                    <div key={stat.id} className={`stat-card ${stat.class}`}>
                        <div className="stat-icon-wrapper">
                            {stat.icon}
                        </div>
                        <div className="stat-info">
                            <h3>{stat.count}</h3>
                            <p>{stat.title}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="home-content-layout">

                <div className="home-panel quick-actions-panel">
                    <h2><PlusCircle size={18} className="panel-title-icon" /> Brze akcije</h2>
                    <div className="actions-button-grid">
                        <Link to="/internship" className="quick-action-btn btn-primary-action">
                            <Briefcase size={18} />
                            <div className="action-text">
                                <h4>Evidentiraj praksu</h4>
                                <p>Unesi novu prijavu i odbranu</p>
                            </div>
                            <ArrowRight size={16} className="arrow-icon" />
                        </Link>

                        <Link to="/student" className="quick-action-btn">
                            <Users size={18} />
                            <div className="action-text">
                                <h4>Dodaj studenta</h4>
                                <p>Kreiraj novi profil studenta</p>
                            </div>
                            <ArrowRight size={16} className="arrow-icon" />
                        </Link>

                        <Link to="/company" className="quick-action-btn">
                            <Building2 size={18} />
                            <div className="action-text">
                                <h4>Nova kompanija</h4>
                                <p>Uveži novog partnera u sistem</p>
                            </div>
                            <ArrowRight size={16} className="arrow-icon" />
                        </Link>

                        <Link to="/registration-request" className="quick-action-btn alert-badge-btn">
                            <UserCheck size={18} />
                            <div className="action-text">
                                <h4>Pregledaj zahteve</h4>
                                <p>Odobri registracije korisnika</p>
                            </div>
                            <span className="action-alert-badge">7</span>
                        </Link>
                    </div>
                </div>

                <div className="home-panel activities-panel">
                    <h2><Activity size={18} className="panel-title-icon" /> Nedavne aktivnosti</h2>
                    <div className="activities-list">
                        {recentActivities.map((activity) => (
                            <div key={activity.id} className="activity-item">
                                <div className="activity-indicator"></div>
                                <div className="activity-details">
                                    <p className="activity-text">{activity.text}</p>
                                    <span className="activity-time">{activity.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Home;