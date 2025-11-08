import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './QuizConfig.css';

function QuizConfig({ contentSource, setQuizData }) {
  const [config, setConfig] = useState({
    easy: 0,
    medium: 0,
    hard: 0,
    timeLimit: 10
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const totalQuestions = config.easy + config.medium + config.hard;

  const handleChange = (field, value) => {
    const numValue = parseInt(value) || 0;
    setConfig(prev => ({
      ...prev,
      [field]: Math.max(0, Math.min(numValue, field === 'timeLimit' ? 180 : 20))
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (totalQuestions === 0) {
      setError('Please select at least one question');
      return;
    }

    if (totalQuestions > 50) {
      setError('Maximum 50 questions allowed');
      return;
    }

    setLoading(true);

    try {
      let response;
      
      if (contentSource.type === 'text') {
        response = await axios.post('/api/quiz/generate-from-text', {
          content: contentSource.content,
          numQuestions: totalQuestions,
          difficulty: {
            easy: config.easy,
            medium: config.medium,
            hard: config.hard
          },
          timeLimit: config.timeLimit
        });
      } else {
        const formData = new FormData();
        formData.append('file', contentSource.file);
        formData.append('numQuestions', totalQuestions);
        formData.append('difficulty', JSON.stringify({
          easy: config.easy,
          medium: config.medium,
          hard: config.hard
        }));
        formData.append('timeLimit', config.timeLimit);

        response = await axios.post('/api/quiz/generate-from-file', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      if (response.data.success) {
        setQuizData(response.data.quiz);
        navigate('/quiz');
      } else {
        setError('Failed to generate quiz. Please try again.');
      }
    } catch (err) {
      console.error('Error generating quiz:', err);
      setError(
        err.response?.data?.error || 
        err.response?.data?.message || 
        'Failed to generate quiz. Please check your API configuration and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const presetConfigs = [
    { name: 'Quick Quiz', easy: 5, medium: 0, hard: 0, time: 5 },
    { name: 'Balanced', easy: 3, medium: 4, hard: 3, time: 15 },
    { name: 'Challenge', easy: 0, medium: 5, hard: 5, time: 20 }
  ];

  const applyPreset = (preset) => {
    setConfig({
      easy: preset.easy,
      medium: preset.medium,
      hard: preset.hard,
      timeLimit: preset.time
    });
  };

  return (
    <div className="config-container">
      <div className="content-card">
        <h2>⚙️ Configure Your Quiz</h2>
        <p className="subtitle">Customize the difficulty and duration of your quiz</p>

        <div className="presets-section">
          <h3>Quick Presets</h3>
          <div className="preset-buttons">
            {presetConfigs.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => applyPreset(preset)}
                className="preset-btn"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="config-form">
          <div className="difficulty-section">
            <h3>Question Difficulty Distribution</h3>
            
            <div className="difficulty-group">
              <label htmlFor="easy">
                <span className="difficulty-badge easy">Easy</span>
                <span className="difficulty-desc">Basic understanding and recall</span>
              </label>
              <div className="input-with-controls">
                <button
                  type="button"
                  onClick={() => handleChange('easy', config.easy - 1)}
                  className="qty-btn"
                >
                  −
                </button>
                <input
                  type="number"
                  id="easy"
                  value={config.easy}
                  onChange={(e) => handleChange('easy', e.target.value)}
                  min="0"
                  max="20"
                  className="qty-input"
                />
                <button
                  type="button"
                  onClick={() => handleChange('easy', config.easy + 1)}
                  className="qty-btn"
                >
                  +
                </button>
              </div>
            </div>

            <div className="difficulty-group">
              <label htmlFor="medium">
                <span className="difficulty-badge medium">Medium</span>
                <span className="difficulty-desc">Application and analysis</span>
              </label>
              <div className="input-with-controls">
                <button
                  type="button"
                  onClick={() => handleChange('medium', config.medium - 1)}
                  className="qty-btn"
                >
                  −
                </button>
                <input
                  type="number"
                  id="medium"
                  value={config.medium}
                  onChange={(e) => handleChange('medium', e.target.value)}
                  min="0"
                  max="20"
                  className="qty-input"
                />
                <button
                  type="button"
                  onClick={() => handleChange('medium', config.medium + 1)}
                  className="qty-btn"
                >
                  +
                </button>
              </div>
            </div>

            <div className="difficulty-group">
              <label htmlFor="hard">
                <span className="difficulty-badge hard">Hard</span>
                <span className="difficulty-desc">Deep understanding and synthesis</span>
              </label>
              <div className="input-with-controls">
                <button
                  type="button"
                  onClick={() => handleChange('hard', config.hard - 1)}
                  className="qty-btn"
                >
                  −
                </button>
                <input
                  type="number"
                  id="hard"
                  value={config.hard}
                  onChange={(e) => handleChange('hard', e.target.value)}
                  min="0"
                  max="20"
                  className="qty-input"
                />
                <button
                  type="button"
                  onClick={() => handleChange('hard', config.hard + 1)}
                  className="qty-btn"
                >
                  +
                </button>
              </div>
            </div>

            <div className="total-questions">
              <strong>Total Questions:</strong> {totalQuestions}
            </div>
          </div>

          <div className="time-section">
            <h3>Time Limit</h3>
            <div className="form-group">
              <label htmlFor="timeLimit">
                Minutes: <strong>{config.timeLimit}</strong>
              </label>
              <input
                type="range"
                id="timeLimit"
                value={config.timeLimit}
                onChange={(e) => handleChange('timeLimit', e.target.value)}
                min="1"
                max="180"
                className="time-slider"
              />
              <div className="time-labels">
                <span>1 min</span>
                <span>180 min</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="back-btn"
              disabled={loading}
            >
              ← Back
            </button>
            <button
              type="submit"
              className="generate-btn"
              disabled={loading || totalQuestions === 0}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Generating Quiz...
                </>
              ) : (
                'Generate Quiz 🚀'
              )}
            </button>
          </div>
        </form>

        {loading && (
          <div className="loading-info">
            <p>🤖 AI is generating your customized quiz questions...</p>
            <p>This may take 10-30 seconds depending on the number of questions.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default QuizConfig;
