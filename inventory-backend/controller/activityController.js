import { DateTime } from "luxon";
import { getRecentActivities, getActivityStats } from '../services/activityService.js';


export const getActivities = async (req, res) => {
  try {
    const { warehouseFilter } = req;
    const {
      activity_type = null,
      limit = 15,
      page = 1
    } = req.query;

    const filters = {
      warehouse_id: warehouseFilter || null,
      activity_type: activity_type || null,
      limit: parseInt(limit),
      page: parseInt(page)
    };

    const activities = await getRecentActivities(filters);

    res.status(200).json({
      success: true,
      data: activities,
      timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
    });

  } catch (error) {
    console.error('Error in getActivities controller:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching activities',
      error: error.message,
      timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
    });
  }
};


export const getActivitiesStats = async (req, res) => {
  try {
    const { warehouseFilter } = req;

    const stats = await getActivityStats(warehouseFilter);

    res.status(200).json({
      success: true,
      data: stats,
      timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
    });

  } catch (error) {
    console.error('Error in getActivitiesStats controller:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching activity statistics',
      error: error.message,
      timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
    });
  }
};

export default {
  getActivities,
  getActivitiesStats
};