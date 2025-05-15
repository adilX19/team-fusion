import React, { useState, useEffect } from "react";
import { Select, Divider } from "antd";

import { fetchUsersList } from "../services/organizationServices";
import { fetchTeams } from "../services/organizationServices";

export default function Assignment({
  organizationID,
  selectedOptions,
  setSelectedOptions,
}) {
  const { Option, OptGroup } = Select;
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);

  const getUsers = async () => {
    try {
      const response = await fetchUsersList(organizationID);
      console.log("Users", response.data);
      setUsers(response.data);
    } catch (e) {
      console.log(e.message);
    }
  };

  const getTeams = async () => {
    try {
      const response = await fetchTeams(organizationID);
      console.log("Teams", response.data);
      setTeams(response.data);
      setLoading(false);
    } catch (e) {
      console.log(e.message);
    }
  };

  useEffect(() => {
    setLoading(true);
    getUsers();
    getTeams();
  }, [organizationID]);

  if (loading) {
    return <>Loading...</>;
  }

  return (
    <>
      <label>Assign To:</label>
      <br />
      <Select
        loading={loading}
        mode="multiple"
        style={{ width: "100%" }}
        placeholder="Assign to team members or teams"
        onChange={(newSelection) => setSelectedOptions(newSelection)}
        value={selectedOptions}
        optionLabelProp="label"
      >
        <OptGroup label="Users">
          {users
            .filter(
              (user) => user?.user_id !== null && user?.user_id !== undefined
            )
            .map((user) => (
              <Option
                key={"user-" + user.user_id}
                value={"user-" + user.user_id}
                label={user.firstname + " " + user.lastname}
              >
                👤 {user.firstname + " " + user.lastname}
              </Option>
            ))}
        </OptGroup>

        <OptGroup label="Teams">
          {teams
            .filter(
              (team) => team?.team_id !== null && team?.team_id !== undefined
            )
            .map((team) => (
              <Option
                key={"team-" + team.team_id}
                value={"team-" + team.team_id}
                label={team.team_name}
              >
                👥 {team.team_name}
              </Option>
            ))}
        </OptGroup>
      </Select>
    </>
  );
}
