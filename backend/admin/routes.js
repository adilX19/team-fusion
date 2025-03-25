const database = require('../database/connection');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const express = require('express');
const dotenv = require('dotenv');

const verifyToken = require('../middlewares/JWT_middlewares')

dotenv.config();

const router = express.Router();

const secretKey = process.env.JWT_SECRET;
const expiresIn = process.env.JWT_EXPIRES_IN;

// CREATE A NEW USER
router.post('/users', verifyToken, (request, response) => {

    const { username, email, owner_id, firstname, lastname, password, role, title, reports_to } = request.body;

    if (!username || !firstname || !lastname || !email || !role || !password || !title) {
        return response.status(400).json({ error: 'All fields are required and cannot be empty.' });
    }

    // check user existence before creating a new user...
    database.get("SELECT * FROM Users WHERE username = ?", [username], async (err, user) => {

        if (err) return response.status(500).json({ error: 'Database error' });
        if (user) return response.status(400).json({ error: 'User already exists' });

        // convert password to hash before storing into the database.
        const hashedPassword = await bcrypt.hash(password, 10);

        database.run(
            "INSERT INTO Users (username, email, owner_id, firstname, lastname, password, role, title, reports_to) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [username, email, owner_id, firstname, lastname, hashedPassword, role, title, reports_to],
            (err) => {
                if (err) return response.status(500).json({ error: err.message });
                response.status(201).json({ message: 'User registered successfully!' });
            }
        )
    });
});

// GET ALL THE USERS AVAILABLE
router.get('/users', verifyToken, (request, response) => {
    database.all("SELECT * FROM Users", [], (err, users) => {
        if (err) return response.status(500).json({ message: "Database error", error: err.message });
        response.json(users);
    });
});

// GET A SPECIFIC USER
router.get('/users/:id', verifyToken, (request, response) => {
    const userId = request.params.id;
    database.get("SELECT * FROM Users WHERE user_id = ?", [userId], (err, user) => {
        if (err) return response.status(500).json({ message: "Database error", error: err.message });
        if (!user) return response.status(404).json({ message: "User not found" });
        response.json(user);
    });
});

// UPDATE A SPECIFIC USER
router.put('/users/:id', verifyToken, (request, response) => {
    const userId = request.params.id;
    const { username, email, is_superuser, is_staff, reports_to, role } = request.body;

    // for dynamic query building.
    const updates = {};
    if (username !== undefined) updates.username = username;
    if (email !== undefined) updates.email = email;
    if (is_superuser !== undefined) updates.is_superuser = is_superuser;
    if (is_staff !== undefined) updates.is_staff = is_staff;
    if (reports_to !== undefined) updates.reports_to = reports_to;
    if (role !== undefined) updates.role = role;

    // If no valid fields provided, return an error
    if (Object.keys(updates).length === 0) {
        return response.status(400).json({ message: "No valid fields to update" });
    }

    database.get("SELECT * from Users WHERE user_id = ?", [userId], (err, user) => {

        if (err) return response.status(500).json({ message: "Database error", error: err.message });
        if (!user) return response.status(404).json({ message: "User not found" });

        const fields = Object.keys(updates).map(key => `${key} = ?`).join(", ");
        const values = Object.values(updates);
        values.push(userId);

        const sql = `UPDATE Users SET ${fields} WHERE user_id = ?`;

        database.run(sql, values,
            (err) => {
                if (err) return response.status(500).json({ message: "Database error", error: err.message });
                response.json({ message: "User updated successfully" })
            }
        )
    });

});

// DELETE A SPECIFIC USER
router.delete('/users/:id', verifyToken, (request, response) => {
    const userId = request.params.id;

    database.get("SELECT * from Users WHERE user_id = ?", [userId], (err, user) => {
        if (err) return response.status(500).json({ message: "Database error", error: err.message });
        if (!user) return response.status(404).json({ message: "User not found" });

        database.run(
            "DELETE FROM Users WHERE user_id = ?", [userId], (err) => {
                if (err) return response.status(500).json({ message: "Database error", error: err.message });
                response.json({ message: "User deleted successfully" })
            }
        )

    });
});

module.exports = router;