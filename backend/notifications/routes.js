const database = require('../database/connection');
const jwt = require('jsonwebtoken');
const express = require('express');
const dotenv = require('dotenv');

const verifyToken = require('../middlewares/JWT_middlewares')

dotenv.config();

const router = express.Router();
const secretKey = process.env.JWT_SECRET;

// 1. Get All Notifications for a User
router.get('/all', verifyToken, (request, response) => {

	const token = request.headers.authorization?.split(' ')[1];
	const user = jwt.verify(token, secretKey);

	const query = `
	SELECT * FROM Notifications
	WHERE user_id = ?
	ORDER BY created_at DESC
  `;

	database.all(query, [user.id], (err, notifications) => {
		if (err) return response.status(500).json({ error: err.message });
		response.json(notifications);
	});
});

// 2. Get Unread Notifications for a User
router.get('/all/unread', verifyToken, (request, response) => {
	const token = request.headers.authorization?.split(' ')[1];
	const user = jwt.verify(token, secretKey);

	const query = `
	SELECT * FROM Notifications
	WHERE user_id = ? AND is_read = FALSE
	ORDER BY created_at DESC
  `;

	database.all(query, [user.id], (err, notifications) => {
		if (err) return response.status(500).json({ error: err.message });
		response.json(notifications);
	});
});

// 3. Mark Notification as Read
router.patch('/:notification_id/read', verifyToken, (request, response) => {
	const { notification_id } = request.params;

	const query = `
	UPDATE Notifications
	SET is_read = TRUE
	WHERE notification_id = ?
  `;

	database.run(query, [notification_id], function (err) {
		if (err) return response.status(500).json({ error: err.message });
		response.json({ message: 'Notification marked as read' });
	});
});

// 4. Mark All Notifications as Read for a User
router.patch('/user/:user_id/read-all', verifyToken, (request, response) => {
	const token = request.headers.authorization?.split(' ')[1];
	const user = jwt.verify(token, secretKey);

	const query = `
	UPDATE Notifications
	SET is_read = TRUE
	WHERE user_id = ? AND is_read = FALSE
  `;

	database.run(query, [user.id], function (err) {
		if (err) return response.status(500).json({ error: err.message });
		response.json({ message: 'All notifications marked as read' });
	});
});

// 6. Delete Notification
router.delete('/:notification_id/delete', verifyToken, (request, response) => {
	const { notification_id } = request.params;

	const query = `
	DELETE FROM Notifications WHERE notification_id = ?
  `;

	database.run(query, [notification_id], function (err) {
		if (err) return response.status(500).json({ error: err.message });
		response.json({ message: 'Notification deleted' });
	});
});

module.exports = router;