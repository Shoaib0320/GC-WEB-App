import nodemailer from 'nodemailer';

// Nodemailer install karo
// npm install nodemailer

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  secure: process.env.EMAIL_SERVER_PORT == "465", // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || 'GC Support'}" <${process.env.EMAIL_SERVER_USER}>`,
      to,
      subject,
      html,
      text,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Email sending failed');
  }
};

// Email Templates
export const emailTemplates = {
  agentWelcome: (agentName, agentId, password) => ({
    subject: 'Welcome to Agent System - Your Account Details',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0070f3; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .credentials { background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #0070f3; margin: 15px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Agent Management System</h1>
          </div>
          <div class="content">
            <h2>Welcome, ${agentName}!</h2>
            <p>Your agent account has been successfully created. Here are your login details:</p>
            
            <div class="credentials">
              <h3>Login Credentials:</h3>
              <p><strong>Agent ID:</strong> ${agentId}</p>
              <p><strong>Password:</strong> ${password}</p>
              <p><strong>Login URL:</strong> ${process.env.NEXTAUTH_URL}/login</p>
            </div>

            <p><strong>Important Security Notes:</strong></p>
            <ul>
              <li>Keep your credentials secure and do not share with anyone</li>
              <li>Use the Agent ID (not email) to login</li>
            </ul>

            <p>If you have any questions, please contact the system administrator.</p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Welcome to Agent System!
      
      Your agent account has been created successfully.
      
      Login Details:
      Agent ID: ${agentId}
      Password: ${password}
      Login URL: ${process.env.FRONTEND_URL}/login
      
      Important:
      - Keep your credentials secure
      - Change password after first login
      - Use Agent ID to login
      
      This is an automated message.
    `
  }),

  passwordReset: (resetLink) => ({
    subject: 'Password Reset Request - Agent System',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc3545; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .button { background: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 15px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Reset Your Password</h2>
            <p>You requested to reset your password. Click the button below to create a new password:</p>
            
            <a href="${resetLink}" class="button">Reset Password</a>
            
            <p>If the button doesn't work, copy and paste this link in your browser:</p>
            <p>${resetLink}</p>
            
            <p><strong>This link will expire in 1 hour.</strong></p>
            <p>If you didn't request this reset, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Password Reset Request
      
      You requested to reset your password. Use the link below:
      
      ${resetLink}
      
      This link expires in 1 hour.
      
      If you didn't request this, please ignore this email.
    `
  }),
  // New templates for agent updates
  passwordUpdate: (agentName, agentId) => ({
    subject: 'Your Password Has Been Updated',
    html: `
      <div>
        <h2>Password Updated Successfully</h2>
        <p>Dear ${agentName},</p>
        <p>Your password for agent account (ID: ${agentId}) has been successfully updated.</p>
        <p>If you did not request this change, please contact support immediately.</p>
        <br/>
        <p>Best regards,<br/>Management Team</p>
      </div>
    `,
    text: `Password Updated - Dear ${agentName}, your password for agent account (ID: ${agentId}) has been updated.`
  }),

  profileUpdate: (agentName, agentId) => ({
    subject: 'Your Profile Has Been Updated',
    html: `
      <div>
        <h2>Profile Updated</h2>
        <p>Dear ${agentName},</p>
        <p>Your agent profile (ID: ${agentId}) has been successfully updated.</p>
        <p>If you did not request these changes, please contact support immediately.</p>
        <br/>
        <p>Best regards,<br/>Management Team</p>
      </div>
    `,
    text: `Profile Updated - Dear ${agentName}, your agent profile (ID: ${agentId}) has been updated.`
  }),

  // accountStatus: (agentName, agentId, status) => ({
  //   subject: `Your Account Has Been ${status}`,
  //   html: `
  //     <div>
  //       <h2>Account ${status.charAt(0).toUpperCase() + status.slice(1)}</h2>
  //       <p>Dear ${agentName},</p>
  //       <p>Your agent account (ID: ${agentId}) has been ${status}.</p>
  //       <p>If you believe this is an error, please contact support.</p>
  //       <br/>
  //       <p>Best regards,<br/>Management Team</p>
  //     </div>
  //   `,
  //   text: `Account ${status} - Dear ${agentName}, your agent account (ID: ${agentId}) has been ${status}.`
  // })
   accountStatus: (agentName, agentId, status) => ({
    subject: `🔔 Your Agent Account Has Been ${status.charAt(0).toUpperCase() + status.slice(1)}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px;">Account ${status.charAt(0).toUpperCase() + status.slice(1)}</h1>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <p>Dear <strong>${agentName}</strong>,</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid ${status === 'activated' ? '#10B981' : '#EF4444'};">
            <p>Your agent account <strong>(ID: ${agentId})</strong> has been <strong style="color: ${status === 'activated' ? '#10B981' : '#EF4444'};">${status}</strong>.</p>
            
            ${status === 'activated' 
              ? `<p>✅ You can now access all agent features and log in to the system.</p>`
              : `<p>❌ Your account access has been temporarily suspended. You will not be able to log in until your account is reactivated.</p>`
            }
          </div>
          
          <p style="margin-top: 20px;">
            If you believe this is an error or have any questions, please contact our support team immediately.
          </p>
          
          <div style="margin-top: 30px; padding: 15px; background: #e8f4fd; border-radius: 5px;">
            <p style="margin: 0; font-size: 14px; color: #0369a1;">
              <strong>Need Help?</strong><br/>
              Contact Support: support@yourcompany.com<br/>
              Phone: +1-234-567-8900
            </p>
          </div>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">&copy; 2024 Your Company Name. All rights reserved.</p>
        </div>
      </div>
    `,
    text: `
      Account ${status.toUpperCase()}
      
      Dear ${agentName},
      
      Your agent account (ID: ${agentId}) has been ${status}.
      
      ${status === 'activated' 
        ? 'You can now access all agent features and log in to the system.' 
        : 'Your account access has been temporarily suspended. You will not be able to log in until your account is reactivated.'
      }
      
      If you believe this is an error, please contact our support team immediately.
      
      Support Email: support@yourcompany.com
      Phone: +1-234-567-8900
      
      © 2025 Your Company Name. All rights reserved.
    `
  }),

  contactReply: (contactName, originalMessage, replySubject, replyMessage, websiteName) => ({
    subject: replySubject,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0070f3; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .original-message { background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #0070f3; margin: 15px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Contact Reply from ${websiteName}</h1>
          </div>
          <div class="content">
            <h2>Dear ${contactName},</h2>
            <p>Thank you for your message to ${websiteName}. We have received your inquiry and here is our response:</p>

            <div class="original-message">
              <h3>Your Original Message:</h3>
              <p>${originalMessage}</p>
            </div>

            <p>${replyMessage}</p>

            <p>If you have any further questions, please don't hesitate to contact us.</p>
            <p>Best regards,<br/>${websiteName} Support Team</p>
          </div>
          <div class="footer">
            <p>This is an automated response from ${websiteName}. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Contact Reply from ${websiteName}

      Dear ${contactName},

      Thank you for your message to ${websiteName}. We have received your inquiry and here is our response:

      Your Original Message:
      ${originalMessage}

      ${replyMessage}

      If you have any further questions, please don't hesitate to contact us.

      Best regards,
      ${websiteName} Support Team

      This is an automated response from ${websiteName}.
    `
  })
};
