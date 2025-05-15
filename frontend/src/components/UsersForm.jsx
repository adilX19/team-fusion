import React, { useState, useEffect } from "react";
import { Row, Col, Form } from "react-bootstrap";
import { Flex, Modal } from "antd";

import { fetchOrganizationMembers } from "../services/organizationServices";
import {
  fetchOwnedUsers,
  addUserToOrganization,
  createNewUserAccount,
} from "../services/assigneesService";

export default function UsersForm({
  userID,
  selectedOrganization,
  openFormModal,
  setOpenFormModal,
  setInitialUserData,
  initialUserData = null,
  reRenderUsers,
  setMode,
  messageApi,
  mode = "create",
}) {
  const [allOwnedMembers, setAllOwnedMembers] = useState([]);
  const [existingUserID, setExistingUserID] = useState(null);
  const [accountMode, setAccountMode] = useState("new-account");
  const [members, setMembers] = useState([]);
  const [username, setUsername] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [reportsTo, setReportsTo] = useState(null);
  const starterPassword = "random-one";

  useEffect(() => {
    if (initialUserData && mode == "update") {
      console.log("Inital Data found", initialUserData);
    }
    if (selectedOrganization) populateTeamLeadsDropdownWithMembers();

    populateExistingMembersDropdown();
  }, [mode, selectedOrganization]);

  const createNewUserAsExistingMember = async (payload) => {
    try {
      const response = await addUserToOrganization(payload);
    } catch (e) {
      messageApi.error(e.message);
    }
  };

  const createNewUserFromScratchAndSetMember = async (
    creationPayload,
    membershipPayload
  ) => {
    try {
      const response = await createNewUserAccount(creationPayload);

      if (response.data.user_id) {
        const userId = response.data.user_id;
        console.log("User ID found.", userId);
        setExistingUserID(userId);

        membershipPayload.user_id = userId;

        await addUserToOrganization(membershipPayload);
        reRenderUsers();
      } else {
        messageApi.error("No user_id returned from user creation.");
      }
    } catch (e) {
      messageApi.error(e.message || "Something went wrong");
    }
  };

  const handleSubmit = () => {
    const existingUserPayload = {
      user_id: existingUserID,
      org_id: selectedOrganization,
      role: role,
      job_title: jobTitle,
      reports_to: reportsTo,
    };

    const newUserPayload = {
      username: username,
      email: email,
      owner_id: userID,
      firstname: firstname,
      lastname: lastname,
      password: starterPassword,
      role: role,
    };

    accountMode == "new-account"
      ? createNewUserFromScratchAndSetMember(
          newUserPayload,
          existingUserPayload
        )
      : createNewUserAsExistingMember(existingUserPayload);

    if (mode == "create") {
      if (accountMode == "new-account") {
        messageApi.success("New Account Created & Added to Organization");
      } else {
        messageApi.success("User Added to Organization");
      }
    } else {
      messageApi.info("User Updated Successfully");
    }

    clearInput();
    setInitialUserData(null);
    setMode("create");
  };

  const clearInput = () => {
    setAllOwnedMembers([]);
    setMembers([]);
    setExistingUserID(null);
    setAccountMode("new-account");
    setUsername("");
    setFirstname("");
    setLastName("");
    setEmail("");
    setRole("");
    setJobTitle("");
    setReportsTo(null);
  };

  const populateExistingMembersDropdown = async () => {
    try {
      const response = await fetchOwnedUsers();
      setAllOwnedMembers(response.data);
    } catch (e) {
      messageApi.error(e.message);
    }
  };

  const populateTeamLeadsDropdownWithMembers = async () => {
    try {
      console.log("Selected is:", selectedOrganization);
      const response = await fetchOrganizationMembers(selectedOrganization);
      setMembers(response.data);
    } catch (e) {
      messageApi.error(e.message);
    }
  };

  return (
    <Flex>
      <Modal
        title="Add New User To Your Organization"
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
          setInitialUserData(null);
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
          <Form.Check // prettier-ignore
            type="switch"
            value={accountMode}
            onChange={(e) => {
              e.target.checked
                ? setAccountMode("existing-account")
                : setAccountMode("new-account");
            }}
            label="Add an existing user"
          />
          {accountMode == "new-account" ? (
            <>
              <Row>
                <Col>
                  <Form.Group className="mt-3 mb-3">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="@username, unique..."
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group className="mt-3 mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="username@company-domain.com"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col>
                  <Form.Group className="mt-3 mb-3">
                    <Form.Label>First Name</Form.Label>
                    <Form.Control
                      value={firstname}
                      onChange={(e) => setFirstname(e.target.value)}
                      placeholder="Bob, Alex etc."
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group className="mt-3 mb-3">
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control
                      value={lastname}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Ziroll, Vivas etc."
                    />
                  </Form.Group>
                </Col>
              </Row>
            </>
          ) : (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Available Users</Form.Label>
                <Form.Select
                  value={existingUserID}
                  onChange={(e) => setExistingUserID(e.target.value)}
                >
                  <option value="" selected>
                    ----- Select User -----
                  </option>
                  {allOwnedMembers
                    .filter(
                      (ownedMember) =>
                        !members.some(
                          (orgMember) =>
                            orgMember.user_id === ownedMember.user_id
                        )
                    )
                    .map((member) => {
                      return (
                        <option key={member.user_id} value={member.user_id}>
                          {member.firstname + " " + member.lastname}
                        </option>
                      );
                    })}
                </Form.Select>
              </Form.Group>
            </>
          )}
          <Row>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>Role</Form.Label>
                <Form.Select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="" selected>
                    -- Select User Role --
                  </option>
                  <option value="OWNER">OWNER</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="MEMBER">MEMBER</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>Job Title</Form.Label>
                <Form.Control
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Engineer, Developer, Tester etc."
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Form.Group className="mb-3">
              <Form.Label>Reports To</Form.Label>
              <Form.Select
                value={reportsTo}
                onChange={(e) => setReportsTo(e.target.value)}
              >
                <option value="" selected>
                  ----- Select Manager -----
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
          </Row>
        </Form>
      </Modal>
    </Flex>
  );
}
