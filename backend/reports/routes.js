const database = require('../database/connection');
const jwt = require('jsonwebtoken');
const express = require('express');
const dotenv = require('dotenv');

const verifyToken = require('../middlewares/JWT_middlewares')

dotenv.config();

const router = express.Router();
const secretKey = process.env.JWT_SECRET;

// 1. Task Completion Rate by Sprint
router.get("/task-completion", verifyToken, async (request, response) => {
    const { sprint_id } = request.query;
    try {
        const total = await database.get(
            `SELECT COUNT(*) as total FROM Tasks WHERE sprint_id = ?`,
            [sprint_id]
        );
        const completed = await database.get(
            `SELECT COUNT(*) as completed FROM Tasks WHERE sprint_id = ? AND status = 'COMPLETED'`,
            [sprint_id]
        );
        const completion_rate = total.total > 0 ? (completed.completed / total.total) * 100 : 0;
        response.json({ sprint_id, total: total.total, completed: completed.completed, completion_rate });
    } catch (err) {
        response.status(500).json({ error: err.message });
    }
});

// 2. Team Performance Metrics
router.get("/team-performance", verifyToken, async (request, response) => {
    const { team_id } = request.query;
    try {
        const members = await database.all(
            `SELECT user_id FROM TeamMembers WHERE team_id = ?`,
            [team_id]
        );
        const userIds = members.map((m) => m.user_id);
        const results = await Promise.all(
            userIds.map(async (user_id) => {
                const tasks = await database.get(
                    `SELECT COUNT(*) as total FROM Assignments WHERE assigned_to_user = ?`,
                    [user_id]
                );
                const completed = await database.get(
                    `SELECT COUNT(*) as completed FROM Tasks WHERE task_id IN (SELECT task_id FROM Assignments WHERE assigned_to_user = ?) AND status = 'COMPLETED'`,
                    [user_id]
                );
                return {
                    user_id,
                    total_tasks: tasks.total,
                    completed_tasks: completed.completed,
                    completion_rate: tasks.total > 0 ? (completed.completed / tasks.total) * 100 : 0,
                };
            })
        );
        response.json({ team_id, performance: results });
    } catch (err) {
        response.status(500).json({ error: err.message });
    }
});

// 3. Sprint Burndown
router.get("/sprint-burndown", verifyToken, async (request, response) => {
    const { sprint_id } = request.query;
    try {
        const dates = await database.all(
            `SELECT date(created_at) as day, COUNT(*) as remaining_tasks 
       FROM Tasks WHERE sprint_id = ? AND status != 'COMPLETED'
       GROUP BY day ORDER BY day ASC`,
            [sprint_id]
        );
        response.json({ sprint_id, burndown: dates });
    } catch (err) {
        response.status(500).json({ error: err.message });
    }
});

// 4. Export Reports (pseudo file creation for demo)
router.post("/export", verifyToken, async (request, response) => {
    const { report_type, sprint_id, format } = request.body;
    try {
        // Placeholder logic - real export will use pdfkit/csv-stringify/etc.
        const filename = `report_${report_type}_${sprint_id}.${format.toLowerCase()}`;
        const file_url = `/exports/${filename}`;
        response.json({ message: "Export complete", download_url: file_url });
    } catch (err) {
        response.status(500).json({ error: err.message });
    }
});

module.exports = router;