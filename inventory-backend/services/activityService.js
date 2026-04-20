import { do_ma_query } from '../db.js';

/**
 * Log an activity to the activity_log table
 */
export const logActivity = async (activityData) => {
  try {
    const {
      activity_type,
      action,
      entity_id,
      entity_name,
      description,
      user_id,
      user_name,
      warehouse_id = null,
      warehouse_name = null,
      metadata = null
    } = activityData;

    // Validation
    if (!activity_type || !action || !user_id || !description) {
      console.error(' Missing required fields for activity log:', {
        activity_type,
        action,
        user_id,
        description
      });
      return false;
    }

    // Lookup activity_type_id
    const typeRow = await do_ma_query(
      "SELECT id FROM activity_types WHERE `key` = ? LIMIT 1",
      [activity_type]
    );

    if (!typeRow || typeRow.length === 0) {
      console.error(`Unknown activity type: ${activity_type}`);
      return false;
    }

    const activity_type_id = typeRow[0].id;

    // Insert into activity_log
    const query = `
      INSERT INTO activity_log 
        (activity_type_id, action, entity_id, entity_name, description, 
         user_id, user_name, warehouse_id, warehouse_name, metadata, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    await do_ma_query(query, [
      activity_type_id,
      action,
      entity_id,
      entity_name,
      description,
      user_id,
      user_name,
      warehouse_id,
      warehouse_name,
      metadata ? JSON.stringify(metadata) : null
    ]);

    // console.log(`Activity logged: ${activity_type} ${action} by ${user_name}`);
    return true;

  } catch (error) {
    console.error('Error logging activity:', error);
    return false;
  }
};

/**
 * GET recent activities with filters
 */
export const getRecentActivities = async (filters = {}) => {
  try {
    const {
      warehouse_id = null,
      activity_type = null,
      limit = 15
    } = filters;

    let whereConditions = [];
    let queryParams = [];

    // Warehouse filter
    if (warehouse_id) {
      whereConditions.push('(al.warehouse_id = ? OR al.warehouse_id IS NULL)');
      queryParams.push(warehouse_id);
    }

    // Activity type filter
    if (activity_type) {
      whereConditions.push('at.`key` = ?');
      queryParams.push(activity_type);
    }

    const whereClause = whereConditions.length > 0
      ? 'WHERE ' + whereConditions.join(' AND ')
      : '';

    const query = `
      SELECT 
        al.id,
        at.key AS activity_type,
        at.label AS activity_label,
        al.action,
        al.entity_id,
        al.entity_name,
        al.description,
        al.user_id,
        al.user_name,
        al.warehouse_id,
        al.warehouse_name,
        al.metadata,
        al.created_at
      FROM activity_log al
      JOIN activity_types at ON al.activity_type_id = at.id
      ${whereClause}
      ORDER BY al.created_at DESC
      LIMIT ?
    `;

    queryParams.push(parseInt(limit));

    const activities = await do_ma_query(query, queryParams);
    
    // console.log('Fetched activities:', activities.length);
    if (activities.length > 0) {
      console.log('First activity:', {
        user_name: activities[0].user_name,
        action: activities[0].action,
        entity_name: activities[0].entity_name
      });
    }
    
    return activities;

  } catch (error) {
    console.error('Error fetching activities:', error);
    return [];
  }
};

/**
 * Get activity statistics
 */
export const getActivityStats = async (warehouse_id = null) => {
  try {
    let whereClause = warehouse_id ? 'WHERE al.warehouse_id = ?' : '';
    let queryParams = warehouse_id ? [warehouse_id] : [];

    const query = `
      SELECT 
        at.key AS activity_type,
        at.label AS activity_label,
        COUNT(*) AS count
      FROM activity_log al
      JOIN activity_types at ON al.activity_type_id = at.id
      ${whereClause}
      ${whereClause ? 'AND' : 'WHERE'} al.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      GROUP BY at.key, at.label
      ORDER BY count DESC
    `;

    const stats = await do_ma_query(query, queryParams);
    return stats;

  } catch (error) {
    console.error('Error fetching activity stats:', error);
    return [];
  }
};

export default {
  logActivity,
  getRecentActivities,
  getActivityStats
};