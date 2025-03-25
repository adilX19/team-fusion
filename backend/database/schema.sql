CREATE TABLE IF NOT EXISTS Users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_id INTEGER,
    username VARCHAR(255) NOT NULL,
    firstname VARCHAR(255),
    lastname VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    profile_image VARCHAR(255),
    role TEXT CHECK(role IN ('OWNER', 'ADMIN', 'MEMBER')) DEFAULT 'MEMBER',
    title VARCHAR(500) NOT NULL,
    is_superuser BOOLEAN DEFAULT FALSE,
    is_staff BOOLEAN DEFAULT FALSE,
    reports_to INT REFERENCES Users(user_id) ON DELETE
    SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS Organizations (
    org_id INTEGER PRIMARY KEY AUTOINCREMENT,
    org_name VARCHAR(255) NOT NULL UNIQUE,
    owner_id INT REFERENCES Users(user_id) ON DELETE CASCADE,
    -- The user who bought the tool
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS Plans (
    plan_id INTEGER PRIMARY KEY AUTOINCREMENT,
    plan_name VARCHAR(255) NOT NULL UNIQUE,
    max_organizations INTEGER NOT NULL,
    -- How many organizations a user can create
    max_users_per_org INTEGER NOT NULL,
    -- How many users an org can have
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS Subscriptions (
    subscription_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INT REFERENCES Users(user_id) ON DELETE CASCADE,
    -- Buyer (CEO)
    plan_id INT REFERENCES Plans(plan_id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    -- 'ACTIVE', 'CANCELLED', 'EXPIRED'
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP NOT NULL,
    CHECK (status IN ('ACTIVE', 'CANCELLED', 'EXPIRED'))
);
CREATE TABLE IF NOT EXISTS UserOrganizations (
    user_id INT REFERENCES Users(user_id) ON DELETE CASCADE,
    org_id INT REFERENCES Organizations(org_id) ON DELETE CASCADE,
    role TEXT CHECK(role IN ('OWNER', 'ADMIN', 'MEMBER')) DEFAULT 'MEMBER',
    -- 'OWNER', 'ADMIN', 'MEMBER'
    PRIMARY KEY (user_id, org_id)
);
CREATE TABLE IF NOT EXISTS Teams (
    team_id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_name VARCHAR(255) NOT NULL,
    org_id INT REFERENCES Organizations(org_id) ON DELETE CASCADE,
    created_by INT REFERENCES Users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS TeamMembers (
    team_member_id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_id INT REFERENCES Teams(team_id) ON DELETE CASCADE,
    user_id INT REFERENCES Users(user_id) ON DELETE CASCADE,
    UNIQUE (team_id, user_id)
);
CREATE TABLE IF NOT EXISTS Projects (
    project_id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_name VARCHAR(255) NOT NULL,
    org_id INT REFERENCES Organizations(org_id) ON DELETE CASCADE,
    created_by INT REFERENCES Users(user_id),
    status VARCHAR(50) DEFAULT 'PLANNED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (
        status IN (
            'PLANNED',
            'IN_PROGRESS',
            'IN_REVIEW',
            'COMPLETED'
        )
    )
);
CREATE TABLE IF NOT EXISTS Sprints (
    sprint_id INTEGER PRIMARY KEY AUTOINCREMENT,
    sprint_name VARCHAR(255) NOT NULL,
    project_id INT REFERENCES Projects(project_id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'PLANNED',
    created_by INT REFERENCES Users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (
        status IN (
            'PLANNED',
            'IN_PROGRESS',
            'IN_REVIEW',
            'COMPLETED'
        )
    )
);
CREATE TABLE IF NOT EXISTS Tasks (
    task_id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_name VARCHAR(255) NOT NULL,
    sprint_id INT REFERENCES Sprints(sprint_id) ON DELETE CASCADE,
    created_by INT REFERENCES Users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'TODO',
    CHECK (
        status IN ('TODO', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED')
    )
);
CREATE TABLE IF NOT EXISTS Subtasks (
    subtask_id INTEGER PRIMARY KEY AUTOINCREMENT,
    subtask_name VARCHAR(255) NOT NULL,
    task_id INT REFERENCES Tasks(task_id) ON DELETE CASCADE,
    created_by INT REFERENCES Users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'TODO',
    CHECK (status IN ('TODO', 'COMPLETED'))
);
CREATE TABLE IF NOT EXISTS Assignments (
    assignment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INT REFERENCES Tasks(task_id) ON DELETE CASCADE,
    assigned_to_user INT REFERENCES Users(user_id) ON DELETE CASCADE,
    assigned_to_team INT REFERENCES Teams(team_id) ON DELETE CASCADE,
    assigned_by INT REFERENCES Users(user_id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (
        (
            assigned_to_user IS NOT NULL
            AND assigned_to_team IS NULL
        )
        OR (
            assigned_to_user IS NULL
            AND assigned_to_team IS NOT NULL
        )
    )
);
CREATE TABLE IF NOT EXISTS Notifications (
    notification_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INT REFERENCES Users(user_id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    related_entity_type VARCHAR(50),
    related_entity_id INT,
    CHECK (
        notification_type IN (
            'TASK_ASSIGNED',
            'SPRINT_STARTED',
            'SPRINT_ASSIGNED',
            'COMMENT_ADDED'
        )
    )
);
CREATE TABLE IF NOT EXISTS Comments (
    comment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
    related_entity_type VARCHAR(50) NOT NULL,
    related_entity_id INTEGER NOT NULL,
    parent_comment_id INTEGER REFERENCES Comments(comment_id) ON DELETE CASCADE,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (
        related_entity_type IN ('TASK', 'SUBTASK', 'SPRINT', 'PROJECT')
    )
);
CREATE TABLE IF NOT EXISTS FileAttachments (
    file_id INTEGER PRIMARY KEY AUTOINCREMENT,
    uploaded_by INTEGER NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
    related_entity_type VARCHAR(50) NOT NULL,
    related_entity_id INTEGER NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (
        related_entity_type IN ('TASK', 'SUBTASK', 'SPRINT', 'PROJECT')
    )
);