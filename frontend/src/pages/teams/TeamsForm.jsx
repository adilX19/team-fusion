import React, { useEffect, useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { Flex, Modal, Avatar } from "antd";
import TeamMembersAddWidget from "../../components/TeamMembersAddWidget";

import {
  createNewTeam,
  updateTeam,
  addMember,
  deleteMember,
} from "../../services/teamsService";
import { fetchOrganizationMembers } from "../../services/organizationServices";

export default function TeamsForm({
  selectedOrganization,
  userID,
  openFormModal,
  setOpenFormModal,
  setInitialTeamData,
  initialTeamData = null,
  messageApi,
  setMode,
  mode = "create",
  rerenderOnAddedORUpdated,
}) {
  const [members, setMembers] = useState([]);
  const [teamID, setTeamID] = useState("");
  const [teamName, setTeamName] = useState("");
  const [teamLeadID, setTeamLeadID] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [prevMembers, setPrevAssignees] = useState([]); // for members comparison

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (initialTeamData && mode == "update") {
      console.log("Inital Data found", initialTeamData);
      setTeamID(initialTeamData.teamID);
      setTeamName(initialTeamData.teamName);
      setTeamLeadID(initialTeamData.teamLeadID);
      setDescription(initialTeamData.description);
      setPrevAssignees(
        initialTeamData.selectedMembers.map((member) => member.user_id)
      );
      setSelectedMembers(
        initialTeamData.selectedMembers.map((member) => member.user_id)
      );
    }

    populateTeamLeadsDropdownWithMembers();

    setLoading(false);
  }, [mode, selectedOrganization]);

  const diffMembers = (oldMembers, newMembers) => {
    const toAdd = newMembers.filter((x) => !oldMembers.includes(x));
    const toDelete = oldMembers.filter((x) => !newMembers.includes(x));
    return { toAdd, toDelete };
  };

  const populateTeamLeadsDropdownWithMembers = async () => {
    try {
      const response = await fetchOrganizationMembers(selectedOrganization);
      setMembers(response.data);
    } catch (e) {
      messageApi.error(e.message);
    }
  };

  const addMemberToTeam = async (team_id, payload) => {
    try {
      console.log("TID in SYNC FUNC:", team_id);
      await addMember(team_id, payload);
    } catch (e) {
      messageApi.error(e);
    }
  };

  const removeMemberFromTeam = async (team_id, payload) => {
    try {
      await deleteMember(team_id, payload);
    } catch (e) {
      messageApi.error(e.message);
    }
  };

  const performMemberAdditionAndDeletionOperation = (teamIDParam) => {
    const { toAdd, toDelete } = diffMembers(prevMembers, selectedMembers);

    if (toAdd && toAdd.length > 0) {
      addMemberToTeam(teamIDParam, { member_ids: toAdd });
    }
    if (toDelete && toDelete.length > 0) {
      removeMemberFromTeam(teamIDParam, { member_ids: toDelete });
    }

    clearInput();
    rerenderOnAddedORUpdated();
    setInitialTeamData(null);
    setMode("create");
  };

  const addNewTeamToDatabase = async (payload) => {
    try {
      const response = await createNewTeam(payload);

      if (response.data.team_id) {
        const newTeamID = response.data.team_id;
        console.log("Team ID Founded", newTeamID);
        setTeamID(newTeamID);
        performMemberAdditionAndDeletionOperation(newTeamID);
      } else {
        console.log("Team ID not Found");
      }
    } catch (e) {
      messageApi.error(e.message);
    }
  };

  const updateExistingTeam = async (payload) => {
    try {
      const response = await updateTeam(teamID, payload);
      performMemberAdditionAndDeletionOperation(teamID); // make sure to add/remove members
    } catch (e) {
      messageApi.error(e.message);
    }
  };

  const clearInput = () => {
    setTeamID("");
    setTeamName("");
    setTeamLeadID("");
    setDescription("");
    setMembers([]);
    setPrevAssignees([]);
    setSelectedMembers([]);
  };
  const handleSubmit = () => {
    const payload = {
      team_name: teamName,
      description: description,
      team_lead: teamLeadID,
      org_id: selectedOrganization,
      created_by: userID,
    };
    mode == "create"
      ? addNewTeamToDatabase(payload)
      : updateExistingTeam(payload);

    mode == "create"
      ? messageApi.success("Team Created successfully...")
      : messageApi.success("Team Updated successfully...");
  };

  if (loading) {
    return <>Loading...</>;
  }

  return (
    <Flex>
      <Modal
        title="Add New Team To Your Organization"
        centered
        open={openFormModal}
        okButtonProps={{
          htmlType: "submit",
        }}
        okText={mode == "create" ? "Create" : "Update"}
        onOk={() => {
          setOpenFormModal(false);
          handleSubmit();
        }}
        onCancel={() => {
          setOpenFormModal(false);
          setInitialTeamData(null);
          clearInput();
          setMode("create");
        }}
        width={{
          xs: "90%",
          sm: "80%",
          md: "70%",
          lg: "60%",
          xl: "50%",
          xxl: "40%",
        }}
      >
        <Form onSubmit={handleSubmit} method="POST" action="" className="mt-4">
          <TeamMembersAddWidget
            selectedOptions={selectedMembers.filter(
              (opt) => opt !== teamLeadID
            )}
            setSelectedOptions={setSelectedMembers}
            availableOptions={members}
            teamLead={teamLeadID}
          />
          <Form.Group className="mt-3 mb-3">
            <Form.Label>Team Name</Form.Label>
            <Form.Control
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Dev Team, Research Team, AI Team"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Description/Agenda</Form.Label>
            <Form.Control
              as={"textarea"}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Agenda of the team..."
            ></Form.Control>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Team Lead</Form.Label>
            <Form.Select
              value={teamLeadID}
              onChange={(e) => setTeamLeadID(e.target.value)}
            >
              <option value="" selected>
                Select Team Lead
              </option>

              {members.map((member) => {
                return (
                  <option key={member.user_id} value={member.user_id}>
                    {member.firstname + " " + member.lastname}
                  </option>
                );
              })}
            </Form.Select>
          </Form.Group>
        </Form>
      </Modal>
    </Flex>
  );
}
