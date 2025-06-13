const database = require("../database/connection");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const express = require("express");
const dotenv = require("dotenv");

const { formatUserOrganizationsMapping } =
  require("../utils/data_formatting").default;

const verifyToken = require("../middlewares/JWT_middlewares");

dotenv.config();

const router = express.Router();

const secretKey = process.env.JWT_SECRET;
const expiresIn = process.env.JWT_EXPIRES_IN;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/profile_images"); // relative to your backend root
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = Date.now() + "-" + file.fieldname + ext;
    cb(null, filename);
  },
});
const upload = multer({ storage });
// BASIC USER PROFILE ENDPOINTS

router.get("/me", verifyToken, (request, response) => {
  const token = request.headers.authorization?.split(" ")[1];
  const user = jwt.verify(token, secretKey);

  database.get(
    `SELECT * FROM Users WHERE username = ?`,
    [user.username],
    async (error, user) => {
      if (error) {
        return response.status(500).json({ error: "Database error." });
      }
      if (!user) {
        return response.status(400).json({ error: "User not found." });
      }

      response.json({
        id: user.user_id,
        username: user.username,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        profile_image: user.profile_image,
      });
    }
  );
});

router.put("/me/edit-profile", verifyToken, (request, response) => {
  const token = request.headers.authorization?.split(" ")[1];
  const user = jwt.verify(token, secretKey);
  const { username, firstname, lastname, email } = request.body;

  database.get(
    `SELECT * FROM Users WHERE user_id = ?`,
    [user.id],
    async (error, user) => {
      if (error || !user) {
        return response.status(404).json({ message: "User not Found" });
      }

      database.run(
        `UPDATE Users SET username = ?, email = ?, firstname = ?, lastname = ?`,
        [username, email, firstname, lastname],
        async (error) => {
          if (error) {
            return response.status(500).json({ error: "Database error." });
          } else {
            response.json({
              message: "Profile settings updated successfully.",
            });
          }
        }
      );
    }
  );
});

router.put(
  "/me/profile-image",
  verifyToken,
  upload.single("file"),
  (request, response) => {
    const token = request.headers.authorization?.split(" ")[1];
    const user = jwt.verify(token, secretKey);

    if (!request.file) {
      return response.status(400).json({ message: "No file uploaded." });
    }

    const profileImagePath = request.file
      ? `http://localhost:5000/${request.file.path}`
      : null;

    database.get(
      `SELECT * FROM Users WHERE user_id = ?`,
      [user.id],
      async (error, user) => {
        if (error || !user) {
          return response.status(404).json({ message: "User not Found" });
        }

        database.run(
          `UPDATE Users SET profile_image = ? WHERE user_id = ?`,
          [profileImagePath, user.id],
          async (error) => {
            if (error) {
              return res
                .status(500)
                .json({ message: "Database error", error: error.message });
            }

            response.json({
              message: "Profile image updated successfully.",
              profileImage: profileImagePath,
            });
          }
        );
      }
    );
  }
);

router.put("/me/change-password", verifyToken, (request, response) => {
  const token = request.headers.authorization?.split(" ")[1];
  const user = jwt.verify(token, secretKey);

  const { oldPassword, newPassword } = request.body;

  database.get(
    `SELECT password FROM Users WHERE user_id = ?`,
    [user.id],
    async (error, user) => {
      if (error || !user) {
        return response.status(404).json({ message: "User not found." });
      }

      const isMatch = await bcrypt.compare(oldPassword, user.password);

      if (!isMatch) {
        return response
          .status(400)
          .json({ message: "Old password is incorrect." });
      }

      const hashedPassword = bcrypt.hash(newPassword, 10);

      database.run(
        `UPDATE Users SET password = ?`,
        [hashedPassword],
        async (error) => {
          if (error) {
            return response
              .status(500)
              .json({ message: "Database error", error: error.message });
          }

          response.clearCookie("token"); // clearing old JWT token to perform new login...
          response.json({ message: "Password updated successfully." });
        }
      );
    }
  );
});

router.get("/me/organizations", verifyToken, (request, response) => {
  const token = request.headers.authorization?.split(" ")[1];
  const user = jwt.verify(token, secretKey);

  console.log("User ID: ", user);

  database.all(
    "SELECT * FROM Organizations WHERE owner_id = ?",
    [user.id],
    (err, ogranizations) => {
      if (err)
        return response
          .status(500)
          .json({ message: "Database error", error: err.message });
      response.json(ogranizations);
    }
  );
});

