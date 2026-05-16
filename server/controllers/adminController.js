import Event from '../models/Event.js';
import Form from '../models/Form.js';
import DynamicSubmission from '../models/DynamicSubmission.js';
import DynamicDraft from '../models/DynamicDraft.js';
import Submission from '../models/Submission.js';
import Draft from '../models/Draft.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import AuditLog from '../models/AuditLog.js';
import { createNotification, bulkNotify } from '../services/notificationService.js';
import { logAction } from '../services/auditService.js';
import { sendFormAssignmentEmail, sendEventAssignmentEmail } from '../services/mailService.js';

const computeFormStatus = (form) => {
  if (!form) return 'Unknown';
  const isExpired = form.expiryDate && new Date() > new Date(form.expiryDate);
  if (isExpired) return 'Expired';
  if (form.status) {
    return form.status.charAt(0).toUpperCase() + form.status.slice(1);
  }
  return 'Active';
};

/**
 * Get all events with submission stats
 */
export const getAllEvents = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;

    const isInactiveFilter = status === 'inactive';
    const query = {};
    if (status && !isInactiveFilter) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const events = await Event.find(query)
      .populate('assignedWorkers.workerId', 'name email')
      .populate('forms.formId', 'title expiryDate status')
      .sort({ createdAt: -1 });

    // Add submission stats for each event
    const eventsWithStats = await Promise.all(
      events.map(async (event) => {
        const eventData = event.toObject();

        // Get stats for each form
        const formsStats = await Promise.all(
          event.forms.map(async (formItem) => {
            // Check if formId exists and is populated
            if (!formItem.formId) {
              return {
                formId: null,
                title: 'Unknown Form',
                submissions: 0,
                drafts: 0,
                expiryDate: null,
                status: 'Unknown',
              };
            }

            const submissions = await DynamicSubmission.countDocuments({
              formId: formItem.formId._id || formItem.formId,
              eventId: event._id,
              status: 'submitted',
            });

            const drafts = await DynamicDraft.countDocuments({
              formId: formItem.formId._id || formItem.formId,
              eventId: event._id,
            });

            const formStatus = computeFormStatus(formItem.formId);
            const formIsExpired = formStatus === 'Expired';

            return {
              formId: formItem.formId._id,
              title: formItem.formId.title || 'Untitled Form',
              submissions,
              drafts,
              expiryDate: formItem.formId.expiryDate,
              status: formStatus,
              isExpired: formIsExpired,
            };
          })
        );

        const totalSubmissions = formsStats.reduce((sum, f) => sum + f.submissions, 0);
        const totalWorkers = event.assignedWorkers ? event.assignedWorkers.length : 0;
        const totalForms = event.forms ? event.forms.length : 0;
        
        // Total expected submissions = number of workers * number of forms
        const totalExpected = totalWorkers * totalForms;
        const completionPercentage = totalExpected > 0 ? Math.round((totalSubmissions / totalExpected) * 100) : 0;

        let computedStatus = event.status;
        if (
          computedStatus === 'active' &&
          formsStats.length > 0 &&
          formsStats.every((f) => f.status === 'Expired')
        ) {
          computedStatus = 'inactive';
        }

        const expiredFormsCount = formsStats.filter((f) => f.isExpired).length;

        return {
          ...eventData,
          status: computedStatus,
          formsStats,
          expiredFormsCount,
          totalWorkers,
          totalSubmissions,
          totalExpected,
          completionPercentage,
        };
      })
    );

    const filteredEvents = isInactiveFilter
      ? eventsWithStats.filter((ev) => ev.status === 'inactive')
      : eventsWithStats;

    const total = filteredEvents.length;
    const pagedEvents = filteredEvents.slice(skip, skip + parseInt(limit, 10));

    res.json({
      success: true,
      data: pagedEvents,
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
      message: 'Failed to fetch events',
      error: error.message,
    });
  }
};

/**
 * Get event details with submission tracking
 */
