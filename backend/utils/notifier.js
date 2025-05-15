// utils/createNotification.js

/**
 * Create a new notification.
 *
 * @param {Object} options
 * @param {number} options.user_id - User ID to notify
 * @param {string} options.message - The message content
 * @param {'TASK_ASSIGNED'|'SPRINT_STARTED'|'SPRINT_ASSIGNED'|'COMMENT_ADDED'} options.notification_type - The type of notification
 * @param {string} [options.related_entity_type] - Optional related entity type (e.g., 'task', 'sprint', etc.)
 * @param {number} [options.related_entity_id] - Optional related entity ID
 * @param {Function} [callback] - Optional callback for error/success
 */

const { getIO, getOnlineUsers } = require("../ws/socketServer");

function createNotification(
  database,
  {
    user_id,
    message,
    notification_type,
    related_entity_type = null,
    related_entity_id = null,
  },
  callback = () => {}
) {
  const query = `
    INSERT INTO Notifications (
      user_id,
      message,
      notification_type,
      related_entity_type,
      related_entity_id
    ) VALUES (?, ?, ?, ?, ?)
  `;

  const values = [
    user_id,
    message,
    notification_type,
    related_entity_type,
    related_entity_id,
  ];

  database.run(query, values, function (err) {
    if (err) {
      console.error("Failed to create notification:", err.message);
      return callback(err);
    }

    const socketId = getOnlineUsers().get(user_id);
    if (socketId) {
      console.log("Sendind to Socket:", socketId);
      getIO().to(socketId).emit("NOTIFICATION", {
        notification_id: this.lastID,
        message: message,
      });
      console.log(message);
    } else {
      console.log("Socket Id not founded");
    }

    callback(null, { notification_id: this.lastID });
  });
}

function sendNotificationsToWholeTeam(
  database,
  team_id,
  entity_id,
  entity_type,
  notification_type,
  message
) {
  if (team_id) {
    database.all(
      `SELECT * FROM TeamMembers WHERE team_id = ?`,
      [team_id],
      function (err, members) {
        if (err) {
          console.error(err.message);
        }

        members.forEach((member) => {
          createNotification(database, {
            user_id: member.user_id,
            message: message,
            notification_type: notification_type,
            related_entity_id: entity_id,
            related_entity_type: entity_type,
          });
        });
      }
    );
  }
}

module.exports = { createNotification, sendNotificationsToWholeTeam };
