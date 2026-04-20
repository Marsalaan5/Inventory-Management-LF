import pool from "../db.js";
import { DateTime } from "luxon";
import Joi from "joi";
import { do_ma_query } from "../db.js";
import { sendEmail } from "../services/emailService.js";
import { 
  getNotifications as getNotificationsService,
  createNotification as createNotificationService,
  createNotificationByEmail as createNotificationByEmailService,
  markAsRead as markAsReadService,
  markAllAsRead as markAllAsReadService
} from "../services/notificationService.js";


const buildEmailQuery = ({ category, userId, userEmail, search }) => {
  const categoryMap = {
    inbox: {
      clause: 'recipient_email = ? AND status != "trash"',
      params: [userEmail],
    },
    sent: {
      clause: 'sender_id = ? AND status = "sent"',
      params: [userId],
    },
    starred: {
      clause:
        '(sender_id = ? OR recipient_email = ?) AND is_starred = TRUE AND status != "trash"',
      params: [userId, userEmail],
    },
    drafts: {
      clause: 'sender_id = ? AND status = "draft"',
      params: [userId],
    },
    trash: {
      clause: '(sender_id = ? OR recipient_email = ?) AND status = "trash"',
      params: [userId, userEmail],
    },
  };

  const categoryData = categoryMap[category];
  if (!categoryData) return null;

  let { clause, params } = categoryData;

  // Full text search
  if (search) {
    clause +=
      " AND MATCH(subject, body, sender_email, recipient_email) AGAINST(? IN BOOLEAN MODE)";
    params.push(`${search}*`);
  }

  return { clause, params };
};

export const getEmails = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 10, search = "", lastCreatedAt } = req.query;
    const userId = req.user.id;
    const userEmail = req.user.email;

    let offset = (page - 1) * limit;
    let keysetFilter = "";
    const queryData = buildEmailQuery({ category, userId, userEmail, search });

    if (!queryData) {
      return res.status(400).json({
        success: false,
        message: "Invalid category",
        timestamp: DateTime.local().toISO(),
      });
    }

    let { clause, params } = queryData;

    // Keyset pagination for large mailboxes
    if (lastCreatedAt) {
      keysetFilter = " AND created_at < ?";
      params.push(lastCreatedAt);
      offset = 0; // offset is not used with keyset pagination
    }

    const query = `
      SELECT * FROM emails
      WHERE ${clause} ${keysetFilter}
      ORDER BY created_at DESC
      LIMIT ?
    `;

    const countQuery = `SELECT COUNT(*) as total FROM emails WHERE ${clause}`;

    const emails = await do_ma_query(query, [...params, parseInt(limit)]);
    const countResult = await do_ma_query(countQuery, params);
    const total = countResult[0].total;

    res.status(200).json({
      success: true,
      data: emails,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
        lastCreatedAt: emails.length
          ? emails[emails.length - 1].created_at
          : null,
      },
      timestamp: DateTime.local().toISO(),
    });
  } catch (error) {
    console.error(`[Email Fetch Error] ${error.stack}`);
    res.status(500).json({
      success: false,
      message: "Error fetching emails",
      error: error.message,
      timestamp: DateTime.local().toISO(),
    });
  }
};

// GET single email by ID
export const getEmailById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userEmail = req.user.email;

    const emails = await do_ma_query(
      `SELECT * FROM emails 
       WHERE id = ?
         AND (sender_id = ? OR recipient_email = ?)`,
      [id, userId, userEmail]
    );

    if (emails.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Email not found or access denied",
        timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
      });
    }

    res.status(200).json({
      success: true,
      data: emails[0],
      timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
    });
  } catch (error) {
    console.error("Error fetching email:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching email",
      error: error.message,
    });
  }
};

// POST send email
export const sendEmails = async (req, res) => {
  try {
    const emailSchema = Joi.object({
      to: Joi.string().email().required().label("recipient email"),
      subject: Joi.string().min(1).max(500).required().label("subject"),
      body: Joi.string().required().label("body"),
      template: Joi.string().max(100).allow("", null).label("template"),
      enableFollowUp: Joi.boolean().default(false).label("enable follow-up"),
      followUpDays: Joi.number().integer().min(1).max(30).default(2).label("follow-up days"),
      enableEscalation: Joi.boolean().default(false).label("enable escalation"),
      escalationEmail: Joi.string().email().allow("", null).label("escalation email"),
      escalationDays: Joi.number().integer().min(1).max(30).default(3),
    });

    const { error, value } = emailSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
      });
    }

    const userId = req.user.id;
    const userEmail = req.user.email;

    
