import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Teacher from './pages/Teacher';
import ExamPeriod from './pages/ExamPeriod';
import Country from './pages/Country';
import Company from './pages/Company';
import RegistrationRequest from './pages/RegistrationRequest';
import StudyLevel from './pages/StudyLevel';
import Student from './pages/Student';
import Internship from './pages/Internship';

function App() {
  return (
    <Router>

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
    </Router>
  );
}

export default App;