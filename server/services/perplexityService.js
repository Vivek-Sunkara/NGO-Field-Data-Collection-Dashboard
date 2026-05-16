import axios from 'axios';

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

export class PerplexityService {
  static async callPerplexityAPI(prompt) {
    try {
      if (!PERPLEXITY_API_KEY) {
        throw new Error('Perplexity API key not configured');
      }

      const response = await axios.post(
        PERPLEXITY_API_URL,
        {
          model: 'sonar-pro',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          top_p: 0.9,
          return_citations: false,
          search_recency_filter: 'month',
          stream: false
        },
        {
          headers: {
            'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('[Perplexity API Error]', error.message);
      if (error.response?.data) {
        console.error('[Perplexity API Response]', error.response.data);
      }
      throw new Error(`Perplexity API call failed: ${error.message}`);
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
    `.trim();

    return this.callPerplexityAPI(prompt);
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

Provide detailed insights in a structured format with specific data references.
    `.trim();

    return this.callPerplexityAPI(prompt);
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
    `.trim();

    return this.callPerplexityAPI(prompt);
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
    `.trim();

    return this.callPerplexityAPI(prompt);
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
    `.trim();

    return this.callPerplexityAPI(prompt);
  }
}

export default PerplexityService;