const result = await do_ma_query(
  `INSERT INTO emails (
    sender_id, sender_email, recipient_email, subject, body, 
    status, follow_up_scheduled, follow_up_days, 
    escalation_enabled, escalation_email, template_type
  ) VALUES (?, ?, ?, ?, ?, 'sent', ?, ?, ?, ?, ?)`,
  [
    userId, userEmail, value.to, value.subject, value.body,
    value.enableFollowUp, value.followUpDays,
    value.enableEscalation, value.escalationEmail || null,
    value.template || "none",
  ]
);

    const emailId = result.insertId;

    // Send actual email
    await sendEmail({
      to: value.to,
      from: userEmail,
      subject: value.subject,
      html: value.body,
    });

    // Track email sent event
    await do_ma_query(
      "INSERT INTO email_tracking (email_id, event_type, event_data) VALUES (?, ?, ?)",
      [emailId, "sent", JSON.stringify({ timestamp: new Date() })]
    );

    // Create notification for recipient
  await createNotificationByEmailService({
  userEmail: value.to,
  emailId,
  type: "new_email",
  title: "New Email",
  message: `You have a new email from ${userEmail}`,
});

    res.status(201).json({
      success: true,
      message: "Email sent successfully",
      data: {
        emailId,
        followUpScheduled: value.enableFollowUp,
        escalationEnabled: value.enableEscalation,
      },
      timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
    });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({
      success: false,
      message: "Error sending email",
      error: error.message,
      timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
    });
  }
};

// PUT mark email as read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userEmail = req.user.email;

    const result = await do_ma_query(
      `UPDATE emails 
       SET is_read = TRUE 
       WHERE id = ?
         AND (sender_id = ? OR recipient_email = ?)`,
      [id, userId, userEmail]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Email not found or access denied",
      });
    }

    res.status(200).json({
      success: true,
      message: "Email marked as read",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error updating email",
    });
  }
};

// PUT toggle star

export const toggleStar = async (req, res) => {
  try {
    const { id } = req.params;
    const { starred } = req.body;
    const userId = req.user.id;
    const userEmail = req.user.email;

    const result = await do_ma_query(
      `UPDATE emails 
       SET is_starred = ? 
       WHERE id = ?
         AND (sender_id = ? OR recipient_email = ?)`,
      [starred, id, userId, userEmail]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Email not found or access denied",
      });
    }

    res.status(200).json({
      success: true,
      message: "Star updated",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error updating email",
    });
  }
};

// DELETE email
export const deleteEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userEmail = req.user.email;

    const result = await do_ma_query(
      `UPDATE emails 
       SET status = 'trash'
       WHERE id = ?
         AND (sender_id = ? OR recipient_email = ?)`,
      [id, userId, userEmail]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Email not found or access denied",
      });
    }

    res.status(200).json({
      success: true,
      message: "Email moved to trash",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error deleting email",
    });
  }
};

// POST bulk actions
export const bulkAction = async (req, res) => {
  try {
    const { action } = req.params;
    const { emailIds } = req.body;

    if (!emailIds || emailIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No emails selected",
        timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
      });
    }

    const placeholders = emailIds.map(() => "?").join(",");
    const userId = req.user.id;
    const userEmail = req.user.email;

    switch (action) {
      case "read":
        await do_ma_query(
          `UPDATE emails 
           SET is_read = TRUE 
           WHERE id IN (${placeholders}) 
             AND (sender_id = ? OR recipient_email = ?)`,
          [...emailIds, userId, userEmail]
        );
        break;

      case "unread":
        await do_ma_query(
          `UPDATE emails 
           SET is_read = FALSE 
           WHERE id IN (${placeholders}) 
             AND (sender_id = ? OR recipient_email = ?)`,
          [...emailIds, userId, userEmail]
        );
        break;

      case "delete":
        await do_ma_query(
          `UPDATE emails 
           SET status = 'trash'
           WHERE id IN (${placeholders})
             AND (sender_id = ? OR recipient_email = ?)`,
          [...emailIds, userId, userEmail]
        );
        break;

      default:
        return res.status(400).json({
          success: false,
          message: "Invalid action",
          timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
        });
    }

    res.status(200).json({
      success: true,
      message: `Bulk ${action} completed successfully`,
      timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
    });
  } catch (error) {
    console.error("Error performing bulk action:", error);
    res.status(500).json({
      success: false,
      message: "Error performing bulk action",
      error: error.message,
      timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
    });
  }
};

