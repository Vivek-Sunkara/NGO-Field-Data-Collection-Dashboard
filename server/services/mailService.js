import nodemailer from 'nodemailer';

let transporter;

// Initialize email transporter
export const initializeMailer = () => {
  const emailPass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, '') : '';
  
  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
      user: process.env.EMAIL_USER,
      pass: emailPass,
    },
    debug: true,
    logger: true,
  });
};

/**
 * Send email to worker when event is assigned
 */
export const sendEventAssignmentEmail = async (worker, event) => {
  try {
    if (!transporter) initializeMailer();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: worker.email,
      subject: `New Event Assignment: ${event.name}`,
      html: `
        <h2>New Event Assignment</h2>
        <p>Hello ${worker.name},</p>
        <p>You have been assigned to a new event: <strong>${event.name}</strong></p>
        <p>${event.description || 'Please check the dashboard for more details.'}</p>
        <p><a href="${process.env.FRONTEND_URL}/worker/events" style="padding: 10px 20px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px;">View Events</a></p>
        <p>Best regards,<br>NGO Field Data Collection Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Event assignment email sent to ${worker.email}`);
  } catch (error) {
    console.error('Error sending event assignment email:', error);
  }
};

/**
 * Send email to worker when form is assigned
 */
export const sendFormAssignmentEmail = async (worker, form, event) => {
  try {
    if (!transporter) initializeMailer();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: worker.email,
      subject: `New Form Assigned: ${form.title}`,
      html: `
        <h2>New Form Assigned</h2>
        <p>Hello ${worker.name},</p>
        <p>A new form has been assigned to you for the event: <strong>${event.name}</strong></p>
        <h3>${form.title}</h3>
        <p>${form.description || 'Please complete this form as soon as possible.'}</p>
        <p><strong>Expiry Date:</strong> ${new Date(form.expiryDate).toLocaleDateString()}</p>
        <p><a href="${process.env.FRONTEND_URL}/worker/events" style="padding: 10px 20px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px;">Fill Form</a></p>
        <p>Best regards,<br>NGO Field Data Collection Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Form assignment email sent to ${worker.email}`);
  } catch (error) {
    console.error('Error sending form assignment email:', error);
  }
};

/**
 * Send email to admin when worker submits form
 */
export const sendSubmissionNotificationEmail = async (admin, worker, form, event) => {
  try {
    if (!transporter) initializeMailer();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: admin.email,
      subject: `New Submission: ${form.title} by ${worker.name}`,
      html: `
        <h2>New Form Submission</h2>
        <p>Hello ${admin.name},</p>
        <p><strong>${worker.name}</strong> has submitted the form <strong>${form.title}</strong> for the event <strong>${event.name}</strong></p>
        <p><strong>Submission Time:</strong> ${new Date().toLocaleString()}</p>
        <p><a href="${process.env.FRONTEND_URL}/admin/submissions" style="padding: 10px 20px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px;">View Submission</a></p>
        <p>Best regards,<br>NGO Field Data Collection Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Submission notification email sent to ${admin.email}`);
  } catch (error) {
    console.error('Error sending submission notification email:', error);
    // Log more details about the error
    if (error.code === 'EAUTH') {
      console.error('AUTHENTICATION ERROR: Please check your EMAIL_USER and EMAIL_PASS in .env');
    }
  }
};

/**
 * Send reminder email to pending workers
 */
export const sendReminderEmail = async (worker, form, event) => {
  try {
    if (!transporter) initializeMailer();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: worker.email,
      subject: `Reminder: ${form.title} - Please Submit`,
      html: `
        <h2>Submission Reminder</h2>
        <p>Hello ${worker.name},</p>
        <p>This is a reminder that you have a pending form to submit.</p>
        <h3>${form.title}</h3>
        <p><strong>Event:</strong> ${event.name}</p>
        <p><strong>Expiry Date:</strong> ${new Date(form.expiryDate).toLocaleDateString()}</p>
        <p>Please submit the form at your earliest convenience.</p>
        <p><a href="${process.env.FRONTEND_URL}/worker/events" style="padding: 10px 20px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px;">Submit Now</a></p>
        <p>Best regards,<br>NGO Field Data Collection Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Reminder email sent to ${worker.email}`);
  } catch (error) {
    console.error('Error sending reminder email:', error);
  }
};

/**
 * Send event completion email to admin
 */
export const sendEventCompletionEmail = async (admin, event, stats) => {
  try {
    if (!transporter) initializeMailer();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: admin.email,
      subject: `Event Completed: ${event.name}`,
      html: `
        <h2>Event Completion Report</h2>
        <p>Hello ${admin.name},</p>
        <p>The event <strong>${event.name}</strong> has been completed!</p>
        <h3>Statistics</h3>
        <ul>
          <li>Total Workers: ${stats.totalWorkers}</li>
          <li>Submissions: ${stats.totalSubmissions}</li>
          <li>Completion Rate: ${stats.completionRate}%</li>
          <li>Forms: ${stats.totalForms}</li>
        </ul>
        <p><a href="${process.env.FRONTEND_URL}/admin/events" style="padding: 10px 20px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px;">View Event</a></p>
        <p>Best regards,<br>NGO Field Data Collection Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Event completion email sent to ${admin.email}`);
  } catch (error) {
    console.error('Error sending event completion email:', error);
  }
};
