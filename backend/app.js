const express = require("express");
const http = require("http");
const path = require("path");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const database = require("./database/connection");

// Routes
const insightsRoutes = require("./insights/routes");
const authenticationRoutes = require("./authentication/auth");
const userRoutes = require("./users/routes");
const adminRoutes = require("./admin/routes");
const organizationsRoutes = require("./organizations/routes");
const teamsRoutes = require("./teams/routes");
const projectsRoutes = require("./projects/routes");
const sprintsRoutes = require("./sprints/routes");
const tasksRoutes = require("./tasks/routes");
const notificationsRoutes = require("./notifications/routes");
const assignmentRoutes = require("./assignments/routes");
const { initSocket, getIO, getOnlineUsers } = require("./ws/socketServer");

dotenv.config();

const app = express();
const server = http.createServer(app);
initSocket(server);

const io = getIO();
const clients = getOnlineUsers();

// Make clients map globally accessible if needed
app.set("io", io);
app.set("clients", clients);

// Middleware
const corsOptions = {
  origin: ["http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/auth", authenticationRoutes);
app.use("/user", userRoutes);
app.use("/admin", adminRoutes);
app.use("/organizations", organizationsRoutes);
app.use("/teams", teamsRoutes);
app.use("/projects", projectsRoutes);
app.use("/sprints", sprintsRoutes);
app.use("/tasks", tasksRoutes);
app.use("/assignments", assignmentRoutes);
app.use("/notifications", notificationsRoutes);
app.use("/insights", insightsRoutes);

// Start server
server.listen(process.env.PORT || 5000, () => {
  console.log(
    `🚀 Server running on http://localhost:${process.env.PORT || 5000}`
  );
});
