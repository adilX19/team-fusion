const database = require('../database/connection');
const jwt = require('jsonwebtoken');
const express = require('express');
const dotenv = require('dotenv');

const verifyToken = require('../middlewares/JWT_middlewares')

dotenv.config();

const router = express.Router();
const secretKey = process.env.JWT_SECRET;

// 1. All projects
router.get('/all', verifyToken, (request, response) => {
  database.all('SELECT * FROM Projects', (err, rows) => {
    if (err) return response.status(500).json({ error: err.message });
    response.json(rows);
  });
});

// 2. Projects by Organizations
router.get('/organization/:org_id', verifyToken, (request, response) => {
  const orgId = request.params.org_id;
  database.all('SELECT * FROM Projects WHERE org_id = ?', [orgId], (err, projects) => {
    if (err) return response.status(500).json({ error: err.message });
    response.json(projects);
  });
});

// 3. Create a new project
router.post('/add-new', verifyToken, (request, response) => {
  const { project_name, description, org_id, created_by, status, deadline } = request.body;
  const query = `
    INSERT INTO Projects (project_name, description, org_id, created_by, status, deadline)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  database.run(
    query,
    [project_name, description, org_id, created_by, status || 'PLANNED', deadline || null],
    function (err) {
      if (err) return response.status(400).json({ error: err.message });
      response.status(201).json({ project_id: this.lastID });
    }
  );
});

// 4. Get specific project details
router.get('/:project_id', verifyToken, (request, response) => {
  const projectId = request.params.project_id;
  database.get('SELECT * FROM Projects WHERE project_id = ?', [projectId], (err, project) => {
    if (err) return response.status(500).json({ error: err.message });
    if (!project) return response.status(404).json({ error: 'Project not found' });
    response.json(project);
  });
});

// 5. Update a project
router.put('/:project_id/update', verifyToken, (request, response) => {
  const projectId = request.params.project_id;
  const { project_name, description, status, deadline } = request.body;

  const query = `
    UPDATE Projects
    SET project_name = ?, description = ?, status = ?, deadline = ?
    WHERE project_id = ?
  `;
  database.run(
    query,
    [project_name, description, status, deadline, projectId],
    function (err) {
      if (err) return response.status(400).json({ error: err.message });
      if (this.changes === 0) return response.status(404).json({ error: 'Project not found' });
      response.json({ message: 'Project updated successfully' });
    }
  );
});

// 6. Delete a project
router.delete('/:project_id/delete', verifyToken, (request, response) => {
  const projectId = request.params.project_id;
  database.run('DELETE FROM Projects WHERE project_id = ?', [projectId], function (err) {
    if (err) return response.status(500).json({ error: err.message });
    if (this.changes === 0) return response.status(404).json({ error: 'Project not found' });
    response.json({ message: 'Project deleted successfully' });
  });
});

module.exports = router;