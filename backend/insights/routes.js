const database = require("../database/connection");
const jwt = require("jsonwebtoken");
const express = require("express");
const dotenv = require("dotenv");
const verifyToken = require("../middlewares/JWT_middlewares");

dotenv.config();

const router = express.Router();

router.get("/dashboard", verifyToken, async (request, response) => {
  try {
    const taskStatusQuery = `SELECT status, COUNT(*) as count FROM Tasks GROUP BY status`;
    const sprintStatusQuery = `SELECT status, COUNT(*) as count FROM Sprints GROUP BY status`;
    const projectStatusQuery = `SELECT status, COUNT(*) as count FROM Projects GROUP BY status`;
    const totalStatsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM Projects) AS totalProjects,
        (SELECT COUNT(*) FROM Sprints) AS totalSprints,
        (SELECT COUNT(*) FROM Tasks) AS totalTasks,
        (SELECT COUNT(*) FROM Users) AS totalUsers
    `;
    const recentActivitiesQuery = `
      SELECT notification_id AS id, message, created_at, related_entity_type, related_entity_id
      FROM Notifications 
      ORDER BY created_at DESC 
      LIMIT 3
    `;

    const taskStatusSummary = await queryPromise(taskStatusQuery);
    const sprintStatusSummary = await queryPromise(sprintStatusQuery);
    const projectStatusSummary = await queryPromise(projectStatusQuery);
    const totalStatsResult = await queryPromise(totalStatsQuery);
    const recentActivities = await queryPromise(recentActivitiesQuery);

    const enrichedActivities = await Promise.all(
        recentActivities.map(async (activity) => {
          if (activity.related_entity_type === "task") {
            const result = await queryPromise(
                `SELECT task_name FROM Tasks WHERE task_id = ${activity.related_entity_id}`
            );
            return {
              ...activity,
              task_text: result[0]?.task_name || null,
            };
          }
          return activity;
        })
    );

    response.status(200).json({
      taskStatusSummary,
      sprintStatusSummary,
      projectStatusSummary,
      totalStats: totalStatsResult[0],
      enrichedActivities,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    response.status(500).json({ error: "Internal Server Error" });
  }
});

function queryPromise(sql) {
  return new Promise((resolve, reject) => {
    database.all(sql, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
}

module.exports = router;