export const getEventDetail = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId)
      .populate('assignedWorkers.workerId', 'name email region')
      .populate('forms.formId');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Get detailed submission status for each form
    const formsDetail = await Promise.all(
      event.forms.map(async (formItem) => {
        const form = formItem.formId;

        // Get submission status for each worker
        const workerStatus = await Promise.all(
          event.assignedWorkers.map(async (workerItem) => {
            const submission = await DynamicSubmission.findOne({
              formId: form._id,
              workerId: workerItem.workerId._id,
            });

            const draft = await DynamicDraft.findOne({
              formId: form._id,
              workerId: workerItem.workerId._id,
            });

            let status = 'Pending';
            if (submission) status = 'Submitted';
            else if (draft) status = 'Draft Saved';
            else if (new Date() > new Date(form.expiryDate)) status = 'Expired';

            return {
              workerId: workerItem.workerId._id,
              workerName: workerItem.workerId.name,
              workerEmail: workerItem.workerId.email,
              status,
              submittedAt: submission?.submittedAt,
              draftUpdatedAt: draft?.updatedAt,
            };
          })
        );

        const submissions = workerStatus.filter(w => w.status === 'Submitted').length;
        const drafts = workerStatus.filter(w => w.status === 'Draft Saved').length;

        return {
          formId: form._id,
          title: form.title,
          expiryDate: form.expiryDate,
          fieldCount: form.fields?.length || 0,
          totalWorkers: event.assignedWorkers.length,
          submissions,
          drafts,
          workerStatus,
        };
      })
    );

    const eventStatus =
      event.status === 'active' &&
      event.forms.length > 0 &&
      event.forms.every((formItem) => {
        const form = formItem.formId;
        return form?.expiryDate && new Date() > new Date(form.expiryDate);
      })
        ? 'inactive'
        : event.status;

    res.json({
      success: true,
      data: {
        ...event.toObject(),
        status: eventStatus,
        formsDetail,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event details',
      error: error.message,
    });
  }
};

/**
 * Get all submissions with filtering
 */
