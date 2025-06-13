const database = require('../database/connection');
const jwt = require('jsonwebtoken');
const express = require('express');
const dotenv = require('dotenv');

const verifyToken = require('../middlewares/JWT_middlewares')

dotenv.config();

const router = express.Router();
const secretKey = process.env.JWT_SECRET;

// Get all meetings
router.get("/meetings", (req, res) => {
    database.all("SELECT * FROM Meetings", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Get meetings for a specific date
router.get("/meetings/:date", (req, res) => {
    const date = req.params.date;
    database.all("SELECT * FROM Meetings WHERE date = ?", [date], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Create a new meeting
router.post("/meetings", (req, res) => {
    const { title, agenda, date, time, location, duration } = req.body;
    database.run(
        "INSERT INTO Meetings (title, description, date, time, location, duration_minutes) VALUES (?, ?, ?, ?, ?, ?)",
        [title, agenda, date, time, location, duration],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id: this.lastID });
        }
    );
});

// Create a reminder for a meeting
router.post("/meetings/:id/remind", (req, res) => {
    const meetingId = req.params.id;
    const { reminder_time } = req.body;

    database.run(
        "INSERT INTO Reminders (meeting_id, reminder_time) VALUES (?, ?)",
        [meetingId, reminder_time],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id: this.lastID });
        }
    );
});



module.exports = router;