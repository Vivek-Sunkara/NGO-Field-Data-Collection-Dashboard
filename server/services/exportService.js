import PDFDocument from 'pdfkit';
import { stringify } from 'csv-stringify/sync';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EXPORT_DIR = path.join(__dirname, '..', 'public', 'exports');

export class ExportService {
  static stripMarkdown(text) {
    if (!text) return '';
    return text
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/__(.*?)__/g, '$1')
      .replace(/_(.*?)_/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/^\s*[-*+]\s+/gm, '• ')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/^\|[-| :]+\|$/gm, '')
      .replace(/\|/g, ' ')
      .trim();
  }

  static ensureExportDir() {
    if (!fs.existsSync(EXPORT_DIR)) {
      fs.mkdirSync(EXPORT_DIR, { recursive: true });
    }
    return EXPORT_DIR;
  }

  static sanitizeFileSegment(value) {
    return String(value)
      .trim()
      .replace(/[^a-z0-9-_]+/gi, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 48) || 'event';
  }

  static generateFileName(analysisType, eventLabel) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const randomId = Math.random().toString(36).substring(2, 8);
    const slug = this.sanitizeFileSegment(eventLabel);
    return `${analysisType}-${slug}-${timestamp}-${randomId}`;
  }

  static async exportToPDF(analysisData, eventName, analysisType) {
    return new Promise((resolve, reject) => {
      try {
        const exportDir = this.ensureExportDir();
        const fileName = this.generateFileName(analysisType, eventName);
        const filePath = path.join(exportDir, `${fileName}.pdf`);

        const doc = new PDFDocument({
          margin: 50,
          bufferPages: true
        });

        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Header
        doc.fontSize(20).font('Helvetica-Bold').text('AI Analysis Report', { align: 'center' });
        doc.moveDown(0.3);
        doc.fontSize(12).font('Helvetica').text(`Event: ${eventName}`, { align: 'center' });
        doc.fontSize(10).text(`Analysis Type: ${analysisType.toUpperCase()}`, { align: 'center' });
        doc.text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(0.5);

        // Content
        doc.fontSize(12).font('Helvetica-Bold').text('Analysis Results:', { underline: true });
        doc.moveDown(0.3);
        doc.fontSize(11).font('Helvetica');
        
        // Wrap text for better readability
        const options = {
          width: 500,
          align: 'left',
          ellipsis: false
        };

        doc.text(this.stripMarkdown(analysisData.response), options);
        
        // Metadata
        doc.moveDown(0.5);
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(0.3);
        doc.fontSize(9).text(`Submissions Analyzed: ${analysisData.submissionCount}`, { color: '#666666' });
        doc.text(`Cache Status: ${analysisData.isCached ? 'Cached' : 'Fresh Analysis'}`, { color: '#666666' });
        
        doc.on('error', (err) => {
          reject(new Error(`PDF generation failed: ${err.message}`));
        });

        stream.on('error', (err) => {
          reject(new Error(`PDF write failed: ${err.message}`));
        });

        stream.on('finish', () => {
          resolve({
            fileName: `${fileName}.pdf`,
            filePath,
            mimeType: 'application/pdf',
            size: fs.statSync(filePath).size
          });
        });

        doc.end();
      } catch (error) {
        reject(new Error(`PDF export error: ${error.message}`));
      }
    });
  }

  static async exportToCSV(analysisData, submissions, eventName, analysisType) {
    try {
      const exportDir = this.ensureExportDir();
      const fileName = this.generateFileName(analysisType, eventName);
      const filePath = path.join(exportDir, `${fileName}.csv`);

      // Prepare data for CSV
      const csvData = [
        ['AI Analysis Export'],
        ['Event', eventName],
        ['Analysis Type', analysisType.toUpperCase()],
        ['Generated', new Date().toLocaleString()],
        ['Submissions Analyzed', analysisData.submissionCount],
        [],
        ['Analysis Results'],
        [analysisData.response],
        [],
        ['Submission Details']
      ];

      // Add submission details
      if (submissions && submissions.length > 0) {
        const headers = Object.keys(submissions[0]);
        csvData.push(headers);
        
        submissions.forEach(submission => {
          csvData.push(headers.map(header => {
            const value = submission[header];
            if (typeof value === 'object') {
              return JSON.stringify(value);
            }
            return value || '';
          }));
        });
      }

      const csvContent = stringify(csvData);
      fs.writeFileSync(filePath, csvContent);

      return {
        fileName: `${fileName}.csv`,
        filePath,
        mimeType: 'text/csv',
        size: fs.statSync(filePath).size
      };
    } catch (error) {
      throw new Error(`CSV export error: ${error.message}`);
    }
  }

  static async exportToMarkdown(analysisData, eventName, analysisType) {
    try {
      const exportDir = this.ensureExportDir();
      const fileName = this.generateFileName(analysisType, eventName);
      const filePath = path.join(exportDir, `${fileName}.md`);

      const markdown = [
        `# AI Analysis Report`,
        ``,
        `| Field | Value |`,
        `| --- | --- |`,
        `| **Event** | ${eventName} |`,
        `| **Analysis Type** | ${analysisType.toUpperCase()} |`,
        `| **Generated** | ${new Date().toLocaleString()} |`,
        `| **Submissions Analyzed** | ${analysisData.submissionCount} |`,
        `| **Cache Status** | ${analysisData.isCached ? 'Cached' : 'Fresh Analysis'} |`,
        ``,
        `---`,
        ``,
        analysisData.response
      ].join('\n');

      fs.writeFileSync(filePath, markdown, 'utf8');

      return {
        fileName: `${fileName}.md`,
        filePath,
        mimeType: 'text/markdown',
        size: fs.statSync(filePath).size
      };
    } catch (error) {
      throw new Error(`Markdown export error: ${error.message}`);
    }
  }

  static async exportToJSON(analysisData, submissions, eventName, analysisType) {
    try {
      const exportDir = this.ensureExportDir();
      const fileName = this.generateFileName(analysisType, eventName);
      const filePath = path.join(exportDir, `${fileName}.json`);

      const jsonData = {
        metadata: {
          eventName,
          analysisType: analysisType.toUpperCase(),
          generatedAt: new Date().toISOString(),
          submissionsAnalyzed: analysisData.submissionCount,
          isCached: analysisData.isCached
        },
        analysis: {
          type: analysisType,
          response: analysisData.response,
          customPrompt: analysisData.customPrompt || null
        },
        submissions: submissions || [],
        exportVersion: '1.0'
      };

      fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));

      return {
        fileName: `${fileName}.json`,
        filePath,
        mimeType: 'application/json',
        size: fs.statSync(filePath).size
      };
    } catch (error) {
      throw new Error(`JSON export error: ${error.message}`);
    }
  }

  static async cleanupOldExports(maxAgeHours = 72) {
    try {
      const exportDir = this.ensureExportDir();
      const now = Date.now();
      const maxAge = maxAgeHours * 60 * 60 * 1000;

      const files = fs.readdirSync(exportDir);
      
      files.forEach(file => {
        const filePath = path.join(exportDir, file);
        const stats = fs.statSync(filePath);
        
        if (now - stats.mtimeMs > maxAge) {
          fs.unlinkSync(filePath);
          console.log(`[Export] Cleaned up old file: ${file}`);
        }
      });

      return { success: true, cleanedUp: files.length };
    } catch (error) {
      console.error('[Export Service Error]', error.message);
      return { success: false, error: error.message };
    }
  }
}

export default ExportService;
