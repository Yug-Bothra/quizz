// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import QuizDashboard from "./component/QuizDashboard";
import QuizApp from "./component/QuizApp";

function App() {
  return (
    <Router>
      <Routes>
        {/* Default route → Dashboard */}
        <Route path="/" element={<QuizDashboard />} />

        {/* Quiz route */}
        <Route path="/quiz" element={<QuizApp />} />

        {/* Catch-all → redirect to Dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
