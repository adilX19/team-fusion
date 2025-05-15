const database = require("../database/connection");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const express = require("express");
const dotenv = require("dotenv");

const {
  createNotification,
  sendNotificationsToWholeTeam,
} = require("../utils/notifier");
const { formatAssigneesDropdownValues, formatAssigneesAvatarStackValues } =
  require("../utils/data_formatting").default;

const verifyToken = require("../middlewares/JWT_middlewares");

dotenv.config();

const router = express.Router();

const secretKey = process.env.JWT_SECRET;
const expiresIn = process.env.JWT_EXPIRES_IN;

// fetch assignees of a Project
router.get("/projects/:project_id", verifyToken, (request, response) => {
  const { project_id } = request.params;
  const { response_type } = request.query;

  database.all(
    `SELECT
        asg.assignment_id,
        asg.assigned_by,
        asg.assigned_at,
        u.user_id AS user_id,
        u.username AS username,
        u.firstname AS firstname,
        u.lastname AS lastname,
        u.profile_image AS profile_image,
        t.team_id AS team_id,
        t.team_name AS team_name
        FROM Assignments asg
        LEFT JOIN Users u ON u.user_id = asg.assigned_to_user
        LEFT JOIN Teams t ON t.team_id = asg.assigned_to_team
        WHERE asg.project_id = ${project_id};`,
    async (err, rows) => {
      if (err) {
        return response.status(500).json({ message: err.message });
      }
      if (response_type == "just-ids") {
        return response.json(formatAssigneesDropdownValues(rows));
      }
      const newRes = await formatAssigneesAvatarStackValues(rows);
      console.log("Response", newRes);
      response.json(newRes);
    }
  );
});

// fetch Assignees of a task
router.get("/tasks/:task_id", verifyToken, (request, response) => {
  const { task_id } = request.params;
  const { response_type } = request.query;

  database.all(
    `SELECT
        asg.assignment_id,
        asg.assigned_by,
        asg.assigned_at,
        u.user_id AS user_id,
        u.username AS username,
        u.firstname AS firstname,
        u.lastname AS lastname,
        t.team_id AS team_id,
        t.team_name AS team_name
        FROM Assignments asg
        LEFT JOIN Users u ON u.user_id = asg.assigned_to_user
        LEFT JOIN Teams t ON t.team_id = asg.assigned_to_team
        WHERE asg.task_id = ${task_id};`,
    (err, rows) => {
      if (err) {
        return response.status(500).json({ message: err.message });
      }

      if (response_type == "just-ids") {
        return response.json(formatAssigneesDropdownValues(rows));
      }

      response.json(formatAssigneesAvatarStackValues(rows));
    }
  );
});

