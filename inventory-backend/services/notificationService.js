// import pool from "../db.js";

// // ------------------ Create Notification ------------------
// export const createNotification = async ({ userId, emailId, type, title, message }) => {
//   try {
//     await pool.execute(
//       `INSERT INTO notifications (user_id, email_id, type, title, message) 
//        VALUES (?, ?, ?, ?, ?)`,
//       [userId, emailId, type, title, message]
//     );

//     console.log(`Notification created for user ${userId}`);
//   } catch (error) {
//     console.error('Error creating notification:', error);
//     throw error;
//   }
// };

// // ------------------ Create Notification by Email ------------------
// export const createNotificationByEmail = async ({ userEmail, emailId, type, title, message }) => {
//   try {
//     const [users] = await pool.execute(
//       'SELECT id FROM users WHERE email = ?',
//       [userEmail]
//     );

//     if (users.length === 0) {
//       console.log(`User not found for email: ${userEmail}`);
//       return;
//     }

//     await createNotification({
//       userId: users[0].id,
//       emailId,
//       type,
//       title,
//       message
//     });
//   } catch (error) {
//     console.error('Error creating notification by email:', error);
//     throw error;
//   }
// };

// // ------------------ Get Notifications ------------------
// export const getNotifications = async (userId, limit = 20) => {
//   try {
//     const [notifications] = await pool.execute(
//       `SELECT n.*, e.subject as email_subject 
//        FROM notifications n
//        LEFT JOIN emails e ON n.email_id = e.id
//        WHERE n.user_id = ?
//        ORDER BY n.created_at DESC
//        LIMIT ?`,
//       [userId, limit]
//     );

//     return notifications;
//   } catch (error) {
//     console.error('Error fetching notifications:', error);
//     throw error;
//   }
// };

// // ------------------ Mark Notification as Read ------------------
// export const markAsRead = async (notificationId) => {
//   try {
//     await pool.execute(
//       'UPDATE notifications SET is_read = TRUE WHERE id = ?',
//       [notificationId]
//     );
//   } catch (error) {
//     console.error('Error marking notification as read:', error);
//     throw error;
//   }
// };

// // ------------------ Mark All Notifications as Read ------------------
// export const markAllAsRead = async (userId) => {
//   try {
//     await pool.execute(
//       'UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE',
//       [userId]
//     );
//   } catch (error) {
//     console.error('Error marking all notifications as read:', error);
//     throw error;
//   }
// };

// // ------------------ Cleanup Old Notifications ------------------
// export const cleanupOldNotifications = async (daysOld = 30) => {
//   try {
//     await pool.execute(
//       'DELETE FROM notifications WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)',
//       [daysOld]
//     );

//     console.log(`Cleaned up notifications older than ${daysOld} days`);
//   } catch (error) {
//     console.error('Error cleaning up notifications:', error);
//     throw error;
//   }
// };

import pool from "../db.js";

// ------------------ Create Notification ------------------
export const createNotification = async ({ userId, emailId, type, title, message }) => {
  try {
    await pool.execute(
      `INSERT INTO notifications (user_id, email_id, type, title, message) 
       VALUES (?, ?, ?, ?, ?)`,
      [userId, emailId, type, title, message]
    );

    // console.log(`Notification created for user ${userId}`);
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// ------------------ Create Notification by Email ------------------
export const createNotificationByEmail = async ({ userEmail, emailId, type, title, message }) => {
  try {
    const [users] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [userEmail]
    );

    if (users.length === 0) {
      // console.log(`User not found for email: ${userEmail}`);
      return;
    }

    await createNotification({
      userId: users[0].id,
      emailId,
      type,
      title,
      message
    });
  } catch (error) {
    console.error('Error creating notification by email:', error);
    throw error;
  }
};

// ------------------ Get Notifications ------------------
export const getNotifications = async (userId, limit = 20) => {
  try {
    const [notifications] = await pool.execute(
      `SELECT n.*, e.subject as email_subject 
       FROM notifications n
       LEFT JOIN emails e ON n.email_id = e.id
       WHERE n.user_id = ?
       ORDER BY n.created_at DESC
       LIMIT ?`,
      [userId, limit]
    );

    return notifications;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

// ------------------ Mark Notification as Read ------------------
export const markAsRead = async (notificationId) => {
  try {
    await pool.execute(
      'UPDATE notifications SET is_read = TRUE WHERE id = ?',
      [notificationId]
    );
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// ------------------ Mark All Notifications as Read ------------------
export const markAllAsRead = async (userId) => {
  try {
    await pool.execute(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE',
      [userId]
    );
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// ------------------ Cleanup Old Notifications ------------------
export const cleanupOldNotifications = async (daysOld = 30) => {
  try {
    await pool.execute(
      'DELETE FROM notifications WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)',
      [daysOld]
    );

    // console.log(`Cleaned up notifications older than ${daysOld} days`);
  } catch (error) {
    console.error('Error cleaning up notifications:', error);
    throw error;
  }
};