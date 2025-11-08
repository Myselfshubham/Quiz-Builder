import React from 'react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './Results.css';

function Results({ quizData, userAnswers }) {
  const navigate = useNavigate();
  const questions = quizData.questions;

  // Calculate results
  const results = questions.map((question, index) => {
    const userAnswer = userAnswers.find(a => a.questionId === question.id);
    const selectedAnswer = userAnswer?.selectedAnswer;
    const isCorrect = selectedAnswer === question.correctAnswer;
    
    return {
      question,
      selectedAnswer,
      isCorrect,
      isAnswered: selectedAnswer !== null && selectedAnswer !== undefined
    };
  });

  const totalQuestions = questions.length;
  const correctAnswers = results.filter(r => r.isCorrect).length;
  const incorrectAnswers = results.filter(r => !r.isCorrect && r.isAnswered).length;
  const unanswered = results.filter(r => !r.isAnswered).length;
  const percentage = ((correctAnswers / totalQuestions) * 100).toFixed(1);

  // Determine performance grade
  const getGrade = () => {
    if (percentage >= 90) return { grade: 'A+', message: 'Outstanding!', color: '#10b981' };
    if (percentage >= 80) return { grade: 'A', message: 'Excellent!', color: '#22c55e' };
    if (percentage >= 70) return { grade: 'B', message: 'Good Job!', color: '#84cc16' };
    if (percentage >= 60) return { grade: 'C', message: 'Fair', color: '#eab308' };
    if (percentage >= 50) return { grade: 'D', message: 'Needs Improvement', color: '#f59e0b' };
    return { grade: 'F', message: 'Keep Practicing', color: '#ef4444' };
  };

  const gradeInfo = getGrade();

  // Export to PDF
  const exportToPDF = async () => {
    const resultsElement = document.getElementById('results-content');
    
    try {
      const canvas = await html2canvas(resultsElement, {
        scale: 2,
        logging: false,
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 10;
      
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
      
      while (heightLeft > 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
      
      pdf.save(`quiz-results-${new Date().getTime()}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  return (
    <div className="results-container">
      <div id="results-content" className="results-content">
        {/* Score Summary */}
        <div className="score-summary">
          <div className="grade-circle" style={{ borderColor: gradeInfo.color }}>
            <div className="grade-text" style={{ color: gradeInfo.color }}>
              {gradeInfo.grade}
            </div>
            <div className="percentage">{percentage}%</div>
          </div>
          
          <h2 className="grade-message">{gradeInfo.message}</h2>
          
          <div className="stats-grid">
            <div className="stat-card correct">
              <div className="stat-icon">✓</div>
              <div className="stat-value">{correctAnswers}</div>
              <div className="stat-label">Correct</div>
            </div>
            
            <div className="stat-card incorrect">
              <div className="stat-icon">✗</div>
              <div className="stat-value">{incorrectAnswers}</div>
              <div className="stat-label">Incorrect</div>
            </div>
            
            <div className="stat-card unanswered">
              <div className="stat-icon">−</div>
              <div className="stat-value">{unanswered}</div>
              <div className="stat-label">Unanswered</div>
            </div>
            
            <div className="stat-card total">
              <div className="stat-icon">#</div>
              <div className="stat-value">{totalQuestions}</div>
              <div className="stat-label">Total</div>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="detailed-results">
          <h3>📋 Detailed Question Breakdown</h3>
          
          {results.map((result, index) => (
            <div
              key={result.question.id}
              className={`result-item ${result.isCorrect ? 'correct' : result.isAnswered ? 'incorrect' : 'unanswered'}`}
            >
              <div className="result-header">
                <span className="question-number">Question {index + 1}</span>
                <span className={`difficulty-badge ${result.question.difficulty}`}>
                  {result.question.difficulty}
                </span>
                {result.isCorrect && <span className="result-badge correct">✓ Correct</span>}
                {!result.isCorrect && result.isAnswered && <span className="result-badge incorrect">✗ Incorrect</span>}
                {!result.isAnswered && <span className="result-badge unanswered">− Not Answered</span>}
              </div>
              
              <div className="result-question">
                {result.question.question}
              </div>
              
              <div className="result-answers">
                {result.question.options.map((option, optIndex) => (
                  <div
                    key={optIndex}
                    className={`answer-option 
                      ${optIndex === result.question.correctAnswer ? 'correct-answer' : ''} 
                      ${optIndex === result.selectedAnswer && optIndex !== result.question.correctAnswer ? 'wrong-answer' : ''}
                      ${optIndex === result.selectedAnswer ? 'user-selected' : ''}`}
                  >
                    <span className="option-label">{String.fromCharCode(65 + optIndex)}</span>
                    <span className="option-text">{option}</span>
                    {optIndex === result.question.correctAnswer && (
                      <span className="correct-indicator">✓ Correct Answer</span>
                    )}
                    {optIndex === result.selectedAnswer && optIndex !== result.question.correctAnswer && (
                      <span className="wrong-indicator">✗ Your Answer</span>
                    )}
                  </div>
                ))}
              </div>
              
              {(!result.isCorrect || !result.isAnswered) && (
                <div className="explanation-box">
                  <strong>💡 Explanation:</strong>
                  <p>{result.question.explanation}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="results-actions">
        <button onClick={exportToPDF} className="export-btn">
          📥 Download PDF Report
        </button>
        <button onClick={() => navigate('/')} className="home-btn">
          🏠 Create New Quiz
        </button>
      </div>
    </div>
  );
}

export default Results;
