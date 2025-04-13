const database = require('../database/connection');
const jwt = require('jsonwebtoken');
const express = require('express');
const dotenv = require('dotenv');

const verifyToken = require('../middlewares/JWT_middlewares')

dotenv.config();

const router = express.Router();
const secretKey = process.env.JWT_SECRET;

// GET ALL ORGANIZATIONS: Superadmin
router.get('/all', verifyToken, (request, response) => {
    database.all("SELECT * FROM Organizations", [], (err, ogranizations) => {
        if (err) return response.status(500).json({ message: "Database error", error: err.message });
        response.json(ogranizations);
    });
});

// GET A SPECIFIC ORGANIZATION
router.get('/:id', verifyToken, (request, response) => {
    const orgId = request.params.id;
    database.get("SELECT * FROM Organizations WHERE org_id = ?", [orgId], (err, organization) => {
        if (err) return response.status(500).json({ message: "Database error", error: err.message });

        if (!organization) return response.status(404).json({ message: "Organization not found" });

        response.json(organization);
    });
});

// CREATE A NEW ORGANIZATION
router.post('/new', verifyToken, (request, response) => {
    const { org_name } = request.body;
    const token = request.headers.authorization?.split(' ')[1];
    const user = jwt.verify(token, secretKey);

    database.run(
        "INSERT INTO Organizations (org_name, owner_id) VALUES (?, ?)",
        [org_name, user.id],
        function (err) {
            if (err) return response.status(500).json({ message: "Database error", error: err.message });
            response.status(201).json({ message: "Organization created", org_id: this.lastID });
        }
    );
});


// UPDATE AN ORGANIZATION
router.put('/update/:id', verifyToken, (request, response) => {
    const token = request.headers.authorization?.split(' ')[1];
    const user = jwt.verify(token, secretKey);
    const { org_name } = request.body;
    const orgId = request.params.id;

    database.run(
        "UPDATE Organizations SET org_name = ?, owner_id = ? WHERE org_id = ?",
        [org_name, user.id, orgId],
        function (err) {
            if (err) return response.status(500).json({ message: "Database error", error: err.message });
            response.json({ message: "Organization updated" });
        }
    );
});

// DELETE AN ORGANIZATION
router.delete('/delete/:id', verifyToken, (request, response) => {
    const orgId = request.params.id;

    database.run("DELETE FROM Organizations WHERE org_id = ?", [orgId], function (err) {
        if (err) return response.status(500).json({ message: "Database error", error: err.message });
        response.json({ message: "Organization deleted" });
    });
});

// ----------------------------------------------------------
//              USER - ORGANIZATION MAPPING ENDPOINTS
// ----------------------------------------------------------

// ALL USERS FROM AN ORGANIZATION...
router.get('/:id/users', verifyToken, (request, response) => {
    const orgId = request.params.id;

    database.all(
        "SELECT * FROM UserOrganizations WHERE org_id = ?",
        [orgId],
        function (err, users) {
            if (err) return response.status(500).json({ message: "Database error", error: err.message });
            if (!users) return response.status(404).json({ message: "No users associated with this organization" });
            response.json(users);
        }
    );
});

// GET A SPECIFIC USER DETAILS FROM AN ORGANIZATION...
router.get('/users/:userId/:orgId', verifyToken, (request, response) => {
    const { userId, orgId } = request.params;

    database.get(
        "SELECT * FROM UserOrganizations WHERE user_id = ? AND org_id = ?",
        [userId, orgId],
        function (err, user) {
            if (err) return response.status(500).json({ message: "Database error", error: err.message });
            if (!user) return response.status(404).json({ message: "User not found in specified organization" });
            response.json(user);
        }
    );
});

// ADD A PERSON TO ORGANIZATION...
router.post('/add-user', verifyToken, (request, response) => {
    const { user_id, org_id, role, job_title } = request.body;

    database.run(
        "INSERT INTO UserOrganizations (user_id, org_id, role, job_title) VALUES (?, ?, ?, ?)",
        [user_id, org_id, role, job_title],
        function (err) {
            if (err) return response.status(500).json({ message: "Database error", error: err.message });
            response.status(201).json({ message: "User added to organization" });
        }
    );
});

// UPDATE A USER ROLE/TITLE IN AN ORGANIZATION...
router.put('/:orgId/update/users/:userId/', verifyToken, (request, response) => {
    const { userId, orgId } = request.params;
    const { role, title } = request.body;

    database.run(
        "UPDATE UserOrganizations SET role = ?, job_title = ? WHERE user_id = ? AND org_id = ?",
        [role, title, userId, orgId],
        function (err) {
            if (err) return response.status(500).json({ message: "Database error", error: err.message });
            response.json({ message: "User role updated" });
        }
    )
});

// REMOVE A USER FROM AN ORGANIZATION...
router.delete('/:orgId/remove/users/:userId/', verifyToken, (request, response) => {
    const { userId, orgId } = request.params;

    database.run(
        "DELETE FROM UserOrganizations WHERE user_id = ? AND org_id = ?",
        [userId, orgId],
        function (err) {
            if (err) return response.status(500).json({ message: "Database error", error: err.message });
            response.json({ message: "User removed from organization" });
        }
    );
});

module.exports = router;