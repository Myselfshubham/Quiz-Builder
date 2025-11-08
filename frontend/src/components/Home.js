import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home({ setContentSource, contentSource }) {
  const [inputType, setInputType] = useState('text');
  const [textInput, setTextInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      const validExtensions = ['.pdf', '.docx', '.txt'];
      const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      
      if (!validTypes.includes(file.type) && !validExtensions.includes(fileExt)) {
        setError('Invalid file type. Please upload a PDF, DOCX, or TXT file.');
        setSelectedFile(null);
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        setSelectedFile(null);
        return;
      }
      
      setSelectedFile(file);
      setError('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (inputType === 'text') {
      if (textInput.trim().length < 50) {
        setError('Text content must be at least 50 characters long');
        return;
      }
      setContentSource({
        type: 'text',
        content: textInput.trim()
      });
    } else {
      if (!selectedFile) {
        setError('Please select a file to upload');
        return;
      }
      setContentSource({
        type: 'file',
        file: selectedFile
      });
    }

    navigate('/config');
  };

  const loadSampleContent = () => {
    const sampleText = `Artificial Intelligence (AI) is the simulation of human intelligence processes by machines, especially computer systems. These processes include learning (the acquisition of information and rules for using the information), reasoning (using rules to reach approximate or definite conclusions), and self-correction.

Machine Learning is a subset of AI that provides systems the ability to automatically learn and improve from experience without being explicitly programmed. It focuses on the development of computer programs that can access data and use it to learn for themselves.

Deep Learning is a subset of machine learning that uses neural networks with multiple layers. These neural networks attempt to simulate the behavior of the human brain—albeit far from matching its ability—allowing it to "learn" from large amounts of data.

Natural Language Processing (NLP) is a branch of AI that helps computers understand, interpret and manipulate human language. NLP draws from many disciplines, including computer science and computational linguistics, in its pursuit to fill the gap between human communication and computer understanding.

Computer Vision is an interdisciplinary field that deals with how computers can be made to gain high-level understanding from digital images or videos. From the perspective of engineering, it seeks to automate tasks that the human visual system can do.`;
    
    setInputType('text');
    setTextInput(sampleText);
    setError('');
  };

  return (
    <div className="home-container">
      <div className="content-card">
        <h2>📚 Get Started</h2>
        <p className="subtitle">Upload a document or enter text to generate AI-powered quiz questions</p>

        <div className="input-type-selector">
          <button
            className={`selector-btn ${inputType === 'text' ? 'active' : ''}`}
            onClick={() => setInputType('text')}
          >
            📝 Text Input
          </button>
          <button
            className={`selector-btn ${inputType === 'file' ? 'active' : ''}`}
            onClick={() => setInputType('file')}
          >
            📄 File Upload
          </button>
        </div>

        <form onSubmit={handleSubmit} className="home-form">
          {inputType === 'text' ? (
            <div className="form-group">
              <label htmlFor="textInput">Enter Your Content</label>
              <textarea
                id="textInput"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Enter or paste your content here (minimum 50 characters)..."
                rows="10"
                className="text-input"
              />
              <div className="char-count">
                {textInput.length} characters
              </div>
              <button
                type="button"
                onClick={loadSampleContent}
                className="sample-btn"
              >
                📖 Load Sample Content
              </button>
            </div>
          ) : (
            <div className="form-group">
              <label htmlFor="fileInput">Upload Document</label>
              <div className="file-upload-area">
                <input
                  type="file"
                  id="fileInput"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileChange}
                  className="file-input"
                />
                <label htmlFor="fileInput" className="file-label">
                  <span className="upload-icon">📁</span>
                  <span className="upload-text">
                    {selectedFile ? selectedFile.name : 'Click to browse or drag & drop'}
                  </span>
                  <span className="file-types">Supported: PDF, DOCX, TXT (Max 10MB)</span>
                </label>
              </div>
            </div>
          )}

          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          <button type="submit" className="submit-btn">
            Continue to Configuration →
          </button>
        </form>

        <div className="info-section">
          <h3>✨ How It Works</h3>
          <ol>
            <li><strong>Input Content:</strong> Provide text or upload a document</li>
            <li><strong>Configure Quiz:</strong> Set difficulty, number of questions, and time limit</li>
            <li><strong>Take Quiz:</strong> Answer AI-generated questions within the time limit</li>
            <li><strong>View Results:</strong> Get detailed feedback and explanations</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default Home;
