const database = require('../database/connection');
const { getClient } = require('../ws/socketServer');

function createNotification({
    user_id,
    message,
    notification_type,
    related_entity_type = null,
    related_entity_id = null
}) {
    const sql = `
    INSERT INTO Notifications (
      user_id, message, notification_type,
      related_entity_type, related_entity_id
    ) VALUES (?, ?, ?, ?, ?)
  `;

    database.run(sql, [user_id, message, notification_type, related_entity_type, related_entity_id], function (err) {
        if (err) return console.error('❌ Notification DB Error:', err.message);

        const notification = {
            notification_id: this.lastID,
            user_id,
            message,
            notification_type,
            related_entity_type,
            related_entity_id,
            created_at: new Date().toISOString(),
        };

        const ws = getClient(user_id);
        if (ws && ws.readyState === 1) {
            ws.send(JSON.stringify({ type: 'NOTIFICATION', data: notification }));
        }
    });
}

module.exports = { createNotification };