export const getAllSubmissions = async (req, res) => {
  try {
    const { eventId, formId, workerId, status, startDate, endDate, page = 1, limit = 20 } = req.query;

    const query = {};
    if (eventId) query.eventId = eventId;
    if (formId) query.formId = formId;
    if (workerId) query.workerId = workerId;
    if (status) query.status = status;

    if (startDate || endDate) {
      query.submittedAt = {};
      if (startDate) query.submittedAt.$gte = new Date(startDate);
      if (endDate) query.submittedAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const submissions = await DynamicSubmission.find(query)
      .populate('formId', 'title fields')
      .populate('eventId', 'name')
      .populate('workerId', 'name email region')
      .skip(skip)
      .limit(limit)
      .sort({ submittedAt: -1 });

    const total = await DynamicSubmission.countDocuments(query);

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
 * Get submission details
 */
export const getSubmissionDetail = async (req, res) => {
  try {
    const { submissionId } = req.params;

    const submission = await DynamicSubmission.findById(submissionId)
      .populate('formId')
      .populate('eventId')
      .populate('workerId', 'name email region');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found',
      });
    }

    // Log audit trail
    logAction(
      req.user?.id,
      req.user?.name,
      'VIEW',
      'Submission',
      submissionId,
      submission.formId?.title,
      null,
      req.ip
    );

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
 * Get dashboard statistics
 */
export const getDashboardStats = async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    const activeEvents = await Event.countDocuments({ status: 'active' });
    const totalForms = await Form.countDocuments();
    const totalSubmissions = await DynamicSubmission.countDocuments({ status: 'submitted' });
    const totalWorkers = await User.countDocuments({ role: 'Field Worker' });

    const totalDrafts = await DynamicDraft.countDocuments();

    const submittedFormWorkers = await DynamicSubmission.aggregate([
      { $group: { _id: { formId: '$formId', workerId: '$workerId' } } },
    ]);
    const submittedPairs = new Set(
      submittedFormWorkers.map(item => `${item._id.formId}:${item._id.workerId}`)
    );

    const draftDocs = await DynamicDraft.find();
    const draftPairs = new Set(
      draftDocs.map(item => `${item.formId}:${item.workerId}`)
    );

    const allAssignments = await Event.aggregate([
      {
        $lookup: {
          from: 'forms',
          localField: 'forms.formId',
          foreignField: '_id',
          as: 'formList',
        },
      },
      { $unwind: '$formList' },
      { $unwind: '$assignedWorkers' },
      {
        $lookup: {
          from: 'users',
          localField: 'assignedWorkers.workerId',
          foreignField: '_id',
          as: 'worker',
        },
      },
      { $unwind: '$worker' },
      {
        $project: {
          formId: '$formList._id',
          workerId: '$worker._id',
        },
      },
    ]);

    const pendingAssignments = allAssignments.filter(assignment => {
      const pair = `${assignment.formId}:${assignment.workerId}`;
      return !submittedPairs.has(pair) && !draftPairs.has(pair);
    });

    const totalPendingSubmissions = pendingAssignments.length;

    // Get recent submissions
    const recentSubmissions = await DynamicSubmission.find()
      .populate('formId', 'title')
      .populate('eventId', 'name')
      .populate('workerId', 'name')
      .sort({ submittedAt: -1 })
      .limit(5);

    // Get submission by status pie chart data
    const submissionsByStatus = await DynamicSubmission.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Get submissions by event
    const submissionsByEvent = await DynamicSubmission.aggregate([
      {
        $group: {
          _id: '$eventId',
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'events',
          localField: '_id',
          foreignField: '_id',
          as: 'event',
        },
      },
      {
        $unwind: '$event',
      },
      {
        $project: {
          _id: 0,
          eventId: '$_id',
          eventName: '$event.name',
          count: 1,
        },
      },
      {
        $limit: 5,
      },
    ]);

    res.json({
      success: true,
      data: {
        totalEvents,
        activeEvents,
        totalForms,
        totalSubmissions,
        totalPendingSubmissions,
        totalWorkers,
        recentSubmissions,
        submissionsByStatus,
        submissionsByEvent,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats',
      error: error.message,
    });
  }
};

/**
 * Get pending submissions for reminders
 */
export const getPendingSubmissions = async (req, res) => {
  try {
    // Get all drafts
    const drafts = await DynamicDraft.find()
      .populate('formId', 'title expiryDate')
      .populate('eventId', 'name')
      .populate('workerId', 'name email');

    // Get pending (no submission or draft)
    const submittedFormWorkers = await DynamicSubmission.aggregate([
      { $group: { _id: { formId: '$formId', workerId: '$workerId' } } },
    ]);

    const submittedPairs = new Set(
      submittedFormWorkers.map(item => `${item._id.formId}:${item._id.workerId}`)
    );

    const draftPairs = new Set(
      drafts.map(item => `${item.formId}:${item.workerId}`)
    );

    const allAssignments = await Event.aggregate([
      {
        $lookup: {
          from: 'forms',
          localField: 'forms.formId',
          foreignField: '_id',
          as: 'formList',
        },
      },
      { $unwind: '$formList' },
      { $unwind: '$assignedWorkers' },
      {
        $lookup: {
          from: 'users',
          localField: 'assignedWorkers.workerId',
          foreignField: '_id',
          as: 'worker',
        },
      },
      { $unwind: '$worker' },
      {
        $project: {
          formId: '$formList._id',
          formTitle: '$formList.title',
          expiryDate: '$formList.expiryDate',
          workerId: '$worker._id',
          workerName: '$worker.name',
          workerEmail: '$worker.email',
          eventId: '$_id',
          eventName: '$name',
        },
      },
    ]);

    const pending = allAssignments.filter(assignment => {
      const pair = `${assignment.formId}:${assignment.workerId}`;
      return !submittedPairs.has(pair) && !draftPairs.has(pair);
    });

    res.json({
      success: true,
      data: {
        drafts,
        pending,
        total:pending.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending submissions',
      error: error.message,
    });
  }
};

/**
 * Get audit logs with filtering
 */
export const getAuditLogs = async (req, res) => {
  try {
    const { action, entityType, search, startDate, endDate, page = 1, limit = 15 } = req.query;

    const query = {};

    if (action) query.action = action;
    if (entityType) query.entityType = entityType;

    if (search) {
      query.$or = [
        { entityName: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } },
      ];
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const endDateObj = new Date(endDate);
        endDateObj.setHours(23, 59, 59, 999);
        query.createdAt.$lte = endDateObj;
      }
    }

    const skip = (page - 1) * limit;

    const logs = await AuditLog.find(query)
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await AuditLog.countDocuments(query);

    res.json({
      success: true,
      data: logs,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit logs',
      error: error.message,
    });
  }
};

