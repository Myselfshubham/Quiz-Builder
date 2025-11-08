import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home';
import QuizConfig from './components/QuizConfig';
import QuizSession from './components/QuizSession';
import Results from './components/Results';
import './App.css';

function App() {
  const [quizData, setQuizData] = useState(null);
  const [userAnswers, setUserAnswers] = useState([]);
  const [contentSource, setContentSource] = useState(null);

  return (
    <Router>
      <div className="App">
        <header className="app-header">
          <div className="container">
            <h1>🎓 AI Quiz Builder</h1>
            <p>AI-Powered MCQ Generator & Quiz Platform</p>
          </div>
        </header>
        
        <main className="app-main">
          <Routes>
            <Route 
              path="/" 
              element={
                <Home 
                  setContentSource={setContentSource}
                  contentSource={contentSource}
                />
              } 
            />
            <Route 
              path="/config" 
              element={
                contentSource ? (
                  <QuizConfig 
                    contentSource={contentSource}
                    setQuizData={setQuizData}
                  />
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
            <Route 
              path="/quiz" 
              element={
                quizData ? (
                  <QuizSession 
                    quizData={quizData}
                    setUserAnswers={setUserAnswers}
                  />
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
            <Route 
              path="/results" 
              element={
                quizData && userAnswers ? (
                  <Results 
                    quizData={quizData}
                    userAnswers={userAnswers}
                  />
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
          </Routes>
        </main>
        
        <footer className="app-footer">
          <div className="container">
            <p>&copy; 2025 AI Quiz Builder. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
