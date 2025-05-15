import database from "../database/connection.js";

function formatUserOrganizationsMapping(users) {
  const orgUsersMap = {};

  for (const user of users) {
    if (!orgUsersMap[user.org_id]) {
      orgUsersMap[user.org_id] = [];
    }

    orgUsersMap[user.org_id].push({
      user_id: user.user_id,
      username: user.username,
      fullname: `${user.firstname} ${user.lastname}`,
      profile_image: user.profile_image,
      email: user.email,
      role: user.role,
      title: user.title,
      org_title: user.job_title,
      is_superuser: user.is_superuser,
      is_staff: user.is_staff,
      created_at: user.created_at,
    });
  }

  return { organizations: orgUsersMap };
}

async function formatAssigneesAvatarStackValues(assignees) {
  const assigneesList = [];

  const userAssignees = assignees.filter(
    (assignee) => assignee.user_id != null
  );
  const teamAssignees = assignees.filter(
    (assignee) => assignee.team_id != null
  );

  if (userAssignees.length > 0) {
    return assignees;
  }

  if (teamAssignees.length > 0) {
    const queries = teamAssignees.map((teamAssignee) => {
      return new Promise((resolve, reject) => {
        database.all(
          `
          SELECT 
              u.user_id, u.username, u.email, u.profile_image, u.firstname, u.lastname,
              tm.team_member_id, tm.team_id
          FROM TeamMembers tm
          JOIN Users u ON tm.user_id = u.user_id
          WHERE tm.team_id = ?
        `,
          [teamAssignee.team_id],
          (err, members) => {
            if (err) {
              console.error("Error occurred in fetching team assignees:", err);
              return reject(err);
            }

            const formattedMembers = members.map((member) => ({
              user_id: member.user_id,
              firstname: member.firstname,
              lastname: member.lastname,
              profile_image: member.profile_image,
            }));

            resolve(formattedMembers);
          }
        );
      });
    });

    const results = await Promise.all(queries);
    results.forEach((members) => assigneesList.push(...members));
  }

  const uniqueByUserId = {};
  assigneesList.forEach((user) => {
    uniqueByUserId[user.user_id] = user;
  });

  return Object.values(uniqueByUserId);
}

function formatAssigneesDropdownValues(assignees) {
  const assigneesList = [];

  const userAssignees = assignees.filter(
    (assignee) => assignee.user_id != null
  );
  const teamAssignees = assignees.filter(
    (assignee) => assignee.team_id != null
  );

  if (userAssignees.length > 0) {
    userAssignees.forEach((userAssignee) => {
      assigneesList.push({ item_id: userAssignee.user_id });
    });

    return { type: "user", assignees: assigneesList };
  }

  if (teamAssignees.length > 0) {
    teamAssignees.forEach((teamAssignee) => {
      assigneesList.push({ item_id: teamAssignee.team_id });
    });

    return { type: "team", assignees: assigneesList };
  }
}

export default {
  formatUserOrganizationsMapping,
  formatAssigneesDropdownValues,
  formatAssigneesAvatarStackValues,
};
