const db = require('./connection');

// Sample data
const plans = [
  ['Starter', 1, 5],
  ['Pro', 5, 50],
  ['Enterprise', 50, 500],
];

const users = [
  ['ceo_user', 'Alice', 'Smith', 'ceo@example.com', 'hashed_pass1', 'CEO', 'OWNER', 1, 1],
  ['admin_user', 'Bob', 'Jones', 'admin@example.com', 'hashed_pass2', 'Manager', 'ADMIN', 0, 1],
  ['member_user', 'Charlie', 'Brown', 'member@example.com', 'hashed_pass3', 'Developer', 'MEMBER', 0, 0],
  ['guest_user', 'Diana', 'Mills', 'guest@example.com', 'hashed_pass4', 'QA Tester', 'MEMBER', 0, 0],
  ['org_admin', 'Eve', 'Stone', 'orgadmin@example.com', 'hashed_pass5', 'Director', 'ADMIN', 0, 1]
];

const organizations = [
  ['Acme Inc', 1, 'logo1.png', 'Innovation experts.'],
  ['Beta Corp', 4, 'logo2.png', 'AI company.'],
  ['Gamma LLC', 5, 'logo3.png', 'Testing org.']
];

const userOrgs = [
  [1, 1, 'OWNER', 'Chief Executive Officer'],
  [2, 1, 'ADMIN', 'Operations Manager'],
  [3, 1, 'MEMBER', 'Frontend Engineer'],
  [4, 2, 'MEMBER', 'QA Tester'],
  [5, 2, 'ADMIN', 'Product Lead'],
  [3, 3, 'MEMBER', 'Support Engineer']
];

const subscriptions = [
  [1, 2, 'ACTIVE', '2024-01-01', '2025-01-01'],
  [4, 1, 'ACTIVE', '2024-01-01', '2025-01-01'],
  [5, 3, 'CANCELLED', '2023-01-01', '2024-01-01']
];

const teams = [
  ['Dev Team', 1, 2],
  ['QA Team', 1, 2],
  ['Research Team', 2, 5]
];

const teamMembers = [
  [1, 2],
  [1, 3],
  [2, 3],
  [2, 4],
  [3, 5]
];

const projects = [
  ['New Website', 1, 2, 'IN_PROGRESS'],
  ['Mobile App', 2, 5, 'PLANNED']
];

const sprints = [
  ['Sprint 1', 1, '2024-01-01', '2024-01-15', 'IN_PROGRESS', 2],
  ['Sprint 2', 2, '2024-02-01', '2024-02-15', 'PLANNED', 5]
];

const tasks = [
  ['Build homepage', 1, 3, 'IN_PROGRESS'],
  ['Implement login', 1, 3, 'TODO'],
  ['Set up CI/CD', 2, 5, 'TODO']
];

const subtasks = [
  ['Header section', 1, 3, 'COMPLETED'],
  ['Footer section', 1, 3, 'TODO'],
  ['Login UI', 2, 3, 'TODO']
];

const assignments = [
  [1, 1, 1, 3, 2],
  [2, 1, 1, 3, 2],
  [3, 2, 2, 5, 5]
];

const notifications = [
  [3, 'You have been assigned a new task', 'TASK_ASSIGNED', 'TASK', 1],
  [3, 'Sprint 1 has started', 'SPRINT_STARTED', 'SPRINT', 1]
];

const comments = [
  [3, 'TASK', 1, 'Working on the homepage layout.'],
  [2, 'TASK', 1, 'Make sure to use company branding.']
];

const attachments = [
  [3, 'TASK', 1, 'homepage_mockup.png', '/files/homepage_mockup.png'],
  [3, 'SPRINT', 1, 'sprint_notes.pdf', '/files/sprint_notes.pdf']
];

// Insertion function
function insertAll() {
  db.serialize(() => {
    db.run("BEGIN TRANSACTION");

    plans.forEach(p => {
      db.run("INSERT INTO Plans (plan_name, max_organizations, max_users_per_org) VALUES (?, ?, ?)", p);
    });

    users.forEach(u => {
      db.run("INSERT INTO Users (username, firstname, lastname, email, password, title, role, is_superuser, is_staff) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", u);
    });

    organizations.forEach(o => {
      db.run("INSERT INTO Organizations (org_name, owner_id, logo, description) VALUES (?, ?, ?, ?)", o);
    });

    userOrgs.forEach(uo => {
      db.run("INSERT INTO UserOrganizations (user_id, org_id, role, job_title) VALUES (?, ?, ?, ?)", uo);
    });

    subscriptions.forEach(s => {
      db.run("INSERT INTO Subscriptions (user_id, plan_id, status, start_date, end_date) VALUES (?, ?, ?, ?, ?)", s);
    });

    teams.forEach(t => {
      db.run("INSERT INTO Teams (team_name, org_id, created_by) VALUES (?, ?, ?)", t);
    });

    teamMembers.forEach(tm => {
      db.run("INSERT INTO TeamMembers (team_id, user_id) VALUES (?, ?)", tm);
    });

    projects.forEach(p => {
      db.run("INSERT INTO Projects (project_name, org_id, created_by, status) VALUES (?, ?, ?, ?)", p);
    });

    sprints.forEach(s => {
      db.run("INSERT INTO Sprints (sprint_name, project_id, start_date, end_date, status, created_by) VALUES (?, ?, ?, ?, ?, ?)", s);
    });

    tasks.forEach(t => {
      db.run("INSERT INTO Tasks (task_name, sprint_id, created_by, status) VALUES (?, ?, ?, ?)", t);
    });

    subtasks.forEach(s => {
      db.run("INSERT INTO Subtasks (subtask_name, task_id, created_by, status) VALUES (?, ?, ?, ?)", s);
    });

    assignments.forEach(a => {
      db.run("INSERT INTO Assignments (task_id, project_id, sprint_id, assigned_to_user, assigned_by) VALUES (?, ?, ?, ?, ?)", a);
    });

    notifications.forEach(n => {
      db.run("INSERT INTO Notifications (user_id, message, notification_type, related_entity_type, related_entity_id) VALUES (?, ?, ?, ?, ?)", n);
    });

    comments.forEach(c => {
      db.run("INSERT INTO Comments (user_id, related_entity_type, related_entity_id, comment_text) VALUES (?, ?, ?, ?)", c);
    });

    attachments.forEach(a => {
      db.run("INSERT INTO FileAttachments (uploaded_by, related_entity_type, related_entity_id, file_name, file_path) VALUES (?, ?, ?, ?, ?)", a);
    });

    db.run("COMMIT", () => {
      console.log("Data inserted successfully.");
      db.close();
    });
  });
}

insertAll();
