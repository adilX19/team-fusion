# TeamFusion

## Overview
TeamFusion is a **collaborative workspace management** application designed to help organizations manage users, subscriptions, and teams effectively. Built with **Node.js** and **SQLite3**, TeamFusion provides a robust backend to handle user authentication, organization management, and role-based access control.

## Features
- **User Authentication**
  - Signup, Login, and Logout functionality
  - Profile management (update details, change password, upload profile image)
  
- **Admin Panel**
  - Manage users (View, Update, Delete users)
  - Role-based access control (Admins, Users)

- **Organization & Subscription Management**
  - Create and manage organizations
  - Associate users with organizations
  - Subscription-based access control

## Tech Stack
- **Backend:** Node.js, Express.js
- **Database:** SQLite3
- **Authentication:** JWT (JSON Web Tokens)
- **Middleware:** Express.js, JWT Authentication

## Installation & Setup

### Prerequisites
Make sure you have the following installed:
- [Node.js](https://nodejs.org/)
- [SQLite3](https://www.sqlite.org/)

### Steps to Run the Project
1. **Clone the repository**
   ```sh
   git clone https://github.com/your-username/teamfusion.git
   cd teamfusion
   ```
2. **Install dependencies**
   ```sh
   npm install
   ```
3. **Set up environment variables**
   - Create a `.env` file in the root directory and configure the following:
   ```
   PORT=5000
   JWT_SECRET=your_secret_key
   ```
4. **Run database migrations (if required)**
   ```sh
   npm run migrate
   ```
5. **Start the server**
   ```sh
   npm start
   ```

## API Endpoints

### **User Endpoints**
| Method | Endpoint | Description |
|--------|----------|-------------|
| `PUT` | `/users/me` | Update profile |
| `PUT` | `/users/me/password` | Change password |
| `PUT` | `/users/me/profile-image` | Upload profile image |

### **Admin Endpoints**
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/users` | Get all users |
| `GET` | `/admin/users/:id` | Get user details |
| `PUT` | `/admin/users/:id` | Update user |
| `DELETE` | `/admin/users/:id` | Delete user |

## Contributing
If you’d like to contribute to TeamFusion, feel free to submit a pull request or report issues in the repository.

## License
This project is licensed under the **MIT License**.

---
Made with ❤️ by Adil Saleem.

