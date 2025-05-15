const database = require("../database/connection");
const jwt = require("jsonwebtoken");
const express = require("express");
const dotenv = require("dotenv");

const verifyToken = require("../middlewares/JWT_middlewares");

dotenv.config();

const router = express.Router();
const secretKey = process.env.JWT_SECRET;

// 1. all teams
router.get("/admin/all", verifyToken, (request, response) => {
  database.all("SELECT * FROM Teams", (err, teams) => {
    if (err)
      return response
        .status(500)
        .json({ message: "Database error", error: err.message });
    response.json(teams);
  });
});

// All teams of a user's organizations...
router.get("/all", verifyToken, (request, response) => {
  const token = request.headers.authorization?.split(" ")[1];
  let user;

  try {
    user = jwt.verify(token, secretKey);
  } catch (err) {
    return response.status(401).json({ message: "Invalid or expired token." });
  }

  // Step 1: Get all teams owned by the user
  const teamQuery = `
    SELECT 
        Teams.team_id,
        Teams.team_name,
        Teams.description AS team_description,
        Teams.team_lead,
        Teams.org_id,
        Teams.created_by,
        Teams.created_at,
        Organizations.org_name,
        Organizations.logo,
        Organizations.owner_id
    FROM Teams
    INNER JOIN Organizations ON Teams.org_id = Organizations.org_id
    WHERE Organizations.owner_id = ?
  `;

  database.all(teamQuery, [user.id], (err, teams) => {
    if (err) {
      return response
        .status(500)
        .json({ message: "Database error", error: err.message });
    }

    if (!teams || teams.length === 0) {
      return response.json(teams);
    }

    const teamIds = teams.map((team) => team.team_id);

    if (teamIds.length === 0) {
      return response.json([]); // no teams
    }

    // Step 2: Get all members for these team IDs
    const memberQuery = `
      SELECT 
          TeamMembers.team_id,
          Users.user_id,
          Users.username,
          Users.firstname,
          Users.lastname,
          Users.profile_image,
          Users.email
      FROM TeamMembers
      JOIN Users ON TeamMembers.user_id = Users.user_id
      WHERE TeamMembers.team_id IN (${teamIds.map(() => "?").join(",")})
    `;

    database.all(memberQuery, teamIds, (err2, members) => {
      if (err2) {
        return response
          .status(500)
          .json({ message: "Database error", error: err2.message });
      }

      // Group members by team_id
      const membersByTeam = {};
      for (const member of members) {
        if (!membersByTeam[member.team_id]) {
          membersByTeam[member.team_id] = [];
        }
        membersByTeam[member.team_id].push({
          user_id: member.user_id,
          username: member.username,
          profile_image: member.profile_image,
          firstname: member.firstname,
          lastname: member.lastname,
          email: member.email,
        });
      }

      // Merge members into the team data
      const finalResult = teams.map((team) => ({
        ...team,
        members: membersByTeam[team.team_id] || [],
      }));

      response.json(finalResult);
    });
  });
});

// all teams where user is a member...
router.get("/by/membership", verifyToken, (request, response) => {
  const token = request.headers.authorization?.split(" ")[1];
  let user;

  try {
    user = jwt.verify(token, secretKey);
  } catch (err) {
    return response.status(401).json({ message: "Invalid or expired token." });
  }

  database.all(
    `SELECT t.*
   FROM Teams t
   JOIN TeamMembers tm ON t.team_id = tm.team_id
   WHERE tm.user_id = ?`,
    [user.id],
    (err, rows) => {
      if (err) {
        return response.status(500).json({ message: err.message });
      }
      response.json(rows);
    }
  );
});

// 2. all teams in an organization
router.get("/organization/:orgId", verifyToken, (request, response) => {
  const orgId = request.params.orgId;
  database.all(
    "SELECT * FROM Teams WHERE org_id = ?",
    [orgId],
    (err, teams) => {
      if (err)
        return response
          .status(500)
          .json({ message: "Database error", error: err.message });
      response.json(teams);
    }
  );
});