/**
 * Get list of all workers for assignment
 */
export const getWorkers = async (req, res) => {
  try {
    const workers = await User.find({ role: 'Field Worker' })
      .select('_id name email')
      .sort({ name: 1 });

    res.json({
      success: true,
      data: workers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch workers',
      error: error.message,
    });
  }
};

/**
 * Create a new event
 */
export const createEvent = async (req, res) => {
  try {
    const { name, description, workerIds } = req.body;
    const adminId = req.user.id;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Event name is required',
      });
    }

    // Create event with assigned workers
    const event = new Event({
      name,
      description: description || '',
      assignedWorkers: (workerIds || []).map(workerId => ({
        workerId,
        assignedAt: new Date(),
      })),
      createdBy: adminId,
      status: 'active',
    });

    await event.save();

    // Notify assigned workers
    const assignedWorkers = await User.find({ _id: { $in: workerIds || [] } });
    for (const worker of assignedWorkers) {
      await createNotification(
        worker._id,
        'FORM_CREATED',
        `New Event: ${name}`,
        `You have been assigned to the event "${name}". ${description ? 'Description: ' + description : ''}`,
        {
          entityType: 'Event',
          entityId: event._id,
        },
        `/worker/events`
      );

      // Send email notification
      await sendEventAssignmentEmail(worker, event);
    }

    // Log action
    await logAction(
      adminId,
      req.user.name,
      'CREATE',
      'Event',
      event._id,
      name,
      { workerCount: workerIds?.length || 0 },
      req.ip,
      'success'
    );

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create event',
      error: error.message,
    });
  }
};

/**
 * Create a new form for an event
 */
export const createForm = async (req, res) => {
  try {
    const { title, eventId, fields, expiryDate } = req.body;
    const adminId = req.user.id;

    // Validate required fields
    if (!title || !eventId || !expiryDate || !fields || fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Title, event ID, expiry date, and at least one field are required',
      });
    }

    // Validate expiry date is in future
    if (new Date(expiryDate) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Expiry date must be in the future',
      });
    }

    // Create form
    // Validate expiry date is in the future
    const expiry = new Date(expiryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (expiry < today) {
      return res.status(400).json({
        success: false,
        message: 'Expiry date cannot be in the past',
      });
    }

    const form = new Form({
      title,
      eventId,
      fields,
      expiryDate,
      status: 'active',
      createdBy: adminId,
    });

    await form.save();

    // Add form to event
    const event = await Event.findById(eventId);
    if (event) {
      event.forms.push({
        formId: form._id,
        assignedAt: new Date(),
      });
      await event.save();

      // Notify all assigned workers in event
      const workerIds = event.assignedWorkers.map(w => w.workerId);
      const workers = await User.find({ _id: { $in: workerIds } });

      for (const worker of workers) {
        await createNotification(
          worker._id,
          'FORM_CREATED',
          `New Form: ${title}`,
          `A new form "${title}" has been added to event "${event.name}". Expiry: ${new Date(expiryDate).toLocaleDateString()}`,
          {
            entityType: 'Form',
            entityId: form._id,
          },
          `/worker/forms/${form._id}`
        );
        
        // Send email notification
        await sendFormAssignmentEmail(worker, form, event);
      }
    }

    // Log action
    await logAction(
      adminId,
      req.user.name,
      'CREATE',
      'Form',
      form._id,
      title,
      { eventId, fieldCount: fields.length, expiryDate },
      req.ip,
      'success'
    );

    res.status(201).json({
      success: true,
      message: 'Form created successfully',
      data: form,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create form',
      error: error.message,
    });
  }
};

