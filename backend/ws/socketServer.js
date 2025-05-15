// socket.js
const { Server } = require("socket.io");

let io;
let onlineUsers = new Map();

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("REGISTER", (user_id) => {
      onlineUsers.set(user_id, socket.id);
      console.log(`🧑 User ${user_id} connected with socket ID ${socket.id}`);
    });

    socket.on("disconnect", () => {
      for (let [uid, sid] of onlineUsers.entries()) {
        if (sid === socket.id) {
          onlineUsers.delete(uid);
          break;
        }
      }
    });
  });
}

function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
}

function getOnlineUsers() {
  return onlineUsers;
}

module.exports = {
  initSocket,
  getIO,
  getOnlineUsers,
};
