const Joi = require('joi');
const { generateMCQs } = require('../services/aiService');
const { parseDocument } = require('../services/documentParser');
const fs = require('fs').promises;

// Validation schema
const quizConfigSchema = Joi.object({
  numQuestions: Joi.number().integer().min(1).max(50).required(),
  difficulty: Joi.object({
    easy: Joi.number().integer().min(0).default(0),
    medium: Joi.number().integer().min(0).default(0),
    hard: Joi.number().integer().min(0).default(0)
  }).required(),
  timeLimit: Joi.number().integer().min(1).max(180).required(), // in minutes
  content: Joi.string().min(50).optional()
});

// Middleware to validate quiz configuration
const validateQuizConfig = (req, res, next) => {
  const { error, value } = quizConfigSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      error: 'Validation Error',
      details: error.details.map(d => d.message)
    });
  }
  
  // Validate that difficulty levels sum to numQuestions
  const { easy = 0, medium = 0, hard = 0 } = value.difficulty;
  const totalDifficulty = easy + medium + hard;
  
  if (totalDifficulty !== value.numQuestions) {
    return res.status(400).json({
      error: 'Difficulty distribution must sum to total number of questions'
    });
  }
  
  req.validatedData = value;
  next();
};

// Generate quiz from text input
const generateQuizFromText = async (req, res) => {
  try {
    const { content, numQuestions, difficulty, timeLimit } = req.validatedData;
    
    if (!content) {
      return res.status(400).json({ error: 'Content is required for text-based generation' });
    }
    
    // Generate MCQs using AI
    const questions = await generateMCQs(content, numQuestions, difficulty);
    
    res.json({
      success: true,
      quiz: {
        questions,
        timeLimit,
        totalQuestions: numQuestions,
        difficulty
      }
    });
  } catch (error) {
    console.error('Error generating quiz from text:', error);
    res.status(500).json({
      error: 'Failed to generate quiz',
      message: error.message
    });
  }
};

// Generate quiz from uploaded file
const generateQuizFromFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const { numQuestions, difficulty, timeLimit } = req.validatedData;
    
    // Parse document content
    const content = await parseDocument(req.file.path, req.file.mimetype);
    
    if (!content || content.length < 50) {
      // Clean up uploaded file
      await fs.unlink(req.file.path);
      return res.status(400).json({
        error: 'Document content is too short or could not be extracted'
      });
    }
    
    // Generate MCQs using AI
    const questions = await generateMCQs(content, numQuestions, difficulty);
    
    // Clean up uploaded file
    await fs.unlink(req.file.path);
    
    res.json({
      success: true,
      quiz: {
        questions,
        timeLimit,
        totalQuestions: numQuestions,
        difficulty
      }
    });
  } catch (error) {
    console.error('Error generating quiz from file:', error);
    
    // Clean up uploaded file on error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }
    
    res.status(500).json({
      error: 'Failed to generate quiz from file',
      message: error.message
    });
  }
};

module.exports = {
  generateQuizFromText,
  generateQuizFromFile,
  validateQuizConfig
};
