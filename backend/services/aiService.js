const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Generate MCQs using OpenAI API
 * @param {string} content - The content to generate questions from
 * @param {number} numQuestions - Total number of questions
 * @param {object} difficulty - Object with easy, medium, hard counts
 * @returns {Promise<Array>} Array of question objects
 */
async function generateMCQs(content, numQuestions, difficulty) {
  const { easy = 0, medium = 0, hard = 0 } = difficulty;
  
  const prompt = `You are an expert quiz creator. Generate ${numQuestions} multiple-choice questions based on the following content.

CONTENT:
${content}

REQUIREMENTS:
- Generate exactly ${easy} EASY questions, ${medium} MEDIUM questions, and ${hard} HARD questions
- Each question must have exactly 4 options (A, B, C, D)
- Only ONE option should be correct
- Provide a clear explanation for the correct answer
- Easy questions: Test basic understanding and recall
- Medium questions: Require application and analysis
- Hard questions: Require synthesis, evaluation, and deep understanding

Return ONLY a valid JSON array with this EXACT structure (no additional text):
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Detailed explanation of why this answer is correct",
    "difficulty": "easy"
  }
]

IMPORTANT: 
- correctAnswer must be the index (0-3) of the correct option in the options array
- Ensure questions are diverse and cover different aspects of the content
- Make explanations clear and educational`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are an expert educational content creator specializing in creating high-quality multiple-choice questions. Always respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: "json_object" }
    });

    let questions;
    const responseContent = response.choices[0].message.content;
    
    try {
      // Try to parse the response as JSON
      const parsed = JSON.parse(responseContent);
      
      // Handle different response structures
      if (Array.isArray(parsed)) {
        questions = parsed;
      } else if (parsed.questions && Array.isArray(parsed.questions)) {
        questions = parsed.questions;
      } else if (parsed.quiz && Array.isArray(parsed.quiz)) {
        questions = parsed.quiz;
      } else {
        throw new Error('Unexpected response structure from AI');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseContent);
      throw new Error('Failed to parse AI response as JSON');
    }

    // Validate questions
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('No questions generated');
    }

    // Validate and clean each question
    const validatedQuestions = questions.map((q, index) => {
      if (!q.question || !Array.isArray(q.options) || q.options.length !== 4) {
        throw new Error(`Invalid question structure at index ${index}`);
      }

      return {
        id: index + 1,
        question: q.question.trim(),
        options: q.options.map(opt => opt.trim()),
        correctAnswer: parseInt(q.correctAnswer),
        explanation: q.explanation?.trim() || 'No explanation provided',
        difficulty: q.difficulty || 'medium'
      };
    });

    if (validatedQuestions.length !== numQuestions) {
      console.warn(`Expected ${numQuestions} questions but got ${validatedQuestions.length}`);
    }

    return validatedQuestions;

  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    
    if (error.code === 'insufficient_quota') {
      throw new Error('OpenAI API quota exceeded. Please check your API key and billing.');
    } else if (error.code === 'invalid_api_key') {
      throw new Error('Invalid OpenAI API key. Please check your configuration.');
    }
    
    throw new Error(`Failed to generate questions: ${error.message}`);
  }
}

module.exports = {
  generateMCQs
};
