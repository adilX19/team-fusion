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

// login endpoint
router.post('/login', (request, response) => {
    const { username, password } = request.body;

    if (!username || !password) {
        return response.status(400).json({ error: 'All fields are required' })
    }

    database.get(`SELECT * FROM Users WHERE username = ?`, [username], async (error, user) => {
        if (error) { return response.status(500).json({ error: 'Database error.' }); }
        if (!user) { return response.status(400).json({ error: 'Invalid username or password' }) }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return response.status(400).json({ error: 'Password didn\'t matched' })
        }

        console.log("Secret:", secretKey)
        const token = jwt.sign({ id: user.id, username: user.username, email: user.email }, secretKey, { expiresIn: expiresIn });

        response.cookie('token', token, { httpOnly: false, maxAge: 60 * 60 * 1000 })
        response.status(200).json({
            token: token,
            user: { id: user.id, role: user.role }
        });
    })

});


router.post('/logout', (request, response) => {
    response.clearCookie('token');
    response.status(200).json({ logout: true, message: 'Logged out successfully' });
});


router.post('/register', async (request, response) => {
    const { username, email, password, confirm_password, role } = request.body;

    if (!username || !password || !role) {
        return response.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already exists
    database.get('SELECT * FROM Users WHERE username = ?', [username], async (err, user) => {
        if (err) return response.status(500).json({ error: 'Database error' });

        if (user) return response.status(400).json({ error: 'User already exists' });

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into database
        database.run(
            'INSERT INTO Users (username, email, password, role, title) VALUES (?, ?, ?, ?, ?)',
            [username, email, hashedPassword, 'ADMIN', role],
            function (err) {
                if (err) return response.status(500).json({ error: err.message });
                response.status(201).json({ message: 'User registered successfully!' });
            }
        );
    });
});


router.get('/validate-token', (request, response) => {
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) {
        return response.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, secretKey);
        // Retrieve the user from your database based on decoded data (e.g., user ID)
        const user = { id: decoded.id, role: decoded.role }; // Example user object
        response.json({ user });
    } catch (err) {
        response.status(401).json({ message: 'Invalid or expired token' });
    }
});

module.exports = router;