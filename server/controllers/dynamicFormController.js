import Event from '../models/Event.js';
import Form from '../models/Form.js';
import DynamicSubmission from '../models/DynamicSubmission.js';
import DynamicDraft from '../models/DynamicDraft.js';
import User from '../models/User.js';
import { sendSubmissionNotificationEmail } from '../services/mailService.js';
import { createNotification } from '../services/notificationService.js';
import { logAction } from '../services/auditService.js';

/**
 * Helper to check if a form is expired
 */
const isFormExpired = (expiryDate) => {
  if (!expiryDate) return false;
  const expiry = new Date(expiryDate);
  // Set to end of day to be generous
  expiry.setHours(23, 59, 59, 999);
  return new Date() > expiry;
};

/**
 * Get all events assigned to a worker
 */
export const getWorkerEvents = async (req, res) => {
  try {
    const workerId = req.user.id;

    const events = await Event.find({
      'assignedWorkers.workerId': workerId,
      status: 'active',
    })
      .populate('forms.formId', 'title expiryDate status')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events',
      error: error.message,
    });
  }
};

/**
 * Get form schema by ID
 */
export const getFormSchema = async (req, res) => {
  try {
    const { formId } = req.params;

    const form = await Form.findById(formId).populate('eventId', 'name description');

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found',
      });
    }

    // RBAC: Check if worker is assigned to this event (Admins bypass this)
    if (req.user.role !== 'Admin') {
      const event = await Event.findById(form.eventId);
      const isAssigned = event?.assignedWorkers.some(
        (w) => w.workerId.toString() === req.user.id
      );

      if (!isAssigned) {
        return res.status(403).json({
          success: false,
          message: 'You are not assigned to the event associated with this form',
        });
      }
    }

    // Check if form is expired
    const isExpired = isFormExpired(form.expiryDate);

    res.json({
      success: true,
      data: {
        ...form.toObject(),
        isExpired,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch form',
      error: error.message,
    });
  }
};

/**
 * Get draft for a specific form
 */
export const getDraftForForm = async (req, res) => {
  try {
    const workerId = req.user.id;
    const { formId } = req.params;

    const draft = await DynamicDraft.findOne({
      workerId,
      formId,
    });

    // Return 200 with empty data if no draft exists (not an error state)
    res.json({
      success: true,
      data: draft || {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch draft',
      error: error.message,
    });
  }
};

/**
 * Get all drafts for the current worker
 */
export const getWorkerDrafts = async (req, res) => {
  try {
    const workerId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const drafts = await DynamicDraft.find({ workerId })
      .populate('formId', 'title expiryDate')
      .populate('eventId', 'name')
      .sort({ updatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await DynamicDraft.countDocuments({ workerId });

    res.json({
      success: true,
      data: drafts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch drafts',
      error: error.message,
    });
  }
};

/**
 * Save or update draft
 */
export const saveDraftForForm = async (req, res) => {
  try {
    const workerId = req.user.id;
    const { formId, eventId, responses } = req.body;

    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ success: false, message: 'Form not found' });
    }

    // RBAC: Check if worker is assigned to this event (Admins bypass)
    if (req.user.role !== 'Admin') {
      const event = await Event.findById(eventId);
      const isAssigned = event?.assignedWorkers.some(
        (w) => w.workerId.toString() === workerId
      );

      if (!isAssigned) {
        return res.status(403).json({
          success: false,
          message: 'You are not assigned to this event and cannot save drafts for it',
        });
      }
    }

    if (isFormExpired(form.expiryDate)) {
      return res.status(403).json({
        success: false,
        message: 'Form has expired and cannot be modified',
      });
    }

    // Calculate completion percentage
    const requiredFields = form.fields.filter(f => f.required);
    const filledFields = requiredFields.filter(f => responses[f.id] !== undefined && responses[f.id] !== null && responses[f.id] !== '');
    const completionPercentage = Math.round((filledFields.length / requiredFields.length) * 100);

    // Check if this is a new draft
    const existingDraft = await DynamicDraft.findOne({ workerId, formId });

    const draft = await DynamicDraft.findOneAndUpdate(
      { workerId, formId },
      {
        eventId,
        responses,
        workerName: req.user.name,
        workerRole: req.user.role,
        location: req.body.location,
        activityDate: req.body.activityDate || new Date(),
        completionPercentage,
      },
      { upsert: true, new: true }
    );

    // Create notification for first draft save
    if (!existingDraft) {
      const worker = await User.findById(workerId);
      const event = await Event.findById(eventId);

      await createNotification(
        workerId,
        'DRAFT_SAVED',
        'Draft Saved',
        `Your draft for "${form.title}" in "${event.name}" has been saved. You can resume filling it later.`,
        {
          entityType: 'Form',
          entityId: formId,
        },
        `/worker/forms/${formId}`
      );

      // Log draft creation
      await logAction(
        workerId,
        worker.name,
        'DRAFT',
        'Form',
        formId,
        form.title,
        { completionPercentage },
        req.ip,
        'success'
      );
    }

    res.json({
      success: true,
      message: 'Draft saved successfully',
      data: draft,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to save draft',
      error: error.message,
    });
  }
};