router.post("/assign-entity/:entityType", verifyToken, (request, response) => {
  const { entityType } = request.params;
  const { entity_id, assigned_by, assigneesToAdd } = request.body;

  const userAssignees = assigneesToAdd.filter((id) => id.startsWith("user-"));
  const teamAssignees = assigneesToAdd.filter((id) => id.startsWith("team-"));

  // an entity can be either assigned to users or teams. Not both
  if (userAssignees.length > 0 && teamAssignees.length > 0) {
    return response.status(400).json({
      message:
        "You can only assign to either users or teams, not both at the same time.",
    });
  }

  const entityTypeMapper = {
    project: "PROJECT_ASSIGNED",
    sprint: "SPRINT_ASSIGNED",
    task: "TASK_ASSIGNED",
  };

  const messageMapper = {
    PROJECT_ASSIGNED: "You've been assigned a Project:",
    SPRINT_ASSIGNED: "You've been assigned a Sprint:",
    TASK_ASSIGNED: "You've been assigned a Task:",
  };

  const entityMapper = {
    project: "project_id",
    sprint: "sprint_id",
    task: "task_id",
  };

  const entityColumn = entityMapper[entityType.toLowerCase()];
  if (!entityColumn) {
    return response.status(400).json({ error: "Invalid entity type" });
  }

  if (!entity_id || !assigned_by || !Array.isArray(assigneesToAdd)) {
    return response.status(400).json({ error: "Missing required fields" });
  }

  const insertStmt = `
    INSERT INTO Assignments (
      ${entityColumn}, assigned_by, assigned_to_user, assigned_to_team
    ) VALUES (?, ?, ?, ?)
  `;

  let completed = 0;
  let hasError = false;

  assigneesToAdd.forEach((assignee, index) => {
    let assigned_to_user = null;
    let assigned_to_team = null;

    if (assignee.startsWith("user-")) {
      assigned_to_user = parseInt(assignee.replace("user-", ""));
    } else if (assignee.startsWith("team-")) {
      assigned_to_team = parseInt(assignee.replace("team-", ""));
    } else {
      // Skip and count this as completed
      completed++;
      if (completed === assigneesToAdd.length && !hasError) {
        return response
          .status(200)
          .json({ message: "Assignments added (some skipped)" });
      }
      return;
    }

    database.run(
      insertStmt,
      [entity_id, assigned_by, assigned_to_user, assigned_to_team],
      function (err) {
        if (err) {
          if (!hasError) {
            hasError = true;
            return response
              .status(500)
              .json({ message: "DB Insert Failed", error: err.message });
          }
          return;
        }

        completed++;
        if (completed === assigneesToAdd.length && !hasError) {
          if (assigned_to_user)
            createNotification(database, {
              user_id: assigned_to_user,
              message:
                messageMapper[entityTypeMapper[entityType.toLowerCase()]],
              notification_type: entityTypeMapper[entityType.toLowerCase()],
              related_entity_type: entityType.toLowerCase(),
              related_entity_id: entity_id,
            });
          else if (assigned_to_team) {
            sendNotificationsToWholeTeam(
              database,
              assigned_to_team,
              entity_id,
              entityType.toLowerCase(),
              entityTypeMapper[entityType.toLowerCase()],
              messageMapper[entityTypeMapper[entityType.toLowerCase()]]
            );
          }

          response
            .status(200)
            .json({ message: "All assignments added successfully" });
        }
      }
    );
  });
});

router.post(
  "/de-assign-entity/:entityType",
  verifyToken,
  (request, response) => {
    const { entityType } = request.params;
    const { entity_id, assigneesToRemove } = request.body;

    const entityMapper = {
      project: "project_id",
      sprint: "sprint_id",
      task: "task_id",
    };

    const entityColumn = entityMapper[entityType.toLowerCase()];
    if (!entityColumn) {
      return response.status(400).json({ error: "Invalid entity type" });
    }

    if (!entity_id || !Array.isArray(assigneesToRemove)) {
      return response.status(400).json({ error: "Missing required fields" });
    }

    let completed = 0;
    let hasError = false;

    assigneesToRemove.forEach((assignee) => {
      let user_id = null;
      let team_id = null;

      if (assignee.startsWith("user-")) {
        user_id = parseInt(assignee.replace("user-", ""));
      } else if (assignee.startsWith("team-")) {
        team_id = parseInt(assignee.replace("team-", ""));
      } else {
        completed++;
        if (completed === assigneesToRemove.length && !hasError) {
          return response
            .status(200)
            .json({ message: "Deassignment complete (some skipped)" });
        }
        return;
      }

      const deleteStmt = `
      DELETE FROM Assignments
      WHERE ${entityColumn} = ?
        AND ${user_id ? "assigned_to_user = ?" : "assigned_to_team = ?"}
    `;

      const idToDelete = user_id || team_id;

      database.run(deleteStmt, [entity_id, idToDelete], function (err) {
        if (err) {
          if (!hasError) {
            hasError = true;
            return response
              .status(500)
              .json({ message: "Failed to deassign", error: err.message });
          }
          return;
        }

        completed++;
        if (completed === assigneesToRemove.length && !hasError) {
          return response
            .status(200)
            .json({ message: "Deassignment successful" });
        }
      });
    });
  }
);

module.exports = router;