// GET templates
export const getTemplates = async (req, res) => {
  try {
    const templates = await do_ma_query(
      "SELECT * FROM email_templates WHERE is_active = TRUE ORDER BY name"
    );

    res.status(200).json({
      success: true,
      data: templates,
      timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
    });
  } catch (error) {
    console.error("Error fetching templates:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching templates",
      error: error.message,
      timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
    });
  }
};

export const getReceivedEmails = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const userEmail = req.user.email;
    const offset = (page - 1) * limit;

    let searchClause = "";
    let params = [userEmail];

    if (search) {
      searchClause = " AND MATCH(subject, body, sender_email) AGAINST(? IN BOOLEAN MODE)";
      params.push(`${search}*`);
    }

    const query = `
      SELECT * FROM emails
      WHERE recipient_email = ? AND status = 'sent' ${searchClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;

    const countQuery = `
      SELECT COUNT(*) as total FROM emails 
      WHERE recipient_email = ? AND status = 'sent' ${searchClause}
    `;

    const emails = await do_ma_query(query, [...params, parseInt(limit), offset]);
    const countResult = await do_ma_query(countQuery, params);
    const total = countResult[0].total;

    res.status(200).json({
      success: true,
      data: emails,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
      timestamp: DateTime.local().toISO(),
    });
  } catch (error) {
    console.error("Error fetching received emails:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching received emails",
      error: error.message,
    });
  }
};


export const saveDraft = async (req, res) => {
  try {
    const { to, subject, body, template } = req.body;
    const userId = req.user.id;
    const userEmail = req.user.email;

    const result = await do_ma_query(
      `INSERT INTO emails (
        sender_id, sender_email, recipient_email, subject, body, 
        status, template_type
      ) VALUES (?, ?, ?, ?, ?, 'draft', ?)
      ON DUPLICATE KEY UPDATE
        subject = VALUES(subject),
        body = VALUES(body),
        updated_at = CURRENT_TIMESTAMP`,
      [userId, userEmail, to || "", subject || "", body || "", template || "none"]
    );

    res.status(201).json({
      success: true,
      message: "Draft saved successfully",
      data: { emailId: result.insertId },
      timestamp: DateTime.local().toISO(),
    });
  } catch (error) {
    console.error("Error saving draft:", error);
    res.status(500).json({
      success: false,
      message: "Error saving draft",
      error: error.message,
    });
  }
};


// export const sendStockRequest = async (req, res) => {
//   try {
//     const stockRequestSchema = Joi.object({
//       to: Joi.string().email().required(),
//       productName: Joi.string().required(),
//       quantity: Joi.number().integer().min(1).required(),
//       urgency: Joi.string().valid('low', 'medium', 'high').default('medium'),
//       notes: Joi.string().allow(''),
//     });

//     const { error, value } = stockRequestSchema.validate(req.body);

//     if (error) {
//       return res.status(400).json({
//         success: false,
//         message: error.details[0].message,
//       });
//     }

//     const userId = req.user.id;
//     const userEmail = req.user.email;
//     const userName = req.user.username || userEmail;

//     const subject = `Stock Request: ${value.productName} (${value.quantity} units)`;
//     const body = `
//       <div style="font-family: Arial, sans-serif; padding: 20px;">
//         <h2>Stock Request</h2>
//         <p><strong>From:</strong> ${userName} (${userEmail})</p>
//         <p><strong>Product:</strong> ${value.productName}</p>
//         <p><strong>Quantity:</strong> ${value.quantity}</p>
//         <p><strong>Urgency:</strong> <span style="color: ${
//           value.urgency === 'high' ? 'red' : value.urgency === 'medium' ? 'orange' : 'green'
//         }">${value.urgency.toUpperCase()}</span></p>
//         ${value.notes ? `<p><strong>Notes:</strong> ${value.notes}</p>` : ''}
//         <hr/>
//         <p>Please review and respond to this request.</p>
//       </div>
//     `;

