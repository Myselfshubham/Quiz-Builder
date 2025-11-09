// Multi-provider AI service supporting OpenAI, Google Gemini, Claude, etc.

/**
 * Get the configured AI provider and client
 */
function getAIProvider() {
  const provider = process.env.AI_PROVIDER || 'openai';
  
  switch (provider.toLowerCase()) {
    case 'openai':
      const OpenAI = require('openai');
      return {
        type: 'openai',
        client: new OpenAI({ apiKey: process.env.OPENAI_API_KEY }),
        model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview'
      };
    
    case 'gemini':
    case 'google':
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      return {
        type: 'gemini',
        client: new GoogleGenerativeAI(process.env.GEMINI_API_KEY),
        model: process.env.GEMINI_MODEL || 'gemini-1.5-pro'
      };
    
    case 'claude':
    case 'anthropic':
      const Anthropic = require('@anthropic-ai/sdk');
      return {
        type: 'claude',
        client: new Anthropic({ apiKey: process.env.CLAUDE_API_KEY }),
        model: process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022'
      };
    
    default:
      throw new Error(`Unsupported AI provider: ${provider}. Supported providers: openai, gemini, claude`);
  }
}

/**
 * Generate the prompt for quiz creation
 */
function createQuizPrompt(content, numQuestions, difficulty) {
  const { easy = 0, medium = 0, hard = 0 } = difficulty;
  
  return `You are an expert quiz creator. Generate ${numQuestions} multiple-choice questions based on the following content.

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
}

/**
 * Generate MCQs using OpenAI API
 */
async function generateWithOpenAI(provider, prompt) {
  const response = await provider.client.chat.completions.create({
    model: provider.model,
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

  return response.choices[0].message.content;
}

/**
 * Generate MCQs using Google Gemini API
 */
async function generateWithGemini(provider, prompt) {
  const model = provider.client.getGenerativeModel({ 
    model: provider.model,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 4000,
    }
  });

  const systemPrompt = "You are an expert educational content creator specializing in creating high-quality multiple-choice questions. Always respond with valid JSON only.";
  const fullPrompt = `${systemPrompt}\n\n${prompt}`;

  const result = await model.generateContent(fullPrompt);
  const response = await result.response;
  return response.text();
}

/**
 * Generate MCQs using Claude API
 */
async function generateWithClaude(provider, prompt) {
  const response = await provider.client.messages.create({
    model: provider.model,
    max_tokens: 4000,
    temperature: 0.7,
    system: "You are an expert educational content creator specializing in creating high-quality multiple-choice questions. Always respond with valid JSON only.",
    messages: [
      {
        role: "user",
        content: prompt
      }
    ]
  });

  return response.content[0].text;
}

/**
 * Generate MCQs using the configured AI provider
 * @param {string} content - The content to generate questions from
 * @param {number} numQuestions - Total number of questions
 * @param {object} difficulty - Object with easy, medium, hard counts
 * @returns {Promise<Array>} Array of question objects
 */
async function generateMCQs(content, numQuestions, difficulty) {
  try {
    const provider = getAIProvider();
    const prompt = createQuizPrompt(content, numQuestions, difficulty);
    
    let responseContent;
    
    // Route to the appropriate provider
    switch (provider.type) {
      case 'openai':
        responseContent = await generateWithOpenAI(provider, prompt);
        break;
      case 'gemini':
        responseContent = await generateWithGemini(provider, prompt);
        break;
      case 'claude':
        responseContent = await generateWithClaude(provider, prompt);
        break;
      default:
        throw new Error(`Unsupported provider type: ${provider.type}`);
    }

    // Parse and validate the response
    let questions;
    try {
      // Clean the response (remove any markdown formatting or extra text)
      let cleanResponse = responseContent.trim();
      
      // Remove markdown code blocks if present
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      } else if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/^```\n?/, '').replace(/\n?```$/, '');
      }
      
      const parsed = JSON.parse(cleanResponse);
      
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
    console.error(`Error calling ${provider?.type || 'AI'} API:`, error);
    
    // Provider-specific error handling
    if (error.code === 'insufficient_quota' || error.message?.includes('quota')) {
      throw new Error(`${provider?.type?.toUpperCase() || 'AI'} API quota exceeded. Please check your API key and billing.`);
    } else if (error.code === 'invalid_api_key' || error.message?.includes('API key')) {
      throw new Error(`Invalid ${provider?.type?.toUpperCase() || 'AI'} API key. Please check your configuration.`);
    } else if (error.code === 'model_not_found' || error.message?.includes('model')) {
      throw new Error(`Model not found. Please check your ${provider?.type?.toUpperCase() || 'AI'} model configuration.`);
    }
    
    throw new Error(`Failed to generate questions: ${error.message}`);
  }
}

module.exports = {
  generateMCQs
};
