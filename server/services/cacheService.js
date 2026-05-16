import AIAnalysis from '../models/AIAnalysis.js';
import crypto from 'crypto';

export class CacheService {
  static generateDataHash(data) {
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex');
  }

  static async getCachedAnalysis(eventId, analysisType, dataHash) {
    try {
      const cachedAnalysis = await AIAnalysis.findOne({
        eventId,
        analysisType,
        dataHash,
        expiresAt: { $gt: new Date() }
      });

      if (cachedAnalysis) {
        // Update usage count
        cachedAnalysis.usageCount += 1;
        await cachedAnalysis.save();
        
        console.log(`[Cache] Cache hit for ${analysisType} on event ${eventId}`);
        return cachedAnalysis;
      }

      console.log(`[Cache] Cache miss for ${analysisType} on event ${eventId}`);
      return null;
    } catch (error) {
      console.error('[Cache Service Error]', error.message);
      return null; // Fail gracefully, proceed with fresh analysis
    }
  }

  static async cacheAnalysis(
    eventId,
    analysisType,
    customPrompt,
    query,
    response,
    submissionCount,
    createdBy,
    metadata,
    dataHash
  ) {
    try {
      const analysis = new AIAnalysis({
        eventId,
        analysisType,
        customPrompt,
        query,
        response,
        submissionCount,
        createdBy,
        metadata,
        dataHash,
        expiresAt: new Date(+new Date() + 24 * 60 * 60 * 1000) // 24 hours
      });

      const savedAnalysis = await analysis.save();
      console.log(`[Cache] Analysis cached for ${analysisType} on event ${eventId}`);
      return savedAnalysis;
    } catch (error) {
      console.error('[Cache Service Error]', error.message);
      throw error;
    }
  }

  static async clearEventCache(eventId) {
    try {
      const result = await AIAnalysis.deleteMany({ eventId });
      console.log(`[Cache] Cleared ${result.deletedCount} cached analyses for event ${eventId}`);
      return result;
    } catch (error) {
      console.error('[Cache Service Error]', error.message);
      throw error;
    }
  }

  static async getAnalysisHistory(eventId, limit = 10) {
    try {
      const history = await AIAnalysis.find({ eventId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('analysisType response createdAt createdBy usageCount');

      return history;
    } catch (error) {
      console.error('[Cache Service Error]', error.message);
      return [];
    }
  }
}

export default CacheService;
