const express = require('express');
const database = require('./database/connection')
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const verifyToken = require('./middlewares/JWT_middlewares')

// routes import 
const authenticationRoutes = require('./authentication/auth');
const userRoutes = require('./users/routes');
const adminRoutes = require('./admin/routes');
const organizationsRoutes = require('./organizations/routes');
const teamsRoutes = require('./teams/routes');
const projectsRoutes = require('./projects/routes');
const sprintsRoutes = require('./sprints/routes');
const tasksRoutes = require('./tasks/routes');
const notificationsRoutes = require('./notifications/routes');

const { setupWebSocket } = require('./ws/socketServer');

const path = require('path');

dotenv.config();

const corsOptions = {
    origin: ['http://localhost:5173'], // List of allowed origins
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
    credentials: true, // Allow cookies and other credentials
};

const app = express();
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/auth', authenticationRoutes);
app.use('/user', userRoutes);
app.use('/admin', adminRoutes);
app.use('/organizations', organizationsRoutes);
app.use('/teams', teamsRoutes);
app.use('/projects', projectsRoutes);
app.use('/sprints', sprintsRoutes);
app.use('/tasks', tasksRoutes);
app.use('/notifications', notificationsRoutes);


// socket imports
const http = require('http');
const server = http.createServer(app);

app.listen(process.env.PORT, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
});

setupWebSocket(server); // Init WS server