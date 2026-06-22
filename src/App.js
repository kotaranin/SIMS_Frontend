import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Teacher from './pages/Teacher';
import ExamPeriod from './pages/ExamPeriod';
import Country from './pages/Country';
import Company from './pages/Company';
import RegistrationRequest from './pages/RegistrationRequest';
import StudyLevel from './pages/StudyLevel';
import Student from './pages/Student';
import Internship from './pages/Internship';
import Sidebar from './components/Sidebar';
import './App.css';
import Login from './pages/Login';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/*" element={
          <ProtectedRoute>
            <div className="app-layout">
              <Sidebar />
              <div className="main-content">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/teacher" element={<Teacher />} />
                  <Route path="/exam-period" element={<ExamPeriod />} />
                  <Route path="/country" element={<Country />} />
                  <Route path="/company" element={<Company />} />
                  <Route path="/registration-request" element={<RegistrationRequest />} />
                  <Route path="/study-level" element={<StudyLevel />} />
                  <Route path="/student" element={<Student />} />
                  <Route path="/internship" element={<Internship />} />
                </Routes>
              </div>
            </div>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;