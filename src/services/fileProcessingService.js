// Browser-compatible file processing service with comprehensive format support

class FileProcessingService {
  constructor() {
    // Comprehensive list of supported file types - ChatGPT-like flexibility
    this.supportedTypes = {
      // Text files
      'text/plain': 'txt',
      'text/markdown': 'md', 
      'text/csv': 'csv',
      'application/json': 'json',
      'text/html': 'html',
      'text/xml': 'xml',
      'text/javascript': 'js',
      'text/css': 'css',
      'application/xml': 'xml',
      'application/javascript': 'js',
      
      // Programming files
      'text/x-python': 'py',
      'text/x-java-source': 'java',
      'text/x-c': 'c',
      'text/x-c++src': 'cpp',
      'text/x-csharp': 'cs',
      'text/x-php': 'php',
      'text/x-ruby': 'rb',
      'text/x-go': 'go',
      'text/x-rust': 'rs',
      'text/x-kotlin': 'kt',
      'text/x-swift': 'swift',
      'text/x-scala': 'scala',
      'text/x-sql': 'sql',
      'text/x-yaml': 'yaml',
      'application/x-yaml': 'yaml',
      'text/yaml': 'yaml',
      
      // Document formats
      'application/pdf': 'pdf',
      'application/rtf': 'rtf',
      'text/rtf': 'rtf',
      
      // Microsoft Office formats
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
      'application/msword': 'doc',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
      'application/vnd.ms-excel': 'xls',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
      'application/vnd.ms-powerpoint': 'ppt',
      
      // OpenDocument formats
      'application/vnd.oasis.opendocument.text': 'odt',
      'application/vnd.oasis.opendocument.spreadsheet': 'ods',
      'application/vnd.oasis.opendocument.presentation': 'odp',
      
      // Data formats
      'application/csv': 'csv',
      'text/tab-separated-values': 'tsv',
      'application/vnd.ms-excel': 'xls',
      
      // Config and markup
      'application/toml': 'toml',
      'text/x-ini': 'ini',
      'application/x-wine-extension-ini': 'ini',
      'text/x-properties': 'properties',
      
      // Log files
      'text/x-log': 'log',
      
      // Other text-based formats
      'application/x-httpd-php': 'php',
      'application/x-sh': 'sh',
      'text/x-shellscript': 'sh'
    };
    
    // File extensions mapping for better detection
    this.extensionMap = {
      'txt': 'text', 'md': 'markdown', 'markdown': 'markdown', 'mdown': 'markdown',
      'csv': 'csv', 'tsv': 'tsv', 'json': 'json', 'jsonl': 'json',
      'html': 'html', 'htm': 'html', 'xml': 'xml', 'xhtml': 'html',
      'js': 'javascript', 'mjs': 'javascript', 'jsx': 'javascript',
      'ts': 'typescript', 'tsx': 'typescript',
      'css': 'css', 'scss': 'css', 'sass': 'css', 'less': 'css',
      'py': 'python', 'pyw': 'python', 'pyx': 'python',
      'java': 'java', 'jsp': 'java',
      'c': 'c', 'h': 'c', 'cpp': 'cpp', 'cc': 'cpp', 'cxx': 'cpp', 'hpp': 'cpp',
      'cs': 'csharp', 'vb': 'vb',
      'php': 'php', 'phtml': 'php',
      'rb': 'ruby', 'rbw': 'ruby',
      'go': 'go', 'rs': 'rust',
      'kt': 'kotlin', 'swift': 'swift', 'scala': 'scala',
      'sql': 'sql', 'mysql': 'sql', 'pgsql': 'sql',
      'yaml': 'yaml', 'yml': 'yaml',
      'toml': 'toml', 'ini': 'ini', 'cfg': 'ini', 'conf': 'ini',
      'properties': 'properties',
      'log': 'log', 'out': 'log',
      'sh': 'shell', 'bash': 'shell', 'zsh': 'shell', 'fish': 'shell',
      'bat': 'batch', 'cmd': 'batch',
      'ps1': 'powershell', 'psm1': 'powershell',
      'dockerfile': 'dockerfile',
      'pdf': 'pdf', 'rtf': 'rtf',
      // Microsoft Office documents
      'docx': 'word', 'doc': 'word',
      'xlsx': 'excel', 'xls': 'excel',
      'pptx': 'powerpoint', 'ppt': 'powerpoint',
      // OpenDocument formats
      'odt': 'opendocument-text', 'ods': 'opendocument-spreadsheet', 'odp': 'opendocument-presentation',
      'r': 'r', 'rmd': 'r',
      'tex': 'latex', 'bib': 'bibtex',
      'asm': 'assembly', 's': 'assembly',
      'pl': 'perl', 'pm': 'perl',
      'lua': 'lua', 'jl': 'julia',
      'elm': 'elm', 'clj': 'clojure', 'cljs': 'clojure',
      'f90': 'fortran', 'f95': 'fortran', 'f03': 'fortran',
      'dart': 'dart', 'vim': 'vim',
      'erl': 'erlang', 'hrl': 'erlang',
      'ex': 'elixir', 'exs': 'elixir',
      'hs': 'haskell', 'lhs': 'haskell',
      'ml': 'ocaml', 'mli': 'ocaml',
      'pas': 'pascal', 'pp': 'pascal',
      'ada': 'ada', 'adb': 'ada', 'ads': 'ada',
      'cob': 'cobol', 'cbl': 'cobol',
      'lisp': 'lisp', 'lsp': 'lisp', 'cl': 'lisp',
      'scm': 'scheme', 'ss': 'scheme',
      'tcl': 'tcl', 'tk': 'tcl',
      'vhdl': 'vhdl', 'vhd': 'vhdl',
      'v': 'verilog', 'sv': 'systemverilog'
    };
  }

