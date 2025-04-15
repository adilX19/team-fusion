const database = require('../database/connection');
const jwt = require('jsonwebtoken');
const express = require('express');
const dotenv = require('dotenv');

const verifyToken = require('../middlewares/JWT_middlewares')

const createNotification = require('../utils/helper_functions');

dotenv.config();

const router = express.Router();
const secretKey = process.env.JWT_SECRET;

// 1. Get all sprints from a project
router.get('/projects/:project_id/', verifyToken, (request, response) => {
  const { project_id } = request.params;
  const query = `SELECT * FROM Sprints WHERE project_id = ?`;

  database.all(query, [project_id], (err, sprints) => {
    if (err) return response.status(500).json({ error: err.message });
    response.json(sprints);
  });
});

// 2. Create a new sprint in a project
router.post('/projects/:project_id/create', verifyToken, (request, response) => {
  const { project_id } = request.params;
  const { sprint_name, start_date, end_date, status, created_by } = request.body;

  const query = `
    INSERT INTO Sprints (sprint_name, project_id, start_date, end_date, status, created_by)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  database.run(
    query,
    [
      sprint_name,
      project_id,
      start_date,
      end_date,
      status || 'PLANNED',
      created_by
    ],
    function (err) {
      if (err) return response.status(400).json({ error: err.message });
      response.status(201).json({ sprint_id: this.lastID });
    }
  );
});


// 3. Get a specific sprint details
router.get('/:sprint_id', verifyToken, (request, response) => {
  const { sprint_id } = request.params;

  database.get('SELECT * FROM Sprints WHERE sprint_id = ?', [sprint_id], (err, sprint) => {
    if (err) return response.status(500).json({ error: err.message });
    if (!sprint) return response.status(404).json({ error: 'Sprint not found' });
    response.json(sprint);
  });
});

// 4. Update a sprint
router.put('/:sprint_id/update', verifyToken, (request, response) => {
  const { sprint_id } = request.params;
  const { sprint_name, start_date, end_date, status } = request.body;

  const query = `
    UPDATE Sprints
    SET sprint_name = ?, start_date = ?, end_date = ?, status = ?
    WHERE sprint_id = ?
  `;

  database.run(
    query,
    [sprint_name, start_date, end_date, status, sprint_id],
    function (err) {
      if (err) return response.status(400).json({ error: err.message });
      if (this.changes === 0) return response.status(404).json({ error: 'Sprint not found' });
      response.json({ message: 'Sprint updated successfully' });
    }
  );
});

// 5. Update sprint Status
router.patch('/:sprint_id/status', verifyToken, (request, response) => {
  const { sprint_id } = request.params;
  const { status, user_ids = [] } = request.body;

  const query = `
    UPDATE Sprints SET status = ? WHERE sprint_id = ?
  `;

  database.run(query, [status, sprint_id], function (err) {
    if (err) return response.status(500).json({ error: err.message });

    if (status === 'IN_PROGRESS') {
      // 🔔 Notify all users (or specific users passed in req.body)
      user_ids.forEach(user_id => {
        createNotification({
          user_id,
          message: `Sprint ${sprint_id} has started.`,
          notification_type: 'SPRINT_STARTED',
          related_entity_type: 'SPRINT',
          related_entity_id: sprint_id,
        });
      });
    }

    response.json({ message: 'Sprint status updated and notifications sent (if applicable)' });
  });
});


// 6. Delete a sprint
router.delete('/:sprint_id/delete', verifyToken, (request, response) => {
  const { sprint_id } = request.params;

  database.run('DELETE FROM Sprints WHERE sprint_id = ?', [sprint_id], function (err) {
    if (err) return response.status(500).json({ error: err.message });
    if (this.changes === 0) return response.status(404).json({ error: 'Sprint not found' });
    response.json({ message: 'Sprint deleted successfully' });
  });
});


module.exports = router;