import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOTPEmail = async (email, otp, name) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP for NGO Field Data Collection Dashboard',
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <div style="background-color: white; padding: 30px; border-radius: 8px; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #333; margin-bottom: 20px;">NGO Field Data Collection Dashboard</h2>
          <p style="color: #666; font-size: 16px; margin-bottom: 20px;">Hello <strong>${name}</strong>,</p>
          <p style="color: #666; font-size: 14px; margin-bottom: 30px;">Your One-Time Password (OTP) for verification is:</p>
          <div style="background-color: #007bff; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
            <h1 style="margin: 0; font-size: 36px; letter-spacing: 5px;">${otp}</h1>
          </div>
          <p style="color: #666; font-size: 13px; margin-bottom: 20px;"><strong>⏰ This OTP will expire in 5 minutes.</strong></p>
          <p style="color: #999; font-size: 12px; margin-bottom: 30px;">If you didn't request this code, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">© 2024 NGO Field Data Collection Dashboard. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent to ${email}`);
    return true;
  } catch (error) {
    console.error(`Error sending email: ${error.message}`);
    return false;
  }
};

export default transporter;
