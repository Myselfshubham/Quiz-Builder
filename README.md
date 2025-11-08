# 🎓 AI-Powered MCQ Generator & Quiz Platform

A fully responsive web application that enables users to generate and solve AI-created multiple-choice questions (MCQs) on any device. The platform leverages OpenAI's API for intelligent question generation and includes advanced features for customization, real-time feedback, and detailed result reporting.

## ✨ Features

### 🤖 AI-Powered MCQ Generation
- Automatically generate high-quality MCQs with four options per question
- Select different difficulty levels: Easy, Medium, Hard
- Customize the number of questions for each difficulty level

### 📄 Multiple Input Sources
- **Text Input**: Directly enter or paste content
- **File Upload**: Support for DOCX, PDF, and TXT files (up to 10MB)
- Intelligent document parsing and content extraction

### ⚙️ Quiz Customization
- Specify the desired number of questions (1-50)
- Select difficulty distribution
- Set custom time limits (1-180 minutes)
- Quick preset configurations for common scenarios

### 📝 Interactive Quiz Experience
- Fully responsive UI for desktop, tablet, and mobile
- Real-time countdown timer with warnings
- Progress tracking and question navigation
- Auto-submit when time expires
- Visual indicators for answered/unanswered questions

### 📊 Comprehensive Results & Feedback
- Detailed performance metrics and grading
- Question-by-question breakdown showing:
  - Your selected answer
  - Correct answer
  - Detailed explanations for incorrect answers
- Export results to PDF
- Performance grades (A+ to F) with percentages

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **jsPDF & html2canvas** - PDF export functionality
- **CSS3** - Responsive design with mobile-first approach