//     // Insert email with stock request metadata
//     const result = await do_ma_query(
//       `INSERT INTO emails (
//         sender_id, sender_email, recipient_email, subject, body, 
//         status, template_type
//       ) VALUES (?, ?, ?, ?, ?, 'sent', 'stock_request')`,
//       [userId, userEmail, value.to, subject, body]
//     );

//     const emailId = result.insertId;

//     // Send actual email
//     await sendEmail({
//       to: value.to,
//       from: userEmail,
//       subject,
//       html: body,
//     });

//     // Track email sent
//     await do_ma_query(
//       "INSERT INTO email_tracking (email_id, event_type, event_data) VALUES (?, ?, ?)",
//       [emailId, "sent", JSON.stringify({ 
//         timestamp: new Date(),
//         type: 'stock_request',
//         productName: value.productName,
//         quantity: value.quantity
//       })]
//     );

//     // Notify recipient
//     await createNotificationByEmailService({
//   userEmail: value.to,
//   emailId,
//   type: "stock_request",
//   title: "New Stock Request",
//   message: `${userName} has requested ${value.quantity} units of ${value.productName}`,
// });


//     res.status(201).json({
//       success: true,
//       message: "Stock request sent successfully",
//       data: { emailId },
//       timestamp: DateTime.local().toISO(),
//     });
//   } catch (error) {
//     console.error("Error sending stock request:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error sending stock request",
//       error: error.message,
//     });
//   }
// };


export const sendStockRequest = async (req, res) => {
  try {
    const stockRequestSchema = Joi.object({
      to: Joi.string().email().required(),
      productName: Joi.string().required(),
      quantity: Joi.number().integer().min(1).required(),
      urgency: Joi.string().valid('low', 'medium', 'high').default('medium'),
      notes: Joi.string().allow(''),
      enableFollowUp: Joi.boolean().default(true),
      followUpDays: Joi.number().integer().min(1).max(30).default(2),
      enableEscalation: Joi.boolean().default(false),
      escalationEmail: Joi.string().email().allow('', null),
      escalationDays: Joi.number().integer().min(1).max(30).default(3),
    });

    const { error, value } = stockRequestSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const userId = req.user.id;
    const userEmail = req.user.email;
    const userName = req.user.username || userEmail;

    const subject = `Stock Request: ${value.productName} (${value.quantity} units)`;
    const body = `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #333;">Stock Request</h2>
        
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p style="margin: 5px 0;"><strong>From:</strong> ${userName} (${userEmail})</p>
          <p style="margin: 5px 0;"><strong>Product:</strong> ${value.productName}</p>
          <p style="margin: 5px 0;"><strong>Quantity:</strong> ${value.quantity}</p>
          <p style="margin: 5px 0;"><strong>Urgency:</strong> <span style="color: ${
            value.urgency === 'high' ? 'red' : value.urgency === 'medium' ? 'orange' : 'green'
          }; font-weight: bold;">${value.urgency.toUpperCase()}</span></p>
        </div>
        
        ${value.notes ? `
          <div style="margin: 15px 0;">
            <p><strong>Additional Notes:</strong></p>
            <p style="background: #fff; padding: 10px; border-left: 3px solid #5bc0de;">${value.notes}</p>
          </div>
        ` : ''}
        
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;"/>
        
        <div style="background: #d9edf7; padding: 10px; border-radius: 5px;">
          <p style="margin: 0; font-size: 14px;">
            <strong>⚠️ Action Required:</strong> Please review and respond to this request. 
            When approving, provide a delivery deadline.
          </p>
        </div>
        
        ${value.enableFollowUp ? `
          <p style="font-size: 12px; color: #777; margin-top: 10px;">
            📅 A follow-up reminder will be sent after ${value.followUpDays} days if no response is received.
          </p>
        ` : ''}
        
        ${value.enableEscalation ? `
          <p style="font-size: 12px; color: #777; margin-top: 5px;">
            🔔 This request will be escalated to ${value.escalationEmail} after ${value.escalationDays} days without response.
          </p>
        ` : ''}
      </div>
    `;

    // ✅ FIX: Insert email WITHOUT deadline_date (deadline is set when approving)
    const result = await do_ma_query(
      `INSERT INTO emails (
        sender_id, sender_email, recipient_email, subject, body, 
        status, template_type,
        follow_up_scheduled, follow_up_days,
        escalation_enabled, escalation_email, escalation_days
      ) VALUES (?, ?, ?, ?, ?, 'sent', 'stock_request', ?, ?, ?, ?, ?)`,
      [
        userId, userEmail, value.to, subject, body,
        value.enableFollowUp, value.followUpDays,
        value.enableEscalation, value.escalationEmail || null, value.escalationDays
      ]
    );

    const emailId = result.insertId;

    // Send actual email
    await sendEmail({
      to: value.to,
      from: userEmail,
      subject,
      html: body,
    });

    // Track email sent
    await do_ma_query(
      "INSERT INTO email_tracking (email_id, event_type, event_data) VALUES (?, ?, ?)",
      [emailId, "sent", JSON.stringify({ 
        timestamp: new Date(),
        type: 'stock_request',
        productName: value.productName,
        quantity: value.quantity
      })]
    );

    // Notify recipient
    await createNotificationByEmailService({
      userEmail: value.to,
      emailId,
      type: "stock_request",
      title: "New Stock Request",
      message: `${userName} has requested ${value.quantity} units of ${value.productName}`,
    });

    res.status(201).json({
      success: true,
      message: "Stock request sent successfully",
      data: { 
        emailId,
        followUpScheduled: value.enableFollowUp,
        escalationEnabled: value.enableEscalation
      },
      timestamp: DateTime.local().toISO(),
    });
  } catch (error) {
    console.error("Error sending stock request:", error);
    res.status(500).json({
      success: false,
      message: "Error sending stock request",
      error: error.message,
    });
  }
};