router.get("/me/organization-users", verifyToken, (request, response) => {
  const token = request.headers.authorization?.split(" ")[1];
  const user = jwt.verify(token, secretKey);

  database.all(
    "SELECT * FROM Organizations WHERE owner_id = ?",
    [user.id],
    (err, organizations) => {
      if (err)
        return response
          .status(500)
          .json({ message: "Database error", error: err.message });
      const org_ids = organizations.map((org) => org.org_id);

      if (org_ids.length <= 0) {
        return response
          .status(404)
          .json({ message: "Organizations not found." });
      }

      // NOW FETCH USERS IN EACH ORGANIZATION
      database.all(
        `SELECT 
			o.org_id,
			o.org_name,
			u.user_id,
			u.username,
			u.firstname,
			u.lastname,
			u.profile_image,
			u.email,
			u.role,
			u.title,
			uo.job_title,
			u.is_superuser,
			u.is_staff,
			u.created_at
		FROM UserOrganizations uo
		JOIN Users u ON u.user_id = uo.user_id
		JOIN Organizations o ON o.org_id = uo.org_id
		WHERE uo.org_id IN (${org_ids})
		ORDER BY o.org_name;`,
        (err, users) => {
          if (err)
            return response
              .status(500)
              .json({ message: "Database error", error: err.message });

          if (!users)
            return response.status(404).json({ message: "Users not found." });

          const mappedResults = formatUserOrganizationsMapping(users);
          return response.json(mappedResults);
        }
      );
    }
  );
});

router.get("/list/:org_id", verifyToken, (request, response) => {
  const token = request.headers.authorization?.split(" ")[1];
  const user = jwt.verify(token, secretKey);

  const { org_id } = request.params;

  database.all(
    `SELECT 
			o.org_id,
			o.org_name,
			u.user_id,
			u.username,
			u.firstname,
			u.lastname,
			u.profile_image,
			u.email,
			u.role,
			u.title,
			uo.job_title,
			u.is_superuser,
			u.is_staff,
			u.created_at
		FROM UserOrganizations uo
		JOIN Users u ON u.user_id = uo.user_id
		JOIN Organizations o ON o.org_id = uo.org_id
		WHERE uo.org_id = (${org_id})
		ORDER BY o.org_name;`,
    (err, users) => {
      if (err)
        return response
          .status(500)
          .json({ message: "Database error", error: err.message });

      if (!users)
        return response.status(404).json({ message: "Users not found." });

      response.json(users);
    }
  );
});

// assigned Projects
router.get('/me/assigned-projects', async (request, response) => {
    const token = request.headers.authorization?.split(" ")[1];
    const user = jwt.verify(token, secretKey);
    const userId = user.id;

    console.log("User ID in MyWork", userId);

    const sql = `
        SELECT
            a.project_id,
            p.project_name,
            p.description,
            p.status
        FROM Assignments a
                 LEFT JOIN Projects p ON a.project_id = p.project_id
        WHERE a.assigned_to_user = ? AND a.project_id IS NOT NULL;
  `;

    database.all(sql, [userId], (err, rows) => {
        if (err) {
            console.error('Error fetching tasks:', err);
            return response.status(500).json({ error: 'Failed to fetch projects' });
        }
        response.json({ projects: rows });
    });
});

// assigned Sprints
router.get('/me/assigned-sprints', async (request, response) => {
    const token = request.headers.authorization?.split(" ")[1];
    const user = jwt.verify(token, secretKey);
    const userId = user.id;

    console.log("User ID in MyWork", userId);

    const sql = `
        SELECT
            a.project_id,
            s.sprint_name,
            s.start_date,
            s.end_date,
            s.status
        FROM Assignments a
                 LEFT JOIN Sprints s ON a.sprint_id = s.sprint_id
        WHERE a.assigned_to_user = ? AND a.sprint_id IS NOT NULL;
  `;

    database.all(sql, [userId], (err, rows) => {
        if (err) {
            console.error('Error fetching tasks:', err);
            return response.status(500).json({ error: 'Failed to fetch sprints' });
        }
        response.json({ sprints: rows });
    });
});

// assigned Tasks
router.get('/me/assigned-tasks', async (request, response) => {
    const token = request.headers.authorization?.split(" ")[1];
    const user = jwt.verify(token, secretKey);
    const userId = user.id;

    console.log("User ID in MyWork", userId);

    const sql = `
    SELECT 
      t.task_id,
      t.task_name,
      t.status,
      t.created_at
    FROM Assignments a
    JOIN Tasks t ON a.task_id = t.task_id
    WHERE a.assigned_to_user = ?
  `;

    database.all(sql, [userId], (err, rows) => {
        if (err) {
            console.error('Error fetching tasks:', err);
            return response.status(500).json({ error: 'Failed to fetch tasks' });
        }
        response.json({ tasks: rows });
    });
});


module.exports = router;
