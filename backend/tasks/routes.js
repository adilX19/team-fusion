const database = require("../database/connection");
const jwt = require("jsonwebtoken");
const express = require("express");
const dotenv = require("dotenv");

const verifyToken = require("../middlewares/JWT_middlewares");

dotenv.config();

const router = express.Router();
const secretKey = process.env.JWT_SECRET;

// TASK ENDPOINTS

// 1. List all tasks in a sprint
router.get("/list/sprints/:sprint_id", verifyToken, (request, response) => {
  const { sprint_id } = request.params;
  database.all(
    `SELECT * FROM Tasks WHERE sprint_id = ?`,
    [sprint_id],
    (err, tasks) => {
      if (err) return response.status(500).json({ error: err.message });
      response.json(tasks);
    }
  );
});

// 2. get a specific task details
router.get("/:task_id", verifyToken, (request, response) => {
  const { task_id } = request.params;
  database.get(
    `SELECT * FROM Tasks WHERE task_id = ?`,
    [task_id],
    (err, task) => {
      if (err) return response.status(500).json({ error: err.message });
      if (!task) return response.status(404).json({ error: "Task not found" });
      response.json(task);
    }
  );
});

// 3. Create a new task
router.post("/sprints/:sprint_id/create", verifyToken, (request, response) => {
  const { sprint_id } = request.params;
  const { task_name, created_by, status } = request.body;
  const query = `
    INSERT INTO Tasks (task_name, sprint_id, created_by, status)
    VALUES (?, ?, ?, ?)
  `;
  database.run(
    query,
    [task_name, sprint_id, created_by, status || "TODO"],
    function (err) {
      if (err) return response.status(400).json({ error: err.message });
      response.status(201).json({ task_id: this.lastID });
    }
  );
});

// 4. Assign task to user(s)
router.post("/:task_id/assign", verifyToken, (request, response) => {
  const { task_id } = request.params;
  const {
    project_id,
    sprint_id,
    assigned_to_user,
    assigned_to_team,
    assigned_by,
  } = request.body;

  // Check that either user or team is assigned, not both or neither
  if (
    (assigned_to_user && assigned_to_team) ||
    (!assigned_to_user && !assigned_to_team)
  ) {
    return response.status(400).json({
      error: "You must assign either a user or a team, but not both.",
    });
  }

  const query = `
    INSERT INTO Assignments (
      task_id, project_id, sprint_id,
      assigned_to_user, assigned_to_team,
      assigned_by
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  database.run(
    query,
    [
      task_id,
      project_id,
      sprint_id,
      assigned_to_user || null,
      assigned_to_team || null,
      assigned_by,
    ],
    function (err) {
      if (err) return response.status(500).json({ error: err.message });

      // 🔔 Send notification to assigned user or team
      const message = assigned_to_user
        ? `You have been assigned a new task (ID: ${task_id})`
        : `Your team has been assigned a new task (ID: ${task_id})`;

      createNotification({
        user_id: assigned_to_user || assigned_by, // for team, fallback to assigned_by or implement team broadcast
        message,
        notification_type: "TASK_ASSIGNED",
        related_entity_type: "TASK",
        related_entity_id: task_id,
      });

      response.status(201).json({
        assignment_id: this.lastID,
        message: "Assignment created successfully",
      });
    }
  );
});

// 5. Update task
router.put("/:task_id/update", verifyToken, (request, response) => {
  const { task_id } = request.params;
  const { task_name, status } = request.body;
  database.run(
    `UPDATE Tasks SET task_name = ?, status = ? WHERE task_id = ?`,
    [task_name, status, task_id],
    function (err) {
      if (err) return response.status(500).json({ error: err.message });
      if (this.changes === 0)
        return response.status(404).json({ error: "Task not found" });
      response.json({ message: "Task updated successfully" });
    }
  );
});

// 6. Delete task
router.delete("/:task_id/delete", verifyToken, (request, response) => {
  const { task_id } = request.params;
  database.run(
    `DELETE FROM Tasks WHERE task_id = ?`,
    [task_id],
    function (err) {
      if (err) return response.status(500).json({ error: err.message });
      if (this.changes === 0)
        return response.status(404).json({ error: "Task not found" });
      response.json({ message: "Task deleted successfully" });
    }
  );
});

// SUBTASK ENDPOINTS

// 1. List all sub-tasks in a task
router.get("/:task_id/subtasks", verifyToken, (request, response) => {
  const { task_id } = request.params;
  database.all(
    `SELECT * FROM Subtasks WHERE task_id = ?`,
    [task_id],
    (err, subtasks) => {
      if (err) return response.status(500).json({ error: err.message });
      response.json(subtasks);
    }
  );
});

// 2. Create a new sub-task
router.post("/:task_id/subtasks/create", verifyToken, (request, response) => {
  const token = request.headers.authorization?.split(" ")[1];
  const user = jwt.verify(token, secretKey);
  const { task_id } = request.params;
  const { subtask_name } = request.body;

  database.run(
    `INSERT INTO Subtasks (subtask_name, task_id, created_by, status)
     VALUES (?, ?, ?, ?)`,
    [subtask_name, task_id, user.user_id, "TODO"],
    function (err) {
      if (err) return response.status(400).json({ error: err.message });
      response.status(201).json({ subtask_id: this.lastID });
    }
  );
});

// 3. Update sub-task
router.put("/subtasks/:subtask_id/update", verifyToken, (request, response) => {
  const { subtask_id } = request.params;
  const { subtask_name, status } = request.body;
  database.run(
    `UPDATE Subtasks SET subtask_name = ?, status = ? WHERE subtask_id = ?`,
    [subtask_name, status, subtask_id],
    function (err) {
      if (err) return response.status(500).json({ error: err.message });
      if (this.changes === 0)
        return response.status(404).json({ error: "Subtask not found" });
      response.json({ message: "Subtask updated successfully" });
    }
  );
});

// 4. Delete sub-task
router.delete(
  "/subtasks/:subtask_id/delete",
  verifyToken,
  (request, response) => {
    const { subtask_id } = request.params;
    database.run(
      `DELETE FROM Subtasks WHERE subtask_id = ?`,
      [subtask_id],
      function (err) {
        if (err) return response.status(500).json({ error: err.message });
        if (this.changes === 0)
          return response.status(404).json({ error: "Subtask not found" });
        response.json({ message: "Subtask deleted successfully" });
      }
    );
  }
);

module.exports = router;