/**
 * Submit form response
 */
export const submitFormResponse = async (req, res) => {
  try {
    const workerId = req.user.id;
    const { formId, eventId, responses, location, activityDate } = req.body;

    // Validate location (Mandatory for submission)
    if (!location || !location.state || !location.city) {
      return res.status(400).json({
        success: false,
        message: 'Location (State & City) is required to submit this form',
      });
    }

    // Check if form is expired
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ success: false, message: 'Form not found' });
    }

    // RBAC: Check if worker is assigned to this event (Admins bypass)
    if (req.user.role !== 'Admin') {
      const event = await Event.findById(eventId);
      const isAssigned = event?.assignedWorkers.some(
        (w) => w.workerId.toString() === workerId
      );

      if (!isAssigned) {
        return res.status(403).json({
          success: false,
          message: 'You are not assigned to this event and cannot submit data for it',
        });
      }
    }

    if (isFormExpired(form.expiryDate)) {
      return res.status(403).json({
        success: false,
        message: 'Form has expired and cannot be submitted',
      });
    }

    // Validate required fields
    const requiredFields = form.fields.filter(f => f.required);
    const errors = {};
    for (const field of requiredFields) {
      if (!responses[field.id]) {
        errors[field.id] = `${field.label} is required`;
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    // Create submission
    const submission = new DynamicSubmission({
      formId,
      eventId,
      workerId,
      workerName: req.user.name,
      workerRole: req.user.role,
      responses,
      location,
      activityDate: activityDate || new Date(),
      status: 'submitted',
      ipAddress: req.ip,
      deviceInfo: req.headers['user-agent'],
    });

    await submission.save();

    // Delete associated draft
    await DynamicDraft.deleteOne({ workerId, formId });

    // Get populated data for notifications
    const event = await Event.findById(eventId);
    const worker = await User.findById(workerId);

    // Send email notifications to all admins
    const admins = await User.find({ role: 'Admin' });
    for (const admin of admins) {
      try {
        await sendSubmissionNotificationEmail(admin, worker, form, event);
        
        // Create in-app notification
        await createNotification(
          admin._id,
          'SUBMISSION_RECEIVED',
          `New Submission: ${form.title}`,
          `Worker ${worker.name} has submitted "${form.title}" for event "${event.name}".`,
          {
            entityType: 'Submission',
            entityId: submission._id,
          },
          `/admin/submissions/${submission._id}`
        );
      } catch (notificationError) {
        console.error('Failed to send notification to admin:', notificationError);
        // Continue with next admin if one fails
      }
    }

    // Create notification for worker
    await createNotification(
      workerId,
      'SUBMISSION_RECEIVED',
      'Form Submitted Successfully',
      `Your submission for "${form.title}" has been received.`,
      {
        entityType: 'Submission',
        entityId: submission._id,
      },
      `/worker/submissions/${submission._id}`
    );

    // Log submission action
    await logAction(
      workerId,
      req.user.name,
      'SUBMIT',
      'Submission',
      submission._id,
      form.title,
      { formId, eventId },
      req.ip,
      'success'
    );

    res.json({
      success: true,
      message: 'Form submitted successfully',
      data: submission,
    });
  } catch (error) {
    // Log failed submission action
    await logAction(
      req.user.id,
      req.user.name,
      'SUBMIT',
      'Submission',
      null,
      req.body.formId,
      null,
      req.ip,
      'failure',
      error.message
    ).catch(err => console.error('Failed to log action:', err));

    res.status(500).json({
      success: false,
      message: 'Failed to submit form',
      error: error.message,
    });
  }
};

