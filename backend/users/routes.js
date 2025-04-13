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

// BASIC USER PROFILE ENDPOINTS

router.get('/me', verifyToken, (request, response) => {
    const token = request.headers.authorization?.split(' ')[1];
    const user = jwt.verify(token, secretKey);


    database.get(`SELECT * FROM Users WHERE username = ?`, [user.username], async (error, user) => {
        if (error) { return response.status(500).json({ error: 'Database error.' }); }
        if (!user) { return response.status(400).json({ error: 'User not found.' }) }

        response.json({
            id: user.user_id,
            username: user.username,
            email: user.email
        })

    })
});


router.put('/me/edit-profile', verifyToken, (request, response) => {
    const token = request.headers.authorization?.split(' ')[1];
    const user = jwt.verify(token, secretKey);
    const { username, firstname, lastname, email } = request.body;


    database.get(`SELECT * FROM Users WHERE user_id = ?`, [user.id], async (error, user) => {

        if (error || !user) {
            return response.status(404).json({ message: "User not Found" });
        }

        database.run(`UPDATE Users SET username = ?, email = ?, firstname = ?, lastname = ?`, [username, email, firstname, lastname], async (error) => {
            if (error) { return response.status(500).json({ error: 'Database error.' }); }
            else { response.json({ message: "Profile settings updated successfully." }) }
        })

    });

});

router.put('me/profile-image', verifyToken, (request, response) => {

    const token = request.headers.authorization?.split(' ')[1];
    const user = jwt.verify(token, secretKey);

    if (!request.file) {
        return response.status(400).json({ message: "No file uploaded." })
    }

    const profileImagePath = `/uploads/profile_images/${request.file.filename}`;

    database.get(`SELECT * FROM Users WHERE user_id = ?`, [user.id], async (error, user) => {
        if (error || !user) {
            return response.status(404).json({ message: "User not Found" });
        }

        database.run(`UPDATE Users SET profile_image = ?`, [profileImagePath], async (error) => {
            if (error) { return res.status(500).json({ message: "Database error", error: error.message }); }

            response.json({ message: "Profile image updated successfully.", profileImage: profileImagePath })

        });
    });
});


router.put('/me/change-password', verifyToken, (request, response) => {

    const token = request.headers.authorization?.split(' ')[1];
    const user = jwt.verify(token, secretKey);

    const { oldPassword, newPassword } = request.body;


    database.get(`SELECT password FROM Users WHERE user_id = ?`, [user.id], async (error, user) => {

        if (error || !user) {
            return response.status(404).json({ message: "User not found." })
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password)

        if (!isMatch) {
            return response.status(400).json({ message: "Old password is incorrect." })
        }

        const hashedPassword = bcrypt.hash(newPassword, 10);

        database.run(`UPDATE Users SET password = ?`, [hashedPassword], async (error) => {

            if (error) { return response.status(500).json({ message: "Database error", error: error.message }) }

            response.clearCookie('token'); // clearing old JWT token to perform new login...
            response.json({ message: "Password updated successfully." })
        });
    });
});

router.get('/me/ogranizations', verifyToken, (request, response) => {
    const token = request.headers.authorization?.split(' ')[1];
    const user = jwt.verify(token, secretKey);

    console.log("User ID: ", user)

    database.all("SELECT * FROM Organizations WHERE owner_id = ?", [user.id], (err, ogranizations) => {
        if (err) return response.status(500).json({ message: "Database error", error: err.message });
        response.json(ogranizations);
    });
});

module.exports = router;