/**
 * Update an existing event
 */
export const updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { name, description, workerIds, status } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    if (name) event.name = name;
    if (description !== undefined) event.description = description;
    if (status) event.status = status;

    if (workerIds) {
      // Replace assigned workers
      event.assignedWorkers = workerIds.map(workerId => ({
        workerId,
        assignedAt: new Date(),
      }));
    }

    const isNewAssignment = !!workerIds;
    await event.save();

    if (isNewAssignment) {
      // Notify assigned workers about existing forms in this event
      const workers = await User.find({ _id: { $in: workerIds } });
      const forms = await Form.find({ _id: { $in: event.forms.map(f => f.formId) } });

      for (const worker of workers) {
        for (const form of forms) {
          await sendFormAssignmentEmail(worker, form, event);
        }
      }
    }

    // Log action
    await logAction(
      req.user.id,
      req.user.name,
      'UPDATE',
      'Event',
      event._id,
      event.name,
      { status: event.status, workerCount: event.assignedWorkers.length },
      req.ip,
      'success'
    );

    res.json({
      success: true,
      message: 'Event updated successfully',
      data: event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update event',
      error: error.message,
    });
  }
};

/**
 * Delete an event and its associated forms
 */
export const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Check for existing submissions
    const submissionCount = await DynamicSubmission.countDocuments({ eventId });
    if (submissionCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete event with existing submissions. Archive it by changing status instead.',
      });
    }

    const eventName = event.name;
    await Event.findByIdAndDelete(eventId);
    
    // Delete associated forms that have no submissions
    await Form.deleteMany({ eventId });

    // Log action
    await logAction(
      req.user.id,
      req.user.name,
      'DELETE',
      'Event',
      eventId,
      eventName,
      null,
      req.ip,
      'success'
    );

    res.json({
      success: true,
      message: 'Event and associated forms deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete event',
      error: error.message,
    });
  }
};

/**
 * Update an existing form
 */
export const updateForm = async (req, res) => {
  try {
    const { formId } = req.params;
    const { title, fields, expiryDate, status } = req.body;

    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found',
      });
    }

    if (title) form.title = title;
    if (fields) form.fields = fields;
    if (expiryDate) form.expiryDate = expiryDate;
    if (status) form.status = status;

    await form.save();

    // Log action
    await logAction(
      req.user.id,
      req.user.name,
      'UPDATE',
      'Form',
      form._id,
      form.title,
      { status: form.status, fieldCount: form.fields.length },
      req.ip,
      'success'
    );

    res.json({
      success: true,
      message: 'Form updated successfully',
      data: form,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update form',
      error: error.message,
    });
  }
};

/**
 * Delete a form
 */
export const deleteForm = async (req, res) => {
  try {
    const { formId } = req.params;

    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found',
      });
    }

    // Check for existing submissions
    const submissionCount = await DynamicSubmission.countDocuments({ formId });
    if (submissionCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete form with existing submissions. Archive it instead.',
      });
    }

    const formTitle = form.title;
    const eventId = form.eventId;

    await Form.findByIdAndDelete(formId);

    // Remove form reference from event
    await Event.findByIdAndUpdate(eventId, {
      $pull: { forms: { formId } },
    });

    // Log action
    await logAction(
      req.user.id,
      req.user.name,
      'DELETE',
      'Form',
      formId,
      formTitle,
      { eventId },
      req.ip,
      'success'
    );

    res.json({
      success: true,
      message: 'Form deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete form',
      error: error.message,
    });
  }
};

/**
 * Get form details for editing
 */
