import axios from 'axios';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent';

const MARKDOWN_FORMAT_INSTRUCTION = `
Format the entire response as clean Markdown:
- Start with a single # title for the report
- Use ## and ### for sections and subsections
- Use bullet lists (-) or numbered lists (1.) where appropriate
- Use **bold** for key metrics and important terms
- Use tables when comparing workers, regions, or metrics
- Do not wrap the response in code fences or use HTML tags
`.trim();

export class GeminiService {
  static async callGeminiAPI(prompt, options = {}) {
    try {
      const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || process.env.OPENAI_API_KEY;
      if (!apiKey) {
        console.error('[Gemini] API key missing. Expected env var GEMINI_API_KEY.');
        throw new Error('Gemini API key not configured');
      }

      const response = await axios.post(
        `${GEMINI_API_URL}?key=${apiKey}`,
        {
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: options.temperature ?? 0.3,
            topP: 0.9,
            maxOutputTokens: options.maxOutputTokens ?? 4096,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_NONE',
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_NONE',
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_NONE',
            },
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_NONE',
            },
            {
              category: 'HARM_CATEGORY_CIVIC_INTEGRITY',
              threshold: 'BLOCK_NONE',
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      // Extract text from response
      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error('Invalid response format from Gemini API');
      }

      return text;
    } catch (error) {
      console.error('[Gemini API Error]', error.message);
      if (error.response?.data) {
        console.error('[Gemini API Response]', error.response.data);
      }
      throw new Error(`Gemini API call failed: ${error.message}`);
    }
  }

  static async generateSummary(submissionsData) {
    const prompt = `
You are an expert data analyst. Analyze the following form submissions and provide a concise summary highlighting:
1. Main themes and topics
2. Key findings
3. Notable patterns
4. Data quality assessment

Submissions Data:
${JSON.stringify(submissionsData, null, 2)}

Provide a well-structured summary in 200-300 words.

${MARKDOWN_FORMAT_INSTRUCTION}
    `.trim();

    return this.callGeminiAPI(prompt);
  }

  static async generateInsights(submissionsData) {
    const prompt = `
You are a business intelligence analyst. Analyze the following form submissions and extract actionable insights:
1. Critical patterns and trends
2. Anomalies or concerning data points
3. Opportunities for improvement
4. Recommendations based on data

Submissions Data:
${JSON.stringify(submissionsData, null, 2)}

Provide detailed insights with specific data references.

${MARKDOWN_FORMAT_INSTRUCTION}
    `.trim();

    return this.callGeminiAPI(prompt);
  }

  static async generateOverview(submissionsData, eventDetails) {
    const prompt = `
You are an event analyst. Provide a comprehensive overview of this event's data collection:

Event Details:
${JSON.stringify(eventDetails, null, 2)}

Submissions Data:
${JSON.stringify(submissionsData, null, 2)}

Include:
1. Event success metrics
2. Data collection completeness
3. Geographic and demographic coverage
4. Timeline and activity analysis
5. Overall assessment and score

Format as a professional executive overview.

${MARKDOWN_FORMAT_INSTRUCTION}
    `.trim();

    return this.callGeminiAPI(prompt);
  }

  static async generateAttendeesList(submissionsData) {
    const prompt = `
You are a data analyst. Analyze the worker attendee data from these form submissions and create a structured attendee report:

Submissions Data:
${JSON.stringify(submissionsData, null, 2)}

Generate a detailed report including:
1. Worker names and IDs
2. Number of submissions per worker
3. Data quality for each worker
4. Geographic areas covered by each worker
5. Activity types per worker
6. Any notable performers or concerns

Format as a structured analysis suitable for management review.

${MARKDOWN_FORMAT_INSTRUCTION}
    `.trim();

    return this.callGeminiAPI(prompt);
  }

  static async answerCustomQuestion(question, submissionsData, eventDetails) {
    const prompt = `
You are a data analysis expert. Answer the following question based on the provided data:

Question: ${question}

Event Details:
${JSON.stringify(eventDetails, null, 2)}

Submissions Data:
${JSON.stringify(submissionsData, null, 2)}

Provide a comprehensive, data-backed answer with specific references to the data.

${MARKDOWN_FORMAT_INSTRUCTION}
    `.trim();

    return this.callGeminiAPI(prompt);
  }
}

export default GeminiService;
