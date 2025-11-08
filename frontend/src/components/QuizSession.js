import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './QuizSession.css';

function QuizSession({ quizData, setUserAnswers }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(quizData.timeLimit * 60);
  const [showWarning, setShowWarning] = useState(false);
  const navigate = useNavigate();

  const questions = quizData.questions;
  const totalQuestions = questions.length;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmit(true);
          return 0;
        }
        if (prev <= 60 && !showWarning) {
          setShowWarning(true);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showWarning]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (questionId, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(prev => prev + 1);
      setShowWarning(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      setShowWarning(false);
    }
  };

  const handleJumpToQuestion = (index) => {
    setCurrentQuestion(index);
    setShowWarning(false);
  };

  const handleSubmit = (autoSubmit = false) => {
    const userAnswerArray = questions.map(q => ({
      questionId: q.id,
      selectedAnswer: answers[q.id] !== undefined ? answers[q.id] : null
    }));
    
    setUserAnswers(userAnswerArray);
    navigate('/results');
  };

  const currentQ = questions[currentQuestion];
  const answeredCount = Object.keys(answers).length;
  const isAnswered = answers[currentQ.id] !== undefined;

  return (
    <div className="quiz-container">
      {/* Header with timer and progress */}
      <div className="quiz-header">
        <div className="quiz-info">
          <span className="question-counter">
            Question {currentQuestion + 1} of {totalQuestions}
          </span>
          <span className="answered-count">
            Answered: {answeredCount}/{totalQuestions}
          </span>
        </div>
        <div className={`timer ${timeRemaining <= 60 ? 'warning' : ''}`}>
          ⏱️ {formatTime(timeRemaining)}
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>

      {/* Question navigation */}
      <div className="question-nav">
        {questions.map((q, index) => (
          <button
            key={q.id}
            onClick={() => handleJumpToQuestion(index)}
            className={`nav-btn ${currentQuestion === index ? 'active' : ''} ${answers[q.id] !== undefined ? 'answered' : ''}`}
            title={`Question ${index + 1}`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {/* Question card */}
      <div className="question-card">
        <div className="question-header">
          <span className={`difficulty-badge ${currentQ.difficulty}`}>
            {currentQ.difficulty}
          </span>
        </div>
        
        <h2 className="question-text">{currentQ.question}</h2>
        
        <div className="options-container">
          {currentQ.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(currentQ.id, index)}
              className={`option-btn ${answers[currentQ.id] === index ? 'selected' : ''}`}
            >
              <span className="option-label">{String.fromCharCode(65 + index)}</span>
              <span className="option-text">{option}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="quiz-actions">
        <button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className="nav-button prev"
        >
          ← Previous
        </button>
        
        {currentQuestion === totalQuestions - 1 ? (
          <button
            onClick={() => handleSubmit(false)}
            className="submit-button"
          >
            Submit Quiz 📝
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="nav-button next"
          >
            Next →
          </button>
        )}
      </div>

      {/* Warning for unanswered questions */}
      {currentQuestion === totalQuestions - 1 && answeredCount < totalQuestions && (
        <div className="warning-message">
          ⚠️ You have {totalQuestions - answeredCount} unanswered question(s)
        </div>
      )}

      {/* Time warning */}
      {showWarning && timeRemaining > 0 && (
        <div className="time-warning">
          ⏰ Less than 1 minute remaining!
        </div>
      )}
    </div>
  );
}

export default QuizSession;
