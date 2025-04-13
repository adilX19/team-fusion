const database = require('../database/connection');
const jwt = require('jsonwebtoken');
const express = require('express');
const dotenv = require('dotenv');

const verifyToken = require('../middlewares/JWT_middlewares')

dotenv.config();

const router = express.Router();
const secretKey = process.env.JWT_SECRET;

// 1. all teams
router.get('/all', verifyToken, (request, response) => {
    database.all("SELECT * FROM Teams", (err, teams) => {
        if (err) return response.status(500).json({ message: "Database error", error: err.message });
        response.json(teams);
    });
});

// 2. all teams in an organization
router.get('/organization/:orgId', verifyToken, (request, response) => {
    const orgId = request.params.orgId;
    database.all("SELECT * FROM Teams WHERE org_id = ?", [orgId], (err, teams) => {
        if (err) return response.status(500).json({ message: "Database error", error: err.message });
        response.json(teams);
    });
});

// 3. get a specific team details
router.get('/:teamId', verifyToken, (request, response) => {
    const teamId = request.params.teamId;
    database.get("SELECT * FROM Teams WHERE team_id = ?", [teamId], (err, team) => {
        if (err) return response.status(500).json({ message: "Database error", error: err.message });
        if (!team) return response.status(404).json({ message: "Team not found" });
        response.json(team);
    });
});

// 4. add new team
router.post('/add-new', verifyToken, (request, response) => {
    const { team_name, org_id, created_by } = request.body;

    database.run(
        "INSERT INTO Teams (team_name, org_id, created_by) VALUES (?, ?, ?)",
        [team_name, org_id, created_by],
        function (err) {
            if (err) return response.status(500).json({ message: "Database error", error: err.message });
            response.status(201).json({ message: "Team created", team_id: this.lastID });
        }
    );
});


// 5. update a team
router.put('/:teamId/update', verifyToken, (request, response) => {
    const { team_name } = request.body;
    const teamId = request.params.teamId;

    database.run(
        "UPDATE Teams SET team_name = ? WHERE team_id = ?",
        [team_name, teamId],
        function (err) {
            if (err) return response.status(500).json({ message: "Database error", error: err.message });
            response.json({ message: "Team updated" });
        }
    );
});


// 6. delete a team
router.delete('/:teamId/delete', verifyToken, (request, response) => {
    const teamId = request.params.teamId;

    database.run("DELETE FROM Teams WHERE team_id = ?", [teamId], function (err) {
        if (err) return response.status(500).json({ message: "Database error", error: err.message });
        response.json({ message: "Team deleted" });
    });
});

// 7. add a member to team
router.post('/:teamId/add-member', verifyToken, (request, response) => {
    const teamId = request.params.teamId;
    const { user_id } = request.body;

    database.run(
        "INSERT INTO TeamMembers (team_id, user_id) VALUES (?, ?)",
        [teamId, user_id],
        function (err) {
            if (err) return response.status(500).json({ message: "Database error", error: err.message });
            response.status(201).json({ message: "Member added to team" });
        }
    );
});

// 8. list all team members
router.get('/teams/:teamId/members', verifyToken, (request, response) => {
    const teamId = request.params.teamId;

    const query = `
        SELECT 
            u.user_id, u.username, u.email, 
            tm.team_member_id, tm.team_id
        FROM TeamMembers tm
        JOIN Users u ON tm.user_id = u.user_id
        WHERE tm.team_id = ?
    `;

    database.all(query, [teamId], (err, rows) => {
        if (err) return response.status(500).json({ message: "Database error", error: err.message });
        response.json({ team_id: teamId, members: rows });
    });
});


// 9. remove a member from team
router.delete('/:teamId/members/:userId', verifyToken, (request, response) => {
    const { teamId, userId } = request.params;

    database.run(
        "DELETE FROM TeamMembers WHERE team_id = ? AND user_id = ?",
        [teamId, userId],
        function (err) {
            if (err) return response.status(500).json({ message: "Database error", error: err.message });
            response.json({ message: "Member removed from team" });
        }
    );
});


module.exports = router;