export const getFormDetail = async (req, res) => {
  try {
    const { formId } = req.params;

    const form = await Form.findById(formId).populate('eventId', 'name');
    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found',
      });
    }

    res.json({
      success: true,
      data: {
        _id: form._id,
        title: form.title,
        eventId: form.eventId?._id,
        eventName: form.eventId?.name,
        expiryDate: form.expiryDate,
        fields: form.fields,
        status: form.status,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch form details',
      error: error.message,
    });
  }
};

/**
 * Get detailed submission status for a specific form
 */
export const getFormSubmissionStatus = async (req, res) => {
  try {
    const { formId } = req.params;

    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ success: false, message: 'Form not found' });
    }

    const event = await Event.findOne({ 'forms.formId': formId })
      .populate('assignedWorkers.workerId', 'name email region');

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event for this form not found' });
    }

    const isExpired = new Date() > new Date(form.expiryDate);

    const workerStatus = await Promise.all(
      event.assignedWorkers.map(async (workerItem) => {
        const worker = workerItem.workerId;
        if (!worker) return null;

        const submission = await DynamicSubmission.findOne({ formId, workerId: worker._id });
        const draft = await DynamicDraft.findOne({ formId, workerId: worker._id });

        let status = 'Pending';
        let submissionDate = null;

        if (submission && submission.status === 'submitted') {
          status = 'Submitted';
          submissionDate = submission.submittedAt;
        } else if (draft) {
          status = 'Draft Saved';
          submissionDate = draft.updatedAt;
        } else if (isExpired) {
          status = 'Expired';
        }

        return {
          workerId: worker._id,
          name: worker.name,
          email: worker.email,
          region: worker.region,
          status,
          submissionDate,
          location: submission?.location || draft?.location,
          activityDate: submission?.activityDate || draft?.activityDate,
        };
      })
    );

    const validWorkerStatus = workerStatus.filter(Boolean);

    const completedCount = validWorkerStatus.filter(w => w.status === 'Submitted').length;
    const draftCount = validWorkerStatus.filter(w => w.status === 'Draft Saved').length;
    const pendingCount = validWorkerStatus.filter(w => w.status === 'Pending').length;
    const expiredCount = validWorkerStatus.filter(w => w.status === 'Expired').length;
    
    const totalWorkers = validWorkerStatus.length;
    const completionPercentage = totalWorkers > 0 ? Math.round((completedCount / totalWorkers) * 100) : 0;

    res.json({
      success: true,
      data: {
        formTitle: form.title,
        expiryDate: form.expiryDate,
        isExpired,
        metrics: {
          totalWorkers,
          completedCount,
          draftCount,
          pendingCount,
          expiredCount,
          completionPercentage,
        },
        workerStatus: validWorkerStatus,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch form submission status',
      error: error.message,
    });
  }
};

/**
 * Get event submission statistics for AI analysis
 */
export const getEventSubmissionStats = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Fetch all submissions for the event
    const submissions = await Submission.countDocuments({ eventId });
    const dynamicSubmissions = await DynamicSubmission.countDocuments({ eventId });

    // Get draft counts
    const dynamicDrafts = await DynamicDraft.countDocuments({ eventId });
    const drafts = await Draft.countDocuments({ eventId });

    // Get submission details for more insights
    const submissionDetails = await Submission.find({ eventId })
      .select('status submission_timestamp')
      .lean();

    const dynamicSubmissionDetails = await DynamicSubmission.find({ eventId })
      .select('status submittedAt')
      .lean();

    // Count by status
    const submittedCount = submissionDetails.filter(s => s.status === 'submitted').length +
      dynamicSubmissionDetails.length;
    const pendingCount = submissionDetails.filter(s => s.status !== 'submitted').length;

    res.json({
      success: true,
      data: {
        totalSubmissions: submissions + dynamicSubmissions,
        completedSubmissions: submittedCount,
        pendingSubmissions: pendingCount,
        drafts: drafts + dynamicDrafts,
        standardSubmissions: submissions,
        dynamicSubmissions: dynamicSubmissions,
        eventName: event.name,
        eventDate: event.date,
        status: event.status
      }
    });
  } catch (error) {
    console.error('Error fetching event submission stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submission statistics',
      error: error.message
    });
  }
};
