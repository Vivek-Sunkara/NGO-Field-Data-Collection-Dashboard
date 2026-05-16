import cron from 'node-cron';
import DynamicDraft from '../models/DynamicDraft.js';
import DynamicSubmission from '../models/DynamicSubmission.js';
import Event from '../models/Event.js';
import Form from '../models/Form.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { createNotification } from './notificationService.js';
import { sendReminderEmail } from './mailService.js';
import { logAction } from './auditService.js';

/**
 * Send reminders to workers with pending submissions
 * Runs every 12 hours
 */
export const startReminderCron = () => {
  // Run every 12 hours (0 and 12 o'clock)
  cron.schedule('0 0,12 * * *', async () => {
    console.log('[Cron] Running reminder job at', new Date());

    try {
      // Get all pending submissions (drafts)
      const drafts = await DynamicDraft.find()
        .populate('formId')
        .populate('eventId')
        .populate('workerId', 'name email');

      let remindersSent = 0;

      for (const draft of drafts) {
        const form = draft.formId;
        const event = draft.eventId;
        const worker = draft.workerId;

        // Don't send reminder if form is expired
        if (new Date() > new Date(form.expiryDate)) {
          continue;
        }

        try {
          // Create in-app notification
          await createNotification(
            worker._id,
            'REMINDER',
            `Reminder: ${form.title}`,
            `You have a pending submission for "${form.title}" in the event "${event.name}". Please submit before ${new Date(form.expiryDate).toLocaleDateString()}.`,
            {
              entityType: 'Form',
              entityId: form._id,
            },
            `/worker/forms/${form._id}`
          );

          // Send email reminder
          await sendReminderEmail(worker, form, event);

          // Log action
          await logAction(
            null,
            'System',
            'REMINDER_SENT',
            'Form',
            form._id,
            form.title,
            { recipientId: worker._id, recipientEmail: worker.email },
            null,
            'success'
          );

          remindersSent++;
        } catch (error) {
          console.error(`Failed to send reminder to ${worker.email}:`, error);
        }
      }

      console.log(`[Cron] Reminders sent to ${remindersSent} workers`);
    } catch (error) {
      console.error('[Cron] Error in reminder job:', error);
    }
  });

  console.log('[Cron] Reminder job scheduled every 12 hours');
};

/**
 * Check for expired forms and notify admins
 * Runs every 6 hours
 */
export const startExpiryAlertCron = () => {
  // Run every 5 minutes to alert workers 30 minutes before expiry
  cron.schedule('*/5 * * * *', async () => {
    console.log('[Cron] Running 30-minute expiry alert at', new Date());

    try {
      const now = new Date();
      const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);

      const expiringForms = await Form.find({
        expiryDate: {
          $gt: now,
          $lte: thirtyMinutesFromNow,
        },
        status: 'active',
      }).populate('eventId');

      let alertsSent = 0;

      for (const form of expiringForms) {
        const event = form.eventId;
        if (!event) continue;

        const workers = event.assignedWorkers || [];
        for (const workerItem of workers) {
          const workerId = workerItem.workerId;

          const alreadySubmitted = await DynamicSubmission.exists({
            formId: form._id,
            workerId,
            status: 'submitted',
          });

          if (alreadySubmitted) continue;

          const existingReminder = await Notification.findOne({
            userId: workerId,
            type: 'REMINDER',
            'relatedEntity.entityType': 'Form',
            'relatedEntity.entityId': form._id,
            createdAt: { $gte: new Date(now.getTime() - 30 * 60 * 1000) },
          });

          if (existingReminder) continue;

          const worker = await User.findById(workerId).select('name email');
          if (!worker) continue;

          await createNotification(
            worker._id,
            'REMINDER',
            `Form expiring soon: ${form.title}`,
            `The form "${form.title}" for event "${event.name}" expires at ${new Date(form.expiryDate).toLocaleString()}. Please submit it within the next 30 minutes.`,
            {
              entityType: 'Form',
              entityId: form._id,
            },
            `/worker/forms/${form._id}`
          );

          await sendReminderEmail(worker, form, event, true);

          await logAction(
            null,
            'System',
            'EXPIRY_ALERT_SENT',
            'Form',
            form._id,
            form.title,
            { recipientId: worker._id, recipientEmail: worker.email },
            null,
            'success'
          );

          alertsSent++;
        }
      }

      console.log(`[Cron] 30-minute expiry alerts sent: ${alertsSent}`);
    } catch (error) {
      console.error('[Cron] Error in expiry alert job:', error);
    }
  });

  console.log('[Cron] 30-minute expiry alert job scheduled every 5 minutes');
};

export const startExpiryCheckCron = () => {
  // Run every 6 hours
  cron.schedule('0 0,6,12,18 * * *', async () => {
    console.log('[Cron] Running expiry check at', new Date());

    try {
      // Get forms expiring soon (within 24 hours)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const forms = await Form.find({
        expiryDate: {
          $gte: new Date(),
          $lte: tomorrow,
        },
        status: 'active',
      }).populate('eventId');

      for (const form of forms) {
        // Get all admins
        const admins = await User.find({ role: 'Admin' });

        for (const admin of admins) {
          await createNotification(
            admin._id,
            'REMINDER',
            `Form Expiring Soon: ${form.title}`,
            `The form "${form.title}" for event "${form.eventId.name}" will expire on ${new Date(form.expiryDate).toLocaleDateString()}.`,
            {
              entityType: 'Form',
              entityId: form._id,
            },
            `/admin/events/${form.eventId._id}`
          );
        }
      }

      console.log(`[Cron] Expiry check completed for ${forms.length} forms`);
    } catch (error) {
      console.error('[Cron] Error in expiry check:', error);
    }
  });

  console.log('[Cron] Expiry check scheduled every 6 hours');
};

/**
 * Check for completed events and send completion notifications
 * Runs every 24 hours
 */
export const startEventCompletionCron = () => {
  // Run daily at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('[Cron] Running event completion check at', new Date());

    try {
      const events = await Event.find({ status: 'active' })
        .populate('assignedWorkers.workerId')
        .populate('forms.formId');

      for (const event of events) {
        const totalWorkers = event.assignedWorkers.length;
        let totalSubmissions = 0;

        // Count submissions for this event
        for (const formItem of event.forms) {
          const submissions = await DynamicSubmission.countDocuments({
            eventId: event._id,
            formId: formItem.formId._id,
            status: 'submitted',
          });
          totalSubmissions += submissions;
        }

        const expectedSubmissions = totalWorkers * event.forms.length;

        // If all submissions received, mark event as completed
        if (totalSubmissions === expectedSubmissions && expectedSubmissions > 0) {
          event.status = 'completed';
          await event.save();

          // Notify all admins
          const admins = await User.find({ role: 'Admin' });
          for (const admin of admins) {
            await createNotification(
              admin._id,
              'EVENT_COMPLETED',
              `Event Completed: ${event.name}`,
              `All workers have submitted their responses for the event "${event.name}".`,
              {
                entityType: 'Event',
                entityId: event._id,
              },
              `/admin/events/${event._id}`
            );
          }

          console.log(`[Cron] Event "${event.name}" marked as completed`);
        }
      }

      console.log('[Cron] Event completion check completed');
    } catch (error) {
      console.error('[Cron] Error in event completion check:', error);
    }
  });

  console.log('[Cron] Event completion check scheduled daily');
};

/**
 * Initialize all cron jobs
 */
export const initializeCronJobs = () => {
  startReminderCron();
  startExpiryAlertCron();
  startExpiryCheckCron();
  startEventCompletionCron();
};