// 3. get a specific team details
router.get("/:teamId", verifyToken, (request, response) => {
  const teamId = request.params.teamId;
  database.get(
    "SELECT * FROM Teams WHERE team_id = ?",
    [teamId],
    (err, team) => {
      if (err)
        return response
          .status(500)
          .json({ message: "Database error", error: err.message });
      if (!team)
        return response.status(404).json({ message: "Team not found" });
      response.json(team);
    }
  );
});

// 4. add new team
router.post("/add-new", verifyToken, (request, response) => {
  const { team_name, description, team_lead, org_id, created_by } =
    request.body;

  database.run(
    "INSERT INTO Teams (team_name, description, team_lead, org_id, created_by) VALUES (?, ?, ?, ?, ?)",
    [team_name, description, team_lead, org_id, created_by],
    function (err) {
      if (err)
        return response
          .status(500)
          .json({ message: "Database error", error: err.message });
      response
        .status(201)
        .json({ message: "Team created", team_id: this.lastID });
    }
  );
});

// 5. update a team
router.put("/:teamId/update", verifyToken, (request, response) => {
  const { team_name, description, team_lead } = request.body;
  const teamId = request.params.teamId;

  database.run(
    "UPDATE Teams SET team_name = ?, description = ?, team_lead =? WHERE team_id = ?",
    [team_name, description, team_lead, teamId],
    function (err) {
      if (err)
        return response
          .status(500)
          .json({ message: "Database error", error: err.message });
      response.json({ message: "Team updated" });
    }
  );
});

// 6. delete a team
router.delete("/:teamId/delete", verifyToken, (request, response) => {
  const teamId = request.params.teamId;

  database.run("DELETE FROM Teams WHERE team_id = ?", [teamId], function (err) {
    if (err)
      return response
        .status(500)
        .json({ message: "Database error", error: err.message });
    response.json({ message: "Team deleted" });
  });
});

// 7. add a member(s) to team
router.post("/:teamId/add-members", verifyToken, (request, response) => {
  const { teamId } = request.params;
  const { member_ids } = request.body;

  if (!Array.isArray(member_ids) || member_ids.length === 0) {
    return response
      .status(400)
      .json({ message: "member_ids must be a non-empty array" });
  }

  const placeholders = member_ids.map(() => "(?, ?)").join(", ");
  const values = member_ids.flatMap((userId) => [teamId, userId]);

  const query = `INSERT INTO TeamMembers (team_id, user_id) VALUES ${placeholders}`;

  database.run(query, values, function (err) {
    if (err) {
      return response
        .status(500)
        .json({ message: "Database error", error: err.message });
    }
    response
      .status(201)
      .json({ message: "Members added to team", changes: this.changes });
  });
});

// 8. list all team members
router.get("/:teamId/members", verifyToken, (request, response) => {
  const teamId = request.params.teamId;

  const query = `
        SELECT 
            u.user_id, u.username, u.email, u.profile_image, u.firstname, u.lastname,
            tm.team_member_id, tm.team_id
        FROM TeamMembers tm
        JOIN Users u ON tm.user_id = u.user_id
        WHERE tm.team_id = ?
    `;

  database.all(query, [teamId], (err, rows) => {
    if (err)
      return response
        .status(500)
        .json({ message: "Database error", error: err.message });
    response.json({ team_id: teamId, members: rows });
  });
});

// 9. remove a member from team
router.post("/:teamId/remove-members/", verifyToken, (request, response) => {
  const { teamId } = request.params;
  const { member_ids } = request.body;

  if (!Array.isArray(member_ids) || member_ids.length === 0) {
    return response
      .status(400)
      .json({ message: "member_ids must be a non-empty array" });
  }

  const placeholders = member_ids.map(() => "?").join(", ");
  const query = `DELETE FROM TeamMembers WHERE team_id = ? AND user_id IN (${placeholders})`;
  const params = [teamId, ...member_ids];

  database.run(query, params, function (err) {
    if (err) {
      return response
        .status(500)
        .json({ message: "Database error", error: err.message });
    }
    response.json({
      message: "Members removed from team",
      changes: this.changes,
    });
  });
});

module.exports = router;
