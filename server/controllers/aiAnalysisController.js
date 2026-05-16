import fs from 'fs';
import Submission from '../models/Submission.js';
import DynamicSubmission from '../models/DynamicSubmission.js';
import Event from '../models/Event.js';
import AIAnalysis from '../models/AIAnalysis.js';
import GeminiService from '../services/geminiService.js';
import CacheService from '../services/cacheService.js';
import ExportService from '../services/exportService.js';

export const analyzeEvent = async (req, res) => {
  try {
    const { eventId, analysisType, customPrompt } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!eventId || !analysisType) {
      return res.status(400).json({
        success: false,
        message: 'eventId and analysisType are required'
      });
    }

    const validTypes = ['summary', 'insights', 'overview', 'attendees', 'custom'];
    if (!validTypes.includes(analysisType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid analysisType'
      });
    }

    if (analysisType === 'custom' && !customPrompt) {
      return res.status(400).json({
        success: false,
        message: 'customPrompt is required for custom analysis'
      });
    }

    // Fetch event details
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Fetch all submissions for the event
    const submissions = await Submission.find({ eventId })
      .select('worker_id worker_name activityType region issues participation notes attachments submission_timestamp')
      .populate('worker_id', 'name email phone');

    const dynamicSubmissions = await DynamicSubmission.find({ eventId })
      .select('workerId formId submissionData submittedAt')
      .populate('workerId', 'name email phone');

    if (submissions.length === 0 && dynamicSubmissions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No submissions found for this event'
      });
    }

    // Prepare submissions data for analysis
    const submissionsData = [
      ...submissions.map(s => ({
        type: 'standard',
        workerId: s.worker_id?._id,
        workerName: s.worker_name || s.worker_id?.name,
        activityType: s.activityType,
        region: s.region,
        issues: s.issues,
        participation: s.participation,
        submittedAt: s.submission_timestamp
      })),
      ...dynamicSubmissions.map(s => ({
        type: 'dynamic',
        workerId: s.workerId?._id,
        workerName: s.workerId?.name || s.workerName,
        formId: s.formId,
        data: s.responses || s.submissionData,
        submittedAt: s.submittedAt
      }))
    ];

    // Generate data hash for caching
    const combinedData = {
      eventId,
      analysisType,
      customPrompt,
      submissionIds: [...submissions.map(s => s._id), ...dynamicSubmissions.map(s => s._id)]
    };
    const dataHash = CacheService.generateDataHash(combinedData);

    // Check cache
    let cachedResult = await CacheService.getCachedAnalysis(eventId, analysisType, dataHash);
    if (cachedResult) {
      return res.json({
        success: true,
        isCached: true,
        analysisId: cachedResult._id,
        response: cachedResult.response,
        submissionCount: cachedResult.submissionCount,
        createdAt: cachedResult.createdAt
      });
    }

    // Call Gemini API based on analysis type
    let response, query;

    switch (analysisType) {
      case 'summary':
        query = 'Generate a summary of submissions';
        response = await GeminiService.generateSummary(submissionsData);
        break;
      case 'insights':
        query = 'Extract insights from submissions';
        response = await GeminiService.generateInsights(submissionsData);
        break;
      case 'overview':
        query = 'Generate event overview';
        response = await GeminiService.generateOverview(submissionsData, {
          eventName: event.name,
          eventDate: event.date,
          location: event.location,
          description: event.description
        });
        break;
      case 'attendees':
        query = 'Analyze worker attendees';
        response = await GeminiService.generateAttendeesList(submissionsData);
        break;
      case 'custom':
        query = customPrompt;
        response = await GeminiService.answerCustomQuestion(customPrompt, submissionsData, {
          eventName: event.name,
          eventDate: event.date,
          location: event.location
        });
        break;
    }

    // Cache the analysis
    const metadata = {
      dateRange: {
        startDate: event.date,
        endDate: new Date()
      },
      submissionIds: [...submissions.map(s => s._id), ...dynamicSubmissions.map(s => s._id)]
    };

    const cachedAnalysis = await CacheService.cacheAnalysis(
      eventId,
      analysisType,
      customPrompt || null,
      query,
      response,
      submissionsData.length,
      userId,
      metadata,
      dataHash
    );

    res.json({
      success: true,
      isCached: false,
      analysisId: cachedAnalysis._id,
      response,
      submissionCount: submissionsData.length,
      createdAt: cachedAnalysis.createdAt
    });
  } catch (error) {
    console.error('[AI Analysis Error]', error);
    res.status(500).json({
      success: false,
      message: 'AI analysis failed',
      error: error.message
    });
  }
};

export const exportAnalysis = async (req, res) => {
  try {
    const { analysisId, exportFormat } = req.body;

    if (!analysisId || !exportFormat) {
      return res.status(400).json({
        success: false,
        message: 'analysisId and exportFormat are required'
      });
    }

    if (!['pdf', 'csv', 'json', 'md'].includes(exportFormat)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid exportFormat. Allowed: pdf, csv, json, md'
      });
    }

    // Fetch analysis record
    const analysis = await AIAnalysis.findById(analysisId).populate('eventId');
    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analysis not found'
      });
    }

    const eventName = analysis.eventId?.name || 'Event';
    const analysisData = {
      response: analysis.response,
      submissionCount: analysis.submissionCount,
      customPrompt: analysis.customPrompt,
      isCached: true
    };

    // Fetch submissions for CSV export
    let submissions = [];
    if (exportFormat === 'csv') {
      const submissionIds = analysis.metadata?.submissionIds || [];
      if (submissionIds.length > 0) {
        submissions = await Submission.find({ _id: { $in: submissionIds } })
          .select('worker_id activityType region issuesTags additionalNotes submission_timestamp');
      }
    }

    // Generate export
    let exportResult;
    switch (exportFormat) {
      case 'pdf':
        exportResult = await ExportService.exportToPDF(
          analysisData,
          eventName,
          analysis.analysisType
        );
        break;
      case 'csv':
        exportResult = await ExportService.exportToCSV(
          analysisData,
          submissions,
          eventName,
          analysis.analysisType
        );
        break;
      case 'json':
        exportResult = await ExportService.exportToJSON(
          analysisData,
          submissions,
          eventName,
          analysis.analysisType
        );
        break;
      case 'md':
        exportResult = await ExportService.exportToMarkdown(
          analysisData,
          eventName,
          analysis.analysisType
        );
        break;
    }

    if (!exportResult?.filePath || !fs.existsSync(exportResult.filePath)) {
      return res.status(500).json({
        success: false,
        message: 'Export file was not created'
      });
    }

    res.download(exportResult.filePath, exportResult.fileName, {
      headers: {
        'Content-Type': exportResult.mimeType
      }
    }, (err) => {
      if (err) {
        console.error('[Export Download Error]', err);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: 'Failed to send export file'
          });
        }
      }
    });
  } catch (error) {
    console.error('[Export Error]', error);
    res.status(500).json({
      success: false,
      message: 'Export failed',
      error: error.message
    });
  }
};

export const getAnalysisHistory = async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: 'eventId is required'
      });
    }

    const history = await CacheService.getAnalysisHistory(eventId);

    res.json({
      success: true,
      history
    });
  } catch (error) {
    console.error('[History Error]', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch history',
      error: error.message
    });
  }
};

export const clearEventCache = async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: 'eventId is required'
      });
    }

    await CacheService.clearEventCache(eventId);

    res.json({
      success: true,
      message: 'Cache cleared successfully'
    });
  } catch (error) {
    console.error('[Clear Cache Error]', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cache',
      error: error.message
    });
  }
};
