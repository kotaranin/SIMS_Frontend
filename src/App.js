import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Teacher from './pages/Teacher';
import ExamPeriod from './pages/ExamPeriod';

function App() {
  return (
    <Router>

      <div className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/teacher" element={<Teacher />} />
          <Route path="/exam-period" element={<ExamPeriod />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;