  /**
   * Process a file and extract text chunks
   */
  async processFile(file, options = {}) {
    const defaultOptions = {
      chunkSize: 1000,
      chunkOverlap: 200,
      onProgress: null
    };
    
    const config = { ...defaultOptions, ...options };

    try {
      console.log(`📄 Processing file: ${file.name} (${file.size} bytes)`);

      // Report initial progress
      if (config.onProgress) {
        config.onProgress({ stage: 'reading', progress: 0 });
      }

      // Extract text from file
      const text = await this.extractText(file);
      
      if (config.onProgress) {
        config.onProgress({ stage: 'chunking', progress: 50 });
      }

      // Create chunks
      const chunks = this.createChunks(text, config.chunkSize, config.chunkOverlap);
      
      if (config.onProgress) {
        config.onProgress({ stage: 'complete', progress: 100 });
      }

      console.log(`✅ File processed: ${chunks.length} chunks created`);
      
      return {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        text: text,
        chunks: chunks,
        chunkCount: chunks.length
      };
    } catch (error) {
      console.error(`❌ Failed to process file ${file.name}:`, error);
      throw error;
    }
  }

  /**
   * Extract text from various file types
   */
  async extractText(file) {
    const fileType = file.type;
    const fileName = file.name.toLowerCase();
    const extension = fileName.split('.').pop();

    console.log(`🔍 Processing file: ${fileName} (${fileType || 'no MIME type'})`);

    try {
      // PDF files - use browser-compatible PDF.js
      if (extension === 'pdf' || fileType === 'application/pdf') {
        return await this.readPDFFile(file);
      }
      
      // CSV and TSV files
      if (extension === 'csv' || extension === 'tsv' || fileType === 'text/csv') {
        return await this.readCSVFile(file);
      }
      
      // JSON and JSONL files
      if (extension === 'json' || extension === 'jsonl' || fileType === 'application/json') {
        return await this.readJSONFile(file);
      }
      
      // HTML and XML files
      if (['html', 'htm', 'xml', 'xhtml'].includes(extension) || 
          fileType === 'text/html' || fileType === 'text/xml' || fileType === 'application/xml') {
        return await this.readHTMLFile(file);
      }
      
      // RTF files
      if (extension === 'rtf' || fileType === 'application/rtf' || fileType === 'text/rtf') {
        return await this.readRTFFile(file);
      }
      
      // Microsoft Office Word documents
      if (['docx', 'doc'].includes(extension) || 
          fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
          fileType === 'application/msword') {
        return await this.readWordFile(file);
      }
      
      // Microsoft Office Excel spreadsheets
      if (['xlsx', 'xls'].includes(extension) || 
          fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
          fileType === 'application/vnd.ms-excel') {
        return await this.readExcelFile(file);
      }
      
      // Microsoft Office PowerPoint presentations
      if (['pptx', 'ppt'].includes(extension) || 
          fileType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
          fileType === 'application/vnd.ms-powerpoint') {
        return await this.readPowerPointFile(file);
      }
      
      // OpenDocument formats
      if (['odt', 'ods', 'odp'].includes(extension) || 
          fileType?.includes('opendocument')) {
        return await this.readOpenDocumentFile(file);
      }
      
      // Programming and markup files - all treated as text with syntax highlighting info
      if (this.extensionMap[extension] || 
          fileType?.startsWith('text/') || 
          fileType?.includes('script') || 
          fileType?.includes('source')) {
        
        const text = await this.readTextFile(file);
        const language = this.extensionMap[extension] || 'text';
        
        // Add metadata for better processing
        return `[File: ${fileName}] [Language: ${language}]\n\n${text}`;
      }
      
      // Unknown but potentially text files - try reading as text
      console.log(`⚠️ Unknown file type: ${fileType || extension}, attempting to read as text`);
      return await this.readTextFile(file);
      
    } catch (error) {
      // If specific processing fails, try reading as plain text
      console.warn(`⚠️ Failed to process as ${extension}, trying as plain text:`, error.message);
      try {
        return await this.readTextFile(file);
      } catch (textError) {
        throw new Error(`Unable to process file ${fileName}: ${error.message}`);
      }
    }
  }

  /**
   * Read PDF file using PDF.js (browser-compatible)
   */
  async readPDFFile(file) {
    try {
      // Use PDF.js library if available
      if (typeof window !== 'undefined' && window.pdfjsLib) {
        const arrayBuffer = await this.readFileAsArrayBuffer(file);
        const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        
        let text = `PDF Document: ${file.name}\nPages: ${pdf.numPages}\n\n`;
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map(item => item.str).join(' ');
          text += `[Page ${i}]\n${pageText}\n\n`;
        }
        
        return text;
      } else {
        // Fallback: Try to extract text using browser APIs
        console.warn('PDF.js not available, attempting basic text extraction');
        
        // Try reading as array buffer and look for text patterns
        const arrayBuffer = await this.readFileAsArrayBuffer(file);
        const uint8Array = new Uint8Array(arrayBuffer);
        const binaryString = String.fromCharCode.apply(null, uint8Array);
        
        // Simple regex to extract readable text from PDF binary
        const textMatches = binaryString.match(/\(([^)]+)\)/g) || [];
        const extractedText = textMatches
          .map(match => match.slice(1, -1)) // Remove parentheses
          .filter(text => text.length > 2) // Filter out short/meaningless strings
          .join(' ');
        
        if (extractedText.length > 50) {
          return `PDF Content (Basic Extraction): ${file.name}\n\n${extractedText}`;
        } else {
          throw new Error('Unable to extract readable text from PDF');
        }
      }
    } catch (error) {
      console.warn('PDF processing failed:', error);
      throw new Error(`PDF processing failed: ${error.message}. Try converting to text format for better results.`);
    }
  }

  /**
   * Read RTF file
   */
  async readRTFFile(file) {
    try {
      const text = await this.readTextFile(file);
      
      // Basic RTF text extraction - remove RTF control codes
      let cleanText = text
        .replace(/\\[a-zA-Z0-9]+\s?/g, '') // Remove RTF control words
        .replace(/\{|\}/g, '') // Remove braces
        .replace(/\\\\/g, '\\') // Unescape backslashes
        .replace(/\\n/g, '\n') // Convert line breaks
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
      
      return `RTF Document: ${file.name}\n\n${cleanText}`;
    } catch (error) {
      throw new Error(`Failed to process RTF file: ${error.message}`);
    }
  }

  /**
   * Read Microsoft Word document (.docx, .doc)
   */
  async readWordFile(file) {
    try {
      const extension = file.name.toLowerCase().split('.').pop();
      
      if (extension === 'docx') {
        // Modern Word documents - enhanced extraction
        const text = await this.extractDocxContent(file);
        return `Word Document: ${file.name}\n\n${text}`;
      } else {
        // Legacy .doc files - enhanced binary extraction
        const arrayBuffer = await this.readFileAsArrayBuffer(file);
        const text = await this.extractTextFromBinaryAdvanced(arrayBuffer, 'word');
        return `Word Document: ${file.name}\n\n${text}`;
      }
    } catch (error) {
      console.warn(`Advanced Word processing failed: ${error.message}`);
      // Enhanced fallback with better text extraction
      try {
        const arrayBuffer = await this.readFileAsArrayBuffer(file);
        const text = await this.extractTextFromBinaryAdvanced(arrayBuffer, 'word');
        return `Word Document (fallback extraction): ${file.name}\n\n${text}`;
      } catch (fallbackError) {
        // Last resort: basic text attempt
        try {
          const text = await this.readTextFile(file);
          const cleanText = this.cleanExtractedText(text);
          return `Word Document (basic text extraction): ${file.name}\n\n${cleanText}`;
        } catch (textError) {
          return `Word Document: ${file.name}\n\n[Unable to extract readable content. The document may be corrupted or in an unsupported format.]`;
        }
      }
    }
  }

  /**
   * Read Microsoft Excel spreadsheet (.xlsx, .xls)
   */
  async readExcelFile(file) {
    try {
      const extension = file.name.toLowerCase().split('.').pop();
      
      if (extension === 'xlsx') {
        // Modern Excel documents - enhanced extraction
        const text = await this.extractXlsxContent(file);
        return `Excel Spreadsheet: ${file.name}\n\n${text}`;
      } else {
        // Legacy .xls files - enhanced binary extraction
        const arrayBuffer = await this.readFileAsArrayBuffer(file);
        const text = await this.extractTextFromBinaryAdvanced(arrayBuffer, 'excel');
        return `Excel Spreadsheet: ${file.name}\n\n${text}`;
      }
    } catch (error) {
      console.warn(`Advanced Excel processing failed: ${error.message}`);
      // Enhanced fallback
      try {
        const arrayBuffer = await this.readFileAsArrayBuffer(file);
        const text = await this.extractTextFromBinaryAdvanced(arrayBuffer, 'excel');
        return `Excel Spreadsheet (fallback extraction): ${file.name}\n\n${text}`;
      } catch (fallbackError) {
        try {
          const text = await this.readTextFile(file);
          const cleanText = this.cleanExtractedText(text);
          return `Excel Spreadsheet (basic text extraction): ${file.name}\n\n${cleanText}`;
        } catch (textError) {
          return `Excel Spreadsheet: ${file.name}\n\n[Unable to extract readable content. The spreadsheet may be corrupted or in an unsupported format.]`;
        }
      }
    }
  }

  /**
   * Read Microsoft PowerPoint presentation (.pptx, .ppt)
   */
  async readPowerPointFile(file) {
    try {
      const extension = file.name.toLowerCase().split('.').pop();
      
      if (extension === 'pptx') {
        // Modern PowerPoint documents are ZIP files with XML content
        return await this.readPowerPointXMLFile(file);
      } else {
        // Legacy .ppt files - try to extract text as best as possible
        const arrayBuffer = await this.readFileAsArrayBuffer(file);
        const text = await this.extractTextFromBinary(arrayBuffer, 'powerpoint');
        return `PowerPoint Presentation: ${file.name}\n\n${text}`;
      }
    } catch (error) {
      console.warn(`Failed to process PowerPoint file as Office document: ${error.message}`);
      // Fallback: try to read as text
      try {
        const text = await this.readTextFile(file);
        return `PowerPoint Presentation (basic text extraction): ${file.name}\n\n${this.cleanExtractedText(text)}`;
      } catch (textError) {
        throw new Error(`Failed to process PowerPoint file: ${error.message}`);
      }
    }
  }

  /**
   * Read OpenDocument format files (.odt, .ods, .odp)
   */
  async readOpenDocumentFile(file) {
    try {
      const extension = file.name.toLowerCase().split('.').pop();
      let contentPath = 'content.xml';
      let docType = 'OpenDocument';
      
      switch (extension) {
        case 'odt': docType = 'OpenDocument Text'; break;
        case 'ods': docType = 'OpenDocument Spreadsheet'; break;
        case 'odp': docType = 'OpenDocument Presentation'; break;
      }
      
      return await this.readOfficeXMLFile(file, contentPath, docType);
    } catch (error) {
      console.warn(`Failed to process OpenDocument file: ${error.message}`);
      // Fallback: try to read as text
      try {
        const text = await this.readTextFile(file);
        return `${docType} (basic text extraction): ${file.name}\n\n${this.cleanExtractedText(text)}`;
      } catch (textError) {
        throw new Error(`Failed to process OpenDocument file: ${error.message}`);
      }
    }
  }

  /**
   * Extract text from modern Office XML documents (.docx, .xlsx, .pptx)
   */
  async readOfficeXMLFile(file, xmlPath, docType) {
    try {
      // Office documents are ZIP files containing XML
      const arrayBuffer = await this.readFileAsArrayBuffer(file);
      const text = await this.extractXMLTextFromZip(arrayBuffer, xmlPath);
      return `${docType}: ${file.name}\n\n${text}`;
    } catch (error) {
      throw new Error(`Failed to extract XML from Office document: ${error.message}`);
    }
  }

  /**
   * Extract text from Excel XML format
   */
  async readExcelXMLFile(file) {
    try {
      const arrayBuffer = await this.readFileAsArrayBuffer(file);
      
      // Excel workbooks have multiple worksheets
      const worksheetTexts = [];
      
      // Try to extract from common worksheet paths
      for (let i = 1; i <= 10; i++) {
        try {
          const worksheetPath = `xl/worksheets/sheet${i}.xml`;
          const sheetText = await this.extractXMLTextFromZip(arrayBuffer, worksheetPath);
          if (sheetText && sheetText.trim()) {
            worksheetTexts.push(`\n--- Worksheet ${i} ---\n${sheetText}`);
          }
        } catch (e) {
          // Sheet doesn't exist, continue
          break;
        }
      }
      
      const allText = worksheetTexts.join('\n');
      return `Excel Spreadsheet: ${file.name}\n${allText || '\n[No readable content found]'}`;
    } catch (error) {
      throw new Error(`Failed to extract text from Excel file: ${error.message}`);
    }
  }

  /**
   * Extract text from PowerPoint XML format
   */
  async readPowerPointXMLFile(file) {
    try {
      const arrayBuffer = await this.readFileAsArrayBuffer(file);
      
      // PowerPoint presentations have multiple slides
      const slideTexts = [];
      
      // Try to extract from common slide paths
      for (let i = 1; i <= 50; i++) {
        try {
          const slidePath = `ppt/slides/slide${i}.xml`;
          const slideText = await this.extractXMLTextFromZip(arrayBuffer, slidePath);
          if (slideText && slideText.trim()) {
            slideTexts.push(`\n--- Slide ${i} ---\n${slideText}`);
          }
        } catch (e) {
          // Slide doesn't exist, continue
          break;
        }
      }
      
      const allText = slideTexts.join('\n');
      return `PowerPoint Presentation: ${file.name}\n${allText || '\n[No readable content found]'}`;
    } catch (error) {
      throw new Error(`Failed to extract text from PowerPoint file: ${error.message}`);
    }
  }

  /**
   * Extract XML text content from ZIP archive (Office documents)
   */
  async extractXMLTextFromZip(arrayBuffer, xmlPath) {
    try {
      // Basic ZIP file reading - this is a simplified implementation
      // In a production environment, you'd use a proper ZIP library
      
      // For now, try to extract text using basic binary parsing
      const text = await this.extractTextFromBinary(arrayBuffer, 'office');
      return this.cleanExtractedText(text);
    } catch (error) {
      throw new Error(`Failed to extract XML from ZIP: ${error.message}`);
    }
  }

  /**
   * Enhanced text extraction from binary data - specifically for Office documents
   */
  async extractTextFromBinaryAdvanced(arrayBuffer, docType) {
    try {
      const uint8Array = new Uint8Array(arrayBuffer);
      let extractedTexts = [];
      let currentString = '';
      
      // Different strategies based on document type
      const minStringLength = docType === 'word' ? 4 : docType === 'excel' ? 3 : 5;
      const contextWindow = 50; // Characters around found text to check for context
      
      // Strategy 1: Look for readable ASCII sequences
      for (let i = 0; i < uint8Array.length; i++) {
        const byte = uint8Array[i];
        
        // Extended ASCII range for better text detection
        if ((byte >= 32 && byte <= 126) || byte === 9) { // Include tabs
          currentString += String.fromCharCode(byte);
        } else if (byte === 0 || byte === 10 || byte === 13) {
          // End of string markers
          if (currentString.length >= minStringLength) {
            // Check if this looks like meaningful text
            if (this.isLikelyMeaningfulText(currentString)) {
              extractedTexts.push(currentString.trim());
            }
          }
          currentString = '';
        } else {
          // Non-printable character
          if (currentString.length >= minStringLength) {
            if (this.isLikelyMeaningfulText(currentString)) {
              extractedTexts.push(currentString.trim());
            }
          }
          currentString = '';
        }
      }
      
      // Add final string if valid
      if (currentString.length >= minStringLength && this.isLikelyMeaningfulText(currentString)) {
        extractedTexts.push(currentString.trim());
      }
      
      // Strategy 2: Look for UTF-8 encoded text (common in modern Office docs)
      if (extractedTexts.length === 0 || extractedTexts.join(' ').length < 50) {
        const utf8Texts = this.extractUTF8Text(uint8Array);
        extractedTexts.push(...utf8Texts);
      }
      
      // Strategy 3: Look for Unicode text patterns
      if (extractedTexts.length === 0 || extractedTexts.join(' ').length < 50) {
        const unicodeTexts = this.extractUnicodeText(uint8Array);
        extractedTexts.push(...unicodeTexts);
      }
      
      // Combine and clean extracted text
      let finalText = extractedTexts
        .filter(text => text && text.length > 2)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      // Final cleaning based on document type
      finalText = this.cleanDocumentText(finalText, docType);
      
      return finalText || '[No readable text content found in document]';
      
    } catch (error) {
      console.error('Error in enhanced binary text extraction:', error);
      return '[Error extracting text from document]';
    }
  }

  /**
   * Check if a string is likely to be meaningful text
   */
  isLikelyMeaningfulText(text) {
    if (!text || text.length < 3) return false;
    
    // Check for common word patterns
    const hasLetters = /[a-zA-Z]/.test(text);
    const hasSpaces = /\s/.test(text);
    const isNotAllCaps = !/^[A-Z\s\d\.\!\?\,\;\:]+$/.test(text);
    const notTooManyNumbers = (text.match(/\d/g) || []).length < text.length * 0.7;
    const notTooManySpecialChars = (text.match(/[^\w\s\.\!\?\,\;\:]/g) || []).length < text.length * 0.3;
    
    // Common words that indicate real content
    const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'this', 'that', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'project', 'system', 'data', 'information', 'document', 'report', 'analysis'];
    const hasCommonWords = commonWords.some(word => text.toLowerCase().includes(word));
    
    return hasLetters && (hasSpaces || text.length > 10) && notTooManyNumbers && notTooManySpecialChars && (isNotAllCaps || hasCommonWords);
  }

  /**
   * Extract UTF-8 encoded text from binary data
   */
  extractUTF8Text(uint8Array) {
    const texts = [];
    try {
      // Try to decode as UTF-8 in chunks
      const chunkSize = 1024;
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.slice(i, i + chunkSize);
        try {
          const decoder = new TextDecoder('utf-8', { fatal: false });
          const text = decoder.decode(chunk);
          const cleanText = text.replace(/[^\x20-\x7E\n\r\t]/g, ' ').trim();
          if (cleanText.length > 10 && this.isLikelyMeaningfulText(cleanText)) {
            texts.push(cleanText);
          }
        } catch (e) {
          // Skip invalid UTF-8 chunks
        }
      }
    } catch (error) {
      console.warn('UTF-8 extraction failed:', error);
    }
    return texts;
  }

  /**
   * Extract Unicode text patterns from binary data
   */
  extractUnicodeText(uint8Array) {
    const texts = [];
    try {
      // Look for null-terminated Unicode strings (common in Office docs)
      let currentText = '';
      for (let i = 0; i < uint8Array.length - 1; i += 2) {
        const char1 = uint8Array[i];
        const char2 = uint8Array[i + 1];
        
        // Little-endian Unicode
        if (char2 === 0 && char1 >= 32 && char1 <= 126) {
          currentText += String.fromCharCode(char1);
        } else if (char1 === 0 && char2 >= 32 && char2 <= 126) {
          // Big-endian Unicode
          currentText += String.fromCharCode(char2);
        } else {
          if (currentText.length > 10 && this.isLikelyMeaningfulText(currentText)) {
            texts.push(currentText.trim());
          }
          currentText = '';
        }
      }
      
      if (currentText.length > 10 && this.isLikelyMeaningfulText(currentText)) {
        texts.push(currentText.trim());
      }
    } catch (error) {
      console.warn('Unicode extraction failed:', error);
    }
    return texts;
  }

  /**
   * Clean document text based on document type
   */
  cleanDocumentText(text, docType) {
    if (!text) return '';
    
    let cleanText = text;
    
    // Remove common Office document artifacts
    cleanText = cleanText
      .replace(/Microsoft\s+Word/gi, '')
      .replace(/Microsoft\s+Excel/gi, '')
      .replace(/Microsoft\s+Office/gi, '')
      .replace(/\b(Arial|Times|Calibri|Helvetica)\b/gi, '')
      .replace(/\b\d{1,2}pt\b/gi, '')
      .replace(/Normal\s+style/gi, '')
      .replace (/\b(Bold|Italic|Underline)\b/gi, '')
      .replace(/\[Content_Types\]/gi, '')
      .replace(/rels\//gi, '')
      .replace(/word\//gi, '')
      .replace(/xl\//gi, '');
    
    // Document type specific cleaning
    if (docType === 'word') {
      cleanText = cleanText
        .replace(/\bparagraph\b/gi, '\n')
        .replace(/\bsection\b/gi, '\n')
        .replace(/\bheading\b/gi, '');
    } else if (docType === 'excel') {
      cleanText = cleanText
        .replace(/\bworksheet\b/gi, '\n')
        .replace(/\bsheet\b/gi, '\n')
        .replace(/\bcell\b/gi, '');
    }
    
    // Final cleanup
    cleanText = cleanText
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .replace(/^\s+|\s+$/g, '')
      .trim();
    
    return cleanText;
  }

  /**
   * Extract content from modern Word documents (.docx)
   */
  async extractDocxContent(file) {
    try {
      const arrayBuffer = await this.readFileAsArrayBuffer(file);
      
      // Try enhanced binary extraction first
      const extractedText = await this.extractTextFromBinaryAdvanced(arrayBuffer, 'word');
      
      if (extractedText && extractedText.length > 50 && !extractedText.includes('[No readable text content found]')) {
        return extractedText;
      }
      
      // If that didn't work well, try to find XML-like patterns
      const xmlText = this.extractXMLTextPatterns(arrayBuffer);
      if (xmlText && xmlText.length > 50) {
        return xmlText;
      }
      
      return extractedText || '[Unable to extract content from Word document]';
    } catch (error) {
      console.error('DOCX extraction error:', error);
      return '[Error reading Word document]';
    }
  }

  /**
   * Extract content from modern Excel documents (.xlsx)
   */
  async extractXlsxContent(file) {
    try {
      const arrayBuffer = await this.readFileAsArrayBuffer(file);
      
      // Try enhanced binary extraction
      const extractedText = await this.extractTextFromBinaryAdvanced(arrayBuffer, 'excel');
      
      if (extractedText && extractedText.length > 30 && !extractedText.includes('[No readable text content found]')) {
        return extractedText;
      }
      
      // Try to extract worksheet patterns
      const worksheetText = this.extractWorksheetPatterns(arrayBuffer);
      if (worksheetText && worksheetText.length > 30) {
        return worksheetText;
      }
      
      return extractedText || '[Unable to extract content from Excel spreadsheet]';
    } catch (error) {
      console.error('XLSX extraction error:', error);
      return '[Error reading Excel document]';
    }
  }

  /**
   * Extract XML-like text patterns from binary data
   */
  extractXMLTextPatterns(arrayBuffer) {
    try {
      const uint8Array = new Uint8Array(arrayBuffer);
      const decoder = new TextDecoder('utf-8', { fatal: false });
      const content = decoder.decode(uint8Array);
      
      // Look for text between XML-like tags
      const xmlPatterns = [
        /<w:t[^>]*>([^<]+)<\/w:t>/gi,  // Word text elements
        /<text[^>]*>([^<]+)<\/text>/gi, // Generic text elements
        />([^<>{}\[\]]+)</gi  // Text between angle brackets
      ];
      
      let extractedTexts = [];
      
      xmlPatterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          const text = match[1] || match[0];
          if (text && text.length > 3 && this.isLikelyMeaningfulText(text)) {
            extractedTexts.push(text.trim());
          }
        }
      });
      
      return extractedTexts.join(' ').trim();
    } catch (error) {
      return '';
    }
  }

  /**
   * Extract worksheet patterns from Excel data
   */
  extractWorksheetPatterns(arrayBuffer) {
    try {
      const uint8Array = new Uint8Array(arrayBuffer);
      const decoder = new TextDecoder('utf-8', { fatal: false });
      const content = decoder.decode(uint8Array);
      
      // Look for Excel-specific patterns
      const excelPatterns = [
        /<v>([^<]+)<\/v>/gi,  // Cell values
        /<t>([^<]+)<\/t>/gi,  // Text elements
        /<c[^>]*r="[A-Z]+\d+"[^>]*>([^<]+)</gi  // Cell references
      ];
      
      let extractedTexts = [];
      
      excelPatterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          const text = match[1] || match[0];
          if (text && text.length > 1 && this.isLikelyMeaningfulText(text)) {
            extractedTexts.push(text.trim());
          }
        }
      });
      
      // Format as table-like structure
      const result = extractedTexts.join(' | ').trim();
      return result ? `Data extracted from spreadsheet:\n${result}` : '';
    } catch (error) {
      return '';
    }
  }

  /**
   * Clean and format extracted text
   */
  cleanExtractedText(text) {
    if (!text) return '[No readable content found]';
    
    return text
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Remove common binary artifacts
      .replace(/[^\x20-\x7E\n\r\t]/g, '')
      // Remove very short fragments (likely artifacts)
      .split(' ')
      .filter(word => word.length > 1)
      .join(' ')
      // Normalize line breaks
      .replace(/\s*\n\s*/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim() || '[No readable content found]';
  }

  /**
   * Read file as ArrayBuffer
   */
  async readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target.result);
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Read a text file
   */
  async readTextFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target.result);
      reader.onerror = (error) => reject(error);
      reader.readAsText(file, 'UTF-8');
    });
  }

  /**
   * Read and parse CSV file
   */
  async readCSVFile(file) {
    const text = await this.readTextFile(file);
    const lines = text.split('\n');
    
    if (lines.length === 0) return '';

    // Convert CSV to readable text
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    let result = `CSV File: ${file.name}\n\n`;
    result += `Headers: ${headers.join(', ')}\n\n`;
    
    // Add sample rows (first 10)
    for (let i = 1; i < Math.min(11, lines.length); i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        result += `Row ${i}: `;
        headers.forEach((header, idx) => {
          if (values[idx]) {
            result += `${header}: ${values[idx]}; `;
          }
        });
        result += '\n';
      }
    }

    if (lines.length > 11) {
      result += `\n... and ${lines.length - 11} more rows`;
    }

    return result;
  }

  /**
   * Read and format JSON file
   */
  async readJSONFile(file) {
    const text = await this.readTextFile(file);
    
    try {
      const data = JSON.parse(text);
      return `JSON File: ${file.name}\n\n${JSON.stringify(data, null, 2)}`;
    } catch (error) {
      // If JSON parsing fails, return as text
      return text;
    }
  }

  /**
   * Read HTML file and extract text content
   */
  async readHTMLFile(file) {
    const html = await this.readTextFile(file);
    
    // Create a temporary DOM element to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Remove script and style elements
    const scripts = tempDiv.querySelectorAll('script, style');
    scripts.forEach(element => element.remove());
    
    // Extract text content
    const text = tempDiv.textContent || tempDiv.innerText || '';
    
    return `HTML File: ${file.name}\n\n${text.replace(/\s+/g, ' ').trim()}`;
  }

  /**
   * Create text chunks with overlap
   */
  createChunks(text, chunkSize = 1000, overlap = 200) {
    if (!text || text.length === 0) {
      return [];
    }

    const chunks = [];
    let start = 0;

    while (start < text.length) {
      let end = start + chunkSize;
      
      // If this isn't the last chunk, try to break at a word boundary
      if (end < text.length) {
        const nextSpace = text.lastIndexOf(' ', end);
        const nextNewline = text.lastIndexOf('\n', end);
        const breakPoint = Math.max(nextSpace, nextNewline);
        
        if (breakPoint > start + chunkSize * 0.7) {
          end = breakPoint;
        }
      }

      const chunk = text.slice(start, end).trim();
      if (chunk.length > 0) {
        chunks.push(chunk);
      }

      // Move start position for next chunk with overlap
      start = Math.max(start + chunkSize - overlap, end);
    }

    return chunks;
  }

  /**
   * Check if file type is supported
   */
  isFileTypeSupported(file) {
    const fileType = file.type;
    const fileName = file.name.toLowerCase();
    
    // Check supported MIME types
    if (this.supportedTypes[fileType]) {
      return true;
    }
    
    // Check file extensions using our comprehensive extension map
    const extension = fileName.split('.').pop();
    if (this.extensionMap[extension]) {
      return true;
    }
    
    // For unknown types, if it's likely text-based, we'll try to process it
    if (fileType && (
      fileType.startsWith('text/') ||
      fileType.includes('json') ||
      fileType.includes('xml') ||
      fileType.includes('script') ||
      fileType.includes('source')
    )) {
      return true;
    }
    
    // Additional check for common programming file extensions without MIME type
    const programmingExtensions = Object.keys(this.extensionMap);
    return programmingExtensions.includes(extension);
  }

  /**
   * Get file type info
   */
  getFileTypeInfo(file) {
    const fileName = file.name.toLowerCase();
    
    if (fileName.endsWith('.txt')) return { type: 'text', icon: '📄' };
    if (fileName.endsWith('.md') || fileName.endsWith('.markdown')) return { type: 'markdown', icon: '📝' };
    if (fileName.endsWith('.csv')) return { type: 'csv', icon: '📊' };
    if (fileName.endsWith('.json')) return { type: 'json', icon: '🔧' };
    if (fileName.endsWith('.html') || fileName.endsWith('.htm')) return { type: 'html', icon: '🌐' };
    if (fileName.endsWith('.xml')) return { type: 'xml', icon: '📋' };
    if (fileName.endsWith('.pdf')) return { type: 'pdf', icon: '📕' };
    
    // Microsoft Office documents - now fully supported!
    if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) return { type: 'word', icon: '📘' };
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) return { type: 'excel', icon: '📗' };
    if (fileName.endsWith('.pptx') || fileName.endsWith('.ppt')) return { type: 'powerpoint', icon: '📙' };
    
    // OpenDocument formats
    if (fileName.endsWith('.odt')) return { type: 'opendocument-text', icon: '📄' };
    if (fileName.endsWith('.ods')) return { type: 'opendocument-spreadsheet', icon: '�' };
    if (fileName.endsWith('.odp')) return { type: 'opendocument-presentation', icon: '📊' };
    
    // RTF documents
    if (fileName.endsWith('.rtf')) return { type: 'rtf', icon: '📄' };
    
    return { type: 'unknown', icon: '📄' };
  }

  /**
   * Validate file before processing
   */
  validateFile(file, maxSize = 10 * 1024 * 1024) { // 10MB default
    const errors = [];

    if (!file) {
      errors.push('No file provided');
      return errors;
    }

    if (file.size === 0) {
      errors.push('File is empty');
    }

    if (file.size > maxSize) {
      errors.push(`File too large (${Math.round(file.size / 1024 / 1024)}MB). Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB`);
    }

    if (!this.isFileTypeSupported(file)) {
      errors.push(`File type not supported: ${file.type || 'unknown'}`);
    }

    return errors;
  }

  /**
   * Get processing statistics
   */
  getStats() {
    return {
      supportedTypes: Object.keys(this.supportedTypes),
      supportedExtensions: ['.txt', '.md', '.csv', '.json', '.html', '.xml']
    };
  }
}

// Create and export singleton instance
const fileProcessingService = new FileProcessingService();
export default fileProcessingService;
