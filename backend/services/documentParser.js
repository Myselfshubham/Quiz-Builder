const fs = require('fs').promises;
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const path = require('path');

/**
 * Parse document content based on file type
 * @param {string} filePath - Path to the uploaded file
 * @param {string} mimeType - MIME type of the file
 * @returns {Promise<string>} Extracted text content
 */
async function parseDocument(filePath, mimeType) {
  try {
    const ext = path.extname(filePath).toLowerCase();
    
    switch (ext) {
      case '.pdf':
        return await parsePDF(filePath);
      
      case '.docx':
        return await parseDOCX(filePath);
      
      case '.txt':
        return await parseTXT(filePath);
      
      default:
        throw new Error(`Unsupported file type: ${ext}`);
    }
  } catch (error) {
    console.error('Error parsing document:', error);
    throw new Error(`Failed to parse document: ${error.message}`);
  }
}

/**
 * Parse PDF file
 */
async function parsePDF(filePath) {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdfParse(dataBuffer);
    
    if (!data.text || data.text.trim().length === 0) {
      throw new Error('PDF file appears to be empty or contains no readable text');
    }
    
    return cleanText(data.text);
  } catch (error) {
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
}

/**
 * Parse DOCX file
 */
async function parseDOCX(filePath) {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    
    if (!result.value || result.value.trim().length === 0) {
      throw new Error('DOCX file appears to be empty or contains no readable text');
    }
    
    if (result.messages && result.messages.length > 0) {
      console.warn('DOCX parsing warnings:', result.messages);
    }
    
    return cleanText(result.value);
  } catch (error) {
    throw new Error(`Failed to parse DOCX: ${error.message}`);
  }
}

/**
 * Parse TXT file
 */
async function parseTXT(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    
    if (!content || content.trim().length === 0) {
      throw new Error('TXT file appears to be empty');
    }
    
    return cleanText(content);
  } catch (error) {
    throw new Error(`Failed to parse TXT: ${error.message}`);
  }
}

/**
 * Clean and normalize text content
 */
function cleanText(text) {
  return text
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/\n{3,}/g, '\n\n') // Remove excessive line breaks
    .replace(/\t/g, ' ') // Replace tabs with spaces
    .replace(/[ ]{2,}/g, ' ') // Remove excessive spaces
    .trim();
}

module.exports = {
  parseDocument
};
