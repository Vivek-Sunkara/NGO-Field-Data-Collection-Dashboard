import Submission from '../models/Submission.js';
import Draft from '../models/Draft.js';
import { validateSubmission, validateDraft, calculateDraftCompletion } from '../utils/validation.js';
import { saveUploadedFile, deleteUploadedFile } from '../utils/fileUpload.js';
import { normalizeLegacySubmission } from '../utils/normalizeSubmissionLanguage.js';

/**
 * CREATE SUBMISSION
 * POST /api/submissions
 */
export const createSubmission = async (req, res) => {
  try {
    const { workerId, workerName, userRole, workerRegion, sourceLanguage, ...rest } = req.body;
    const submissionData = await normalizeLegacySubmission({ ...rest, sourceLanguage });

    // Validate submission data
    const validation = validateSubmission(submissionData);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors,
      });
    }

    // Handle file uploads if present
    let evidenceImages = [];
    if (req.files && req.files.length > 0) {
      try {
        for (const file of req.files) {
          const uploadedFile = saveUploadedFile(file, workerId);
          evidenceImages.push(uploadedFile);
        }
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'File upload failed',
          error: error.message,
        });
      }
    }

    // Create submission with metadata
    const submission = new Submission({
      worker_id: workerId,
      worker_name: workerName,
      user_role: userRole || 'field_worker',
      worker_region: workerRegion,
      submission_timestamp: new Date(),
      ...submissionData,
      evidenceImages,
      status: 'submitted',
      ipAddress: req.ip,
    });

    await submission.save();

    // Delete draft if submission was from draft
    if (req.body.draftId) {
      await Draft.findByIdAndDelete(req.body.draftId);
    }

    res.status(201).json({
      success: true,
      message: 'Submission created successfully',
      data: submission,
    });
  } catch (error) {
    console.error('Error creating submission:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/**
 * SAVE AS DRAFT
 * POST /api/submissions/draft
 */
export const saveDraft = async (req, res) => {
  try {
    const { workerId, workerName, draftId, sourceLanguage, ...rest } = req.body;
    const draftData = await normalizeLegacySubmission({ ...rest, sourceLanguage });

    // Validate partial data
    const validation = validateDraft(draftData);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors,
      });
    }

    let draft;

    if (draftId) {
      // Update existing draft
      draft = await Draft.findByIdAndUpdate(
        draftId,
        {
          ...draftData,
          lastSavedAt: new Date(),
          completionPercentage: calculateDraftCompletion({ ...draftData }),
        },
        { new: true, runValidators: false }
      );
    } else {
      // Create new draft
      draft = new Draft({
        worker_id: workerId,
        worker_name: workerName,
        ...draftData,
        lastSavedAt: new Date(),
        completionPercentage: calculateDraftCompletion(draftData),
      });
      await draft.save();
    }

    res.status(201).json({
      success: true,
      message: 'Draft saved successfully',
      data: draft,
    });
  } catch (error) {
    console.error('Error saving draft:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/**
 * GET ALL DRAFTS FOR WORKER
 * GET /api/submissions/drafts/:workerId
 */
export const getDraftsForWorker = async (req, res) => {
  try {
    const { workerId } = req.params;
    const { limit = 10, page = 1 } = req.query;

    const drafts = await Draft.find({ worker_id: workerId })
      .sort({ lastSavedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Draft.countDocuments({ worker_id: workerId });

    res.status(200).json({
      success: true,
      data: drafts,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error('Error fetching drafts:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/**
 * GET DRAFT BY ID
 * GET /api/submissions/draft/:draftId
 */
export const getDraftById = async (req, res) => {
  try {
    const { draftId } = req.params;
    const draft = await Draft.findById(draftId);

    if (!draft) {
      return res.status(404).json({
        success: false,
        message: 'Draft not found',
      });
    }

    res.status(200).json({
      success: true,
      data: draft,
    });
  } catch (error) {
    console.error('Error fetching draft:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/**
 * DELETE DRAFT
 * DELETE /api/submissions/draft/:draftId
 */
export const deleteDraft = async (req, res) => {
  try {
    const { draftId } = req.params;

    const draft = await Draft.findByIdAndDelete(draftId);

    if (!draft) {
      return res.status(404).json({
        success: false,
        message: 'Draft not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Draft deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting draft:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/**
 * GET ALL SUBMISSIONS (ADMIN)
 * GET /api/submissions
 */
export const getAllSubmissions = async (req, res) => {
  try {
    const { limit = 20, page = 1, region, activityType, startDate, endDate, workerId, issueType } = req.query;

    let filter = { status: 'submitted' };

    if (region) filter.region = region;
    if (activityType) filter.activityType = activityType;
    if (workerId) filter.worker_id = workerId;
    if (issueType) filter.issuesTags = issueType;

    if (startDate || endDate) {
      filter.activityDate = {};
      if (startDate) filter.activityDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.activityDate.$lte = end;
      }
    }

    const submissions = await Submission.find(filter)
      .sort({ submission_timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('worker_id', 'name email');

    const total = await Submission.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: submissions,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/**
 * GET SUBMISSION BY ID
 * GET /api/submissions/:submissionId
 */
export const getSubmissionById = async (req, res) => {
  try {
    const { submissionId } = req.params;

    const submission = await Submission.findById(submissionId).populate('worker_id', 'name email');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found',
      });
    }

    res.status(200).json({
      success: true,
      data: submission,
    });
  } catch (error) {
    console.error('Error fetching submission:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/**
 * GET SUBMISSIONS BY WORKER
 * GET /api/submissions/worker/:workerId
 */
export const getSubmissionsByWorker = async (req, res) => {
  try {
    const { workerId } = req.params;
    const { limit = 20, page = 1 } = req.query;

    const submissions = await Submission.find({ worker_id: workerId, status: 'submitted' })
      .sort({ submission_timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Submission.countDocuments({ worker_id: workerId, status: 'submitted' });

    res.status(200).json({
      success: true,
      data: submissions,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error('Error fetching worker submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/**
 * GET DASHBOARD STATISTICS (ADMIN)
 * GET /api/submissions/stats
 */
export const getSubmissionStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.submission_timestamp = {};
      if (startDate) dateFilter.submission_timestamp.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateFilter.submission_timestamp.$lte = end;
      }
    }

    const totalSubmissions = await Submission.countDocuments({
      status: 'submitted',
      ...dateFilter,
    });

    const submissionsByActivity = await Submission.aggregate([
      { $match: { status: 'submitted', ...dateFilter } },
      {
        $group: {
          _id: '$activityType',
          count: { $sum: 1 },
          totalParticipants: { $sum: '$totalParticipants' },
        },
      },
    ]);

    const submissionsByRegion = await Submission.aggregate([
      { $match: { status: 'submitted', ...dateFilter } },
      {
        $group: {
          _id: '$region',
          count: { $sum: 1 },
        },
      },
    ]);

    const topIssues = await Submission.aggregate([
      { $match: { status: 'submitted', ...dateFilter } },
      { $unwind: '$issuesTags' },
      {
        $group: {
          _id: '$issuesTags',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalSubmissions,
        submissionsByActivity,
        submissionsByRegion,
        topIssues,
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};
