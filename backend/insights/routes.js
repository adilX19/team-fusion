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
      SELECT notification_id AS id, message, created_at 
      FROM Notifications 
      ORDER BY created_at DESC 
      LIMIT 5
    `;

    const taskStatusSummary = await queryPromise(taskStatusQuery);
    const sprintStatusSummary = await queryPromise(sprintStatusQuery);
    const projectStatusSummary = await queryPromise(projectStatusQuery);
    const totalStatsResult = await queryPromise(totalStatsQuery);
    const recentActivities = await queryPromise(recentActivitiesQuery);

    response.status(200).json({
      taskStatusSummary,
      sprintStatusSummary,
      projectStatusSummary,
      totalStats: totalStatsResult[0],
      recentActivities,
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