// export const respondToStockRequest = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { action, notes } = req.body; // action: 'approve' or 'reject'
//     const userId = req.user.id;
//     const userEmail = req.user.email;
//     const userName = req.user.username || userEmail;

//     if (!['approve', 'reject'].includes(action)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid action. Use 'approve' or 'reject'",
//       });
//     }

//     // Get original request
//     const originalEmails = await do_ma_query(
//       "SELECT * FROM emails WHERE id = ? AND recipient_email = ?",
//       [id, userEmail]
//     );

//     if (originalEmails.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "Stock request not found or access denied",
//       });
//     }

//     const originalEmail = originalEmails[0];

//     // Create response email
//     const subject = `Re: ${originalEmail.subject} - ${action.toUpperCase()}`;
//     const body = `
//       <div style="font-family: Arial, sans-serif; padding: 20px;">
//         <h2>Stock Request ${action === 'approve' ? 'Approved' : 'Rejected'}</h2>
//         <p><strong>Responder:</strong> ${userName} (${userEmail})</p>
//         <p><strong>Status:</strong> <span style="color: ${action === 'approve' ? 'green' : 'red'}">
//           ${action.toUpperCase()}</span></p>
//         ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
//         <hr/>
//         <h3>Original Request:</h3>
//         ${originalEmail.body}
//       </div>
//     `;

//     // Insert response email
//     const result = await do_ma_query(
//       `INSERT INTO emails (
//         sender_id, sender_email, recipient_email, subject, body, 
//         status, template_type
//       ) VALUES (?, ?, ?, ?, ?, 'sent', 'stock_response')`,
//       [userId, userEmail, originalEmail.sender_email, subject, body]
//     );

//     const responseEmailId = result.insertId;

//     // Send email
//     await sendEmail({
//       to: originalEmail.sender_email,
//       from: userEmail,
//       subject,
//       html: body,
//     });

//     // Track response
//     await do_ma_query(
//       "INSERT INTO email_tracking (email_id, event_type, event_data) VALUES (?, ?, ?)",
//       [responseEmailId, "sent", JSON.stringify({ 
//         timestamp: new Date(),
//         type: 'stock_response',
//         action,
//         originalEmailId: id
//       })]
//     );

//     // Notify original sender
//     await createNotificationByEmail({
//       userEmail: originalEmail.sender_email,
//       emailId: responseEmailId,
//       type: "stock_response",
//       title: `Stock Request ${action === 'approve' ? 'Approved' : 'Rejected'}`,
//       message: `${userName} has ${action}d your stock request`,
//     });