### Backend
- **Node.js & Express** - Server framework
- **OpenAI API** - AI-powered question generation
- **Multer** - File upload handling
- **PDF-Parse** - PDF document parsing
- **Mammoth** - DOCX document parsing
- **Joi** - Request validation
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14 or higher)
- **npm** (v6 or higher)
- **OpenAI API Key** (Get one from [OpenAI Platform](https://platform.openai.com/))

## 🚀 Installation & Setup

### 1. Clone or Navigate to the Project Directory

```bash
cd "Quiz Builder"
```

### 2. Install Dependencies

Install all dependencies for both frontend and backend:

```bash
npm run install-all
```

Or install separately:

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cd backend
copy .env.example .env
```

Edit the `.env` file and add your OpenAI API key:

```env
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# File Upload Configuration
MAX_FILE_SIZE=10485760
```

**Important**: Replace `your_openai_api_key_here` with your actual OpenAI API key.

### 4. Start the Application

#### Option A: Run Both Frontend and Backend Together (Recommended)

From the root directory:

```bash
npm run dev
```

#### Option B: Run Frontend and Backend Separately

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm start
```

### 5. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

The backend API will be running on:
```
http://localhost:5000
```

## 📖 Usage Guide

### Step 1: Input Content
1. Choose between **Text Input** or **File Upload**
2. For text input: Enter or paste content (minimum 50 characters)
3. For file upload: Select a PDF, DOCX, or TXT file (max 10MB)
4. Click **Continue to Configuration**

### Step 2: Configure Quiz
1. Select the number of questions for each difficulty:
   - **Easy**: Basic understanding and recall
   - **Medium**: Application and analysis
   - **Hard**: Deep understanding and synthesis
2. Set the time limit using the slider (1-180 minutes)
3. Or use quick presets: Quick Quiz, Balanced, or Challenge
4. Click **Generate Quiz** and wait for AI to create your questions

### Step 3: Take the Quiz
1. Answer questions by clicking on your choice (A, B, C, or D)
2. Navigate between questions using:
   - Previous/Next buttons
   - Question number buttons at the top
3. Monitor the timer and progress bar
4. Submit the quiz when done or it will auto-submit when time expires

### Step 4: View Results
1. See your overall grade and percentage
2. Review detailed statistics:
   - Correct answers
   - Incorrect answers
   - Unanswered questions
3. Examine each question with:
   - Your selected answer
   - The correct answer
   - Explanations for incorrect answers
4. Download your results as a PDF
5. Start a new quiz if desired

## 🏗️ Project Structure

```
Quiz Builder/
├── backend/
│   ├── controllers/
│   │   └── quizController.js      # Request handlers
│   ├── routes/
│   │   └── quizRoutes.js          # API routes
│   ├── services/
│   │   ├── aiService.js           # OpenAI integration
│   │   └── documentParser.js     # Document parsing
│   ├── uploads/                   # Temporary file storage
│   ├── .env.example              # Environment variables template
│   ├── package.json
│   └── server.js                 # Express server setup
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Home.js           # Landing page
│   │   │   ├── Home.css
│   │   │   ├── QuizConfig.js     # Quiz configuration
│   │   │   ├── QuizConfig.css
│   │   │   ├── QuizSession.js    # Quiz taking interface
│   │   │   ├── QuizSession.css
│   │   │   ├── Results.js        # Results display
│   │   │   └── Results.css
│   │   ├── App.js                # Main app component
│   │   ├── App.css
│   │   ├── index.js              # React entry point
│   │   └── index.css
│   └── package.json
│
├── .gitignore
├── package.json                   # Root package with scripts
└── README.md
```

## 🔒 Security Features

- **Helmet**: Security headers protection
- **Rate Limiting**: Prevents API abuse (100 requests per 15 minutes)
- **File Validation**: Strict file type and size checking
- **Input Validation**: Joi schema validation for all requests
- **CORS**: Configured cross-origin resource sharing
- **Environment Variables**: Sensitive data protection

## 🎨 Responsive Design

The application is fully responsive and tested on:
- ✅ Desktop (1920px and above)
- ✅ Laptop (1024px - 1919px)
- ✅ Tablet (768px - 1023px)
- ✅ Mobile (320px - 767px)

### Mobile-Friendly Features
- Touch-optimized interface
- Collapsible navigation
- Optimized font sizes and spacing
- Efficient use of screen real estate

## 🌐 API Endpoints

### POST `/api/quiz/generate-from-text`
Generate quiz from text input.

**Request Body:**
```json
{
  "content": "Your text content here...",
  "numQuestions": 10,
  "difficulty": {
    "easy": 3,
    "medium": 4,
    "hard": 3
  },
  "timeLimit": 15
}
```

### POST `/api/quiz/generate-from-file`
Generate quiz from uploaded file.

**Request:**
- Form Data with file upload
- Fields: `file`, `numQuestions`, `difficulty`, `timeLimit`

### GET `/api/health`
Health check endpoint.

## 🐛 Troubleshooting

### Common Issues

1. **OpenAI API Errors**
   - Ensure your API key is valid and has sufficient credits
   - Check the `.env` file is properly configured
   - Verify you're using the correct API key format

2. **File Upload Issues**
   - Ensure files are under 10MB
   - Check file format (PDF, DOCX, TXT only)
   - Verify the `uploads` directory exists and has write permissions

3. **Port Already in Use**
   - Change the PORT in backend `.env` file
   - Kill the process using the port: `npx kill-port 5000`

4. **Module Not Found Errors**
   - Delete `node_modules` and reinstall: `npm run install-all`
   - Clear npm cache: `npm cache clean --force`

5. **PDF Export Not Working**
   - Ensure sufficient browser permissions
   - Try a different browser (Chrome/Edge recommended)

## 🔧 Configuration Options

### Backend Configuration (`.env`)
```env
OPENAI_API_KEY=           # Your OpenAI API key (required)
PORT=5000                 # Backend server port
NODE_ENV=development      # Environment mode
FRONTEND_URL=             # Frontend URL for CORS
MAX_FILE_SIZE=10485760    # Max upload size in bytes (10MB)
```

### OpenAI Model Options
Edit `backend/services/aiService.js` to change the AI model:
```javascript
model: "gpt-4-turbo-preview"  // or "gpt-3.5-turbo" for lower cost
```

## 📦 Production Deployment

### Build Frontend for Production
```bash
cd frontend
npm run build
```

### Environment Variables for Production
Update backend `.env`:
```env
NODE_ENV=production
FRONTEND_URL=https://your-domain.com
```

### Deployment Platforms
- **Frontend**: Vercel, Netlify, GitHub Pages
- **Backend**: Heroku, Railway, AWS, DigitalOcean
- **Full-Stack**: Render, Railway, AWS Elastic Beanstalk

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- OpenAI for their powerful GPT API
- React team for the amazing framework
- All open-source contributors

## 📞 Support

For issues, questions, or suggestions:
1. Check the troubleshooting section
2. Review existing issues
3. Create a new issue with detailed information

---

**Made with ❤️ using React, Node.js, and OpenAI**
