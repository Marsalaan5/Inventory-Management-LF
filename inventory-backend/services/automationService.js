

import pool from '../db.js';
import { sendEmail, sendTemplateEmail } from './emailService.js';
import { 
  createNotification, 
  createNotificationByEmail 
} from './notificationService.js';

// ================== FOLLOW-UPS ==================
export const checkFollowUps = async () => {
  try {
    // console.log('Checking for follow-ups...');
    
    const [emails] = await pool.execute(`
      SELECT e.*, u.email as sender_email_full, u.name as sender_name
      FROM emails e
      JOIN users u ON e.sender_id = u.id
      WHERE e.follow_up_scheduled = TRUE 
      AND e.follow_up_sent = FALSE
      AND e.status = 'sent'
      AND DATEDIFF(NOW(), e.created_at) >= e.follow_up_days
    `);

    // console.log(`Found ${emails.length} emails requiring follow-up`);

    for (const email of emails) {
      await sendFollowUp(email);
    }

    return { processed: emails.length };
  } catch (error) {
    console.error('Error checking follow-ups:', error);
    throw error;
  }
};

export const sendFollowUp = async (originalEmail) => {
  try {
    const recipientName = originalEmail.recipient_email.split('@')[0];
    const originalDate = new Date(originalEmail.created_at).toLocaleDateString();
    
 
    const emailSubject = `Following Up: ${originalEmail.subject || 'No Subject'}`;

    
    await sendTemplateEmail(
      'follow_up',
      originalEmail.recipient_email,
      {
    recipientName,
    originalDate,
    emailSubject: originalEmail.subject || 'No Subject',
    senderName: originalEmail.sender_name
      },
      emailSubject,  
      {
        senderId: originalEmail.sender_id,
        senderEmail: originalEmail.sender_email_full,
        senderName: originalEmail.sender_name
      }
    );

    await pool.execute(
      'UPDATE emails SET follow_up_sent = TRUE, follow_up_sent_at = NOW() WHERE id = ?',
      [originalEmail.id]
    );

    await pool.execute(
      'INSERT INTO email_tracking (email_id, event_type, event_data) VALUES (?, ?, ?)',
      [originalEmail.id, 'follow_up_sent', JSON.stringify({ timestamp: new Date() })]
    );

    await createNotification({
      userId: originalEmail.sender_id,
      emailId: originalEmail.id,
      type: 'follow_up_sent',
      title: 'Follow-up Sent',
      message: `Follow-up email sent to ${originalEmail.recipient_email}`
    });

    // console.log(`Follow-up sent for email ${originalEmail.id}`);
  } catch (error) {
    console.error(`Error sending follow-up for email ${originalEmail.id}:`, error);
    throw error;
  }
};

// ================== ESCALATIONS ==================
export const checkEscalations = async () => {
  try {
    // console.log('Checking for escalations...');

    const [emails] = await pool.execute(`
      SELECT e.*, u.email as sender_email_full, u.name as sender_name
      FROM emails e
      JOIN users u ON e.sender_id = u.id
      WHERE e.escalation_enabled = TRUE 
      AND e.escalated = FALSE
      AND e.follow_up_sent = TRUE
      AND DATEDIFF(NOW(), e.follow_up_sent_at) >= 2
    `);

    // console.log(`Found ${emails.length} emails requiring escalation`);

    for (const email of emails) {
      await escalateEmail(email);
    }

    return { processed: emails.length };
  } catch (error) {
    console.error('Error checking escalations:', error);
    throw error;
  }
};

export const escalateEmail = async (originalEmail) => {
  try {
    if (!originalEmail.escalation_email) {
      // console.log(`No escalation email set for email ${originalEmail.id}`);
      return;
    }

    const authorityName = originalEmail.escalation_email.split('@')[0];
    const firstContactDate = new Date(originalEmail.created_at).toLocaleDateString();

   
    const emailSubject = `Escalation: ${originalEmail.subject || 'No Subject'}`;
    const notificationMessage = `Urgent: Email requires your attention - ${originalEmail.subject || 'No Subject'}`;


    await sendTemplateEmail(
      'escalation',
      originalEmail.escalation_email,
      {
        authorityName,
        originalRecipient: originalEmail.recipient_email,
        firstContactDate
      },
      emailSubject, 
      {
        senderId: originalEmail.sender_id,
        senderEmail: originalEmail.sender_email_full,
        senderName: originalEmail.sender_name
      }
    );

    await pool.execute(
      'UPDATE emails SET escalated = TRUE, escalated_at = NOW() WHERE id = ?',
      [originalEmail.id]
    );

    await pool.execute(
      'INSERT INTO email_tracking (email_id, event_type, event_data) VALUES (?, ?, ?)',
      [
        originalEmail.id,
        'escalated',
        JSON.stringify({ escalatedTo: originalEmail.escalation_email, timestamp: new Date() })
      ]
    );

    await createNotification({
      userId: originalEmail.sender_id,
      emailId: originalEmail.id,
      type: 'escalation',
      title: 'Email Escalated',
      message: `Email to ${originalEmail.recipient_email} has been escalated to ${originalEmail.escalation_email}`
    });

    await createNotificationByEmail({
      userEmail: originalEmail.escalation_email,
      emailId: originalEmail.id,
      type: 'escalation',
      title: 'Escalation Notice',
      message: notificationMessage
    });

    // console.log(`Email ${originalEmail.id} escalated to ${originalEmail.escalation_email}`);
  } catch (error) {
    console.error(`Error escalating email ${originalEmail.id}:`, error);
    throw error;
  }
};

// ================== PACKAGE UPDATES ==================
export const processPackageUpdate = async (trackingData) => {
  try {
    const { trackingNumber, status, recipientEmail } = trackingData;

    const [emails] = await pool.execute(
      `SELECT * FROM emails 
       WHERE recipient_email = ? 
       AND body LIKE ?
       ORDER BY created_at DESC LIMIT 1`,
      [recipientEmail, `%${trackingNumber}%`]
    );

    if (emails.length > 0) {
      const email = emails[0];

      await sendEmail({
        to: recipientEmail,
        subject: `Package Update - ${trackingNumber}`,
        html: `
          <h2>Package Status Update</h2>
          <p>Your package (${trackingNumber}) status has been updated:</p>
          <p><strong>New Status:</strong> ${status}</p>
        `
      });

      await createNotificationByEmail({
        userEmail: recipientEmail,
        emailId: email.id,
        type: 'system',
        title: 'Package Update',
        message: `Package ${trackingNumber}: ${status}`
      });
    }
  } catch (error) {
    console.error('Error processing package update:', error);
    throw error;
  }
};

export default {
  checkFollowUps,
  sendFollowUp,
  checkEscalations,
  escalateEmail,
  processPackageUpdate
};