//     res.status(200).json({
//       success: true,
//       message: `Stock request ${action}d successfully`,
//       data: { responseEmailId },
//       timestamp: DateTime.local().toISO(),
//     });
//   } catch (error) {
//     console.error("Error responding to stock request:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error responding to stock request",
//       error: error.message,
//     });
//   }
// };



export const respondToStockRequest = async (req, res) => {
  try {
    console.log("REQ.USER:", req.user);
    console.log("REQ.PARAMS:", req.params);
    console.log("REQ.BODY:", req.body);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const { id } = req.params;
    const { action, deadlineDays, notes } = req.body; // deadlineDays is required for approval
    const userId = req.user.id;
    const userEmail = req.user.email;
    const userName = req.user.username || userEmail;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Invalid action. Use 'approve' or 'reject'",
      });
    }

    // Validate deadline for approval
    if (action === 'approve' && (!deadlineDays || deadlineDays < 1)) {
      return res.status(400).json({
        success: false,
        message: "Deadline in days is required when approving stock request",
      });
    }

    // Get original request
    const originalEmails = await do_ma_query(
      "SELECT * FROM emails WHERE id = ? AND recipient_email = ?",
      [id, userEmail]
    );
    console.log("ORIGINAL EMAILS:", originalEmails);

    if (!originalEmails || originalEmails.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Stock request not found or access denied",
      });
    }

    const originalEmail = originalEmails[0];

    // ✅ FIX: Calculate deadline date in MySQL format if approved
    let deadlineDate = null;
    let deadlineText = '';
    if (action === 'approve') {
      // Convert to MySQL datetime format: 'YYYY-MM-DD HH:MM:SS'
      deadlineDate = DateTime.local()
        .plus({ days: parseInt(deadlineDays) })
        .toFormat('yyyy-MM-dd HH:mm:ss'); // ✅ MySQL format
      
      deadlineText = `
        <div style="background: #dff0d8; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #5cb85c;">
          <p style="margin: 0;"><strong>📦 Delivery Deadline:</strong> 
            <span style="color: #5cb85c; font-size: 16px; font-weight: bold;">
              ${deadlineDays} days (by ${DateTime.local().plus({ days: parseInt(deadlineDays) }).toLocaleString(DateTime.DATE_MED)})
            </span>
          </p>
        </div>
      `;
    }

    // Create response email
    const subject = `Re: ${originalEmail.subject} - ${action.toUpperCase()}`;
    const body = `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: ${action === 'approve' ? '#5cb85c' : '#d9534f'};">
          Stock Request ${action === 'approve' ? 'Approved ✓' : 'Rejected ✗'}
        </h2>
        
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p style="margin: 5px 0;"><strong>Responder:</strong> ${userName} (${userEmail})</p>
          <p style="margin: 5px 0;"><strong>Status:</strong> 
            <span style="color: ${action === 'approve' ? 'green' : 'red'}; font-weight: bold;">
              ${action.toUpperCase()}
            </span>
          </p>
          <p style="margin: 5px 0;"><strong>Response Date:</strong> ${DateTime.local().toLocaleString(DateTime.DATETIME_MED)}</p>
        </div>
        
        ${action === 'approve' ? deadlineText : ''}
        
        ${notes ? `
          <div style="margin: 15px 0;">
            <p><strong>${action === 'approve' ? 'Approval Notes:' : 'Rejection Reason:'}</strong></p>
            <p style="background: #fff; padding: 10px; border-left: 3px solid ${action === 'approve' ? '#5cb85c' : '#d9534f'};">
              ${notes}
            </p>
          </div>
        ` : ''}
        
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;"/>
        
        <h3 style="color: #666;">Original Request:</h3>
        <div style="background: #f9f9f9; padding: 10px; border-radius: 5px;">
          ${originalEmail.body}
        </div>
      </div>
    `;

    // Insert response email with deadline if approved
    const result = await do_ma_query(
      `INSERT INTO emails (
        sender_id, sender_email, recipient_email, subject, body, 
        status, template_type, deadline_date
      ) VALUES (?, ?, ?, ?, ?, 'sent', 'stock_response', ?)`,
      [userId, userEmail, originalEmail.sender_email, subject, body, deadlineDate]
    );

    console.log("INSERT RESULT:", result);
    const responseEmailId = result.insertId;

    // Update original email to mark as responded
    await do_ma_query(
      "UPDATE emails SET is_read = TRUE WHERE id = ?",
      [id]
    );

    // Send email
    try {
      await sendEmail({
        to: originalEmail.sender_email,
        from: userEmail,
        subject,
        html: body,
      });
      console.log("Email sent successfully");
    } catch (emailErr) {
      console.error("Error sending email:", emailErr);
    }

    // Track response
    try {
      await do_ma_query(
        "INSERT INTO email_tracking (email_id, event_type, event_data) VALUES (?, ?, ?)",
        [responseEmailId, "sent", JSON.stringify({ 
          timestamp: new Date(),
          type: 'stock_response',
          action,
          originalEmailId: id,
          deadlineDays: action === 'approve' ? deadlineDays : null,
          deadlineDate: deadlineDate
        })]
      );
      console.log("Email tracking inserted");
    } catch (trackingErr) {
      console.error("Error inserting tracking:", trackingErr);
    }

    // Notify original sender
    try {
      await createNotificationByEmailService({
        userEmail: originalEmail.sender_email,
        emailId: responseEmailId,
        type: "stock_response",
        title: `Stock Request ${action === 'approve' ? 'Approved' : 'Rejected'}`,
        message: action === 'approve' 
          ? `${userName} has approved your stock request with ${deadlineDays} days delivery deadline`
          : `${userName} has rejected your stock request`,
      });
      console.log("Notification created");
    } catch (notifErr) {
      console.error("Error creating notification:", notifErr);
    }

    res.status(200).json({
      success: true,
      message: `Stock request ${action}d successfully`,
      data: { 
        responseEmailId,
        deadlineDate: action === 'approve' ? deadlineDate : null,
        deadlineDays: action === 'approve' ? deadlineDays : null
      },
      timestamp: DateTime.local().toISO(),
    });
  } catch (error) {
    console.error("Error responding to stock request:", error);
    res.status(500).json({
      success: false,
      message: "Error responding to stock request",
      error: error.message,
    });
  }
};