/**
 * Get all submissions for a worker
 */
export const getWorkerSubmissions = async (req, res) => {
  try {
    const workerId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const submissions = await DynamicSubmission.find({ workerId })
      .populate('formId', 'title')
      .populate('eventId', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await DynamicSubmission.countDocuments({ workerId });

    res.json({
      success: true,
      data: submissions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submissions',
      error: error.message,
    });
  }
};

/**
 * Get submission by ID
 */
export const getSubmissionById = async (req, res) => {
  try {
    const { submissionId } = req.params;

    const submission = await DynamicSubmission.findById(submissionId)
      .populate('formId')
      .populate('eventId');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found',
      });
    }

    // RBAC: Only the submitter or an admin can view the submission details
    const isOwner = submission.workerId.toString() === req.user.id;
    const isAdmin = req.user.role === 'Admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this submission',
      });
    }

    res.json({
      success: true,
      data: submission,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submission',
      error: error.message,
    });
  }
};

/**
 * Update existing submission
 */
export const updateSubmissionResponse = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { responses, location, activityDate } = req.body;
    const workerId = req.user.id;

    const submission = await DynamicSubmission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    // RBAC: Only owner can update
    if (submission.workerId.toString() !== workerId) {
      return res.status(403).json({ success: false, message: 'You can only update your own submissions' });
    }

    const form = await Form.findById(submission.formId);
    if (isFormExpired(form.expiryDate)) {
      return res.status(403).json({ success: false, message: 'Cannot update expired submission' });
    }

    submission.responses = responses || submission.responses;
    submission.location = location || submission.location;
    submission.activityDate = activityDate || submission.activityDate;
    submission.updatedAt = new Date();

    await submission.save();

    await logAction(
      workerId,
      req.user.name,
      'UPDATE',
      'Submission',
      submissionId,
      form.title,
      {},
      req.ip,
      'success'
    );

    res.json({
      success: true,
      message: 'Submission updated successfully',
      data: submission,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update submission',
      error: error.message,
    });
  }
};

/**
 * Check submission status and editability (Activity Model)
 */
export const checkSubmissionStatus = async (req, res) => {
  try {
    const workerId = req.user.id;
    const { formId } = req.params;

    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ success: false, message: 'Form not found' });
    }

    const submissions = await DynamicSubmission.find({ workerId, formId })
      .sort({ submittedAt: -1 });
    
    const draft = await DynamicDraft.findOne({ workerId, formId });

    const isExpired = isFormExpired(form.expiryDate);
    
    // In activity model, you can always create a new submission if not expired
    const canCreateNew = !isExpired;
    
    // You can edit the latest submission if it's recent (optional limit) or simply if not expired
    const latestSubmission = submissions.length > 0 ? submissions[0] : null;
    const canEditLatest = !isExpired && latestSubmission;

    res.json({
      success: true,
      data: {
        hasSubmission: submissions.length > 0,
        submissionCount: submissions.length,
        hasDraft: !!draft,
        isExpired,
        canCreateNew,
        canEditLatest,
        latestSubmission,
        submissions: submissions, // Return history
        draft: draft || null,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to check status',
      error: error.message,
    });
  }
};