//nNotification Controller



// GET notifications for current user
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20 } = req.query;

    const notifications = await getNotificationsService(userId, parseInt(limit));

    res.status(200).json({
      success: true,
      data: notifications,
      timestamp: DateTime.local().toISO(),
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching notifications",
      error: error.message,
      timestamp: DateTime.local().toISO(),
    });
  }
};

// POST create notification
export const createNotification = async (req, res) => {
  try {
    const { userId, emailId, type, title, message } = req.body;

    await createNotificationService({
      userId,
      emailId,
      type,
      title,
      message,
    });

    res.status(201).json({
      success: true,
      message: "Notification created successfully",
      timestamp: DateTime.local().toISO(),
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({
      success: false,
      message: "Error creating notification",
      error: error.message,
      timestamp: DateTime.local().toISO(),
    });
  }
};

// POST create notification by email
export const createNotificationByEmail = async (req, res) => {
  try {
    const { userEmail, emailId, type, title, message } = req.body;

    await createNotificationByEmailService({
      userEmail,
      emailId,
      type,
      title,
      message,
    });

    res.status(201).json({
      success: true,
      message: "Notification created successfully",
      timestamp: DateTime.local().toISO(),
    });
  } catch (error) {
    console.error("Error creating notification by email:", error);
    res.status(500).json({
      success: false,
      message: "Error creating notification",
      error: error.message,
      timestamp: DateTime.local().toISO(),
    });
  }
};

// PUT mark notification as read
export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await markAsReadService(id, userId);

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      timestamp: DateTime.local().toISO(),
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({
      success: false,
      message: "Error updating notification",
    });
  }
};


// PUT mark all notifications as read
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await markAllAsReadService(userId);

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      timestamp: DateTime.local().toISO(),
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({
      success: false,
      message: "Error updating notifications",
      error: error.message,
      timestamp: DateTime.local().toISO(),
    });
  }
};

// DELETE notification
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.execute(
      'DELETE FROM notifications WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (result[0].affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Notification not found or access denied",
        timestamp: DateTime.local().toISO(),
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
      timestamp: DateTime.local().toISO(),
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting notification",
      error: error.message,
      timestamp: DateTime.local().toISO(),
    });
  }
};
