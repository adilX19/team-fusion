import React, { useEffect, useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { Flex, Modal } from "antd";
import { createProject, updateProject } from "../../services/projectsService";
import {
  fetchAssignees,
  assignEntity,
  deAssignEntity,
} from "../../services/assigneesService";
import Assignment from "../../components/Assignment";

function ProjectForm({
  openFormModal,
  setOpenFormModal,
  selectedOrganization,
  setInitialProjectData,
  setMode,
  userID,
  messageApi,
  onProjectCreatedOrUpdated,
  initialProjectData = null,
  mode = "create",
}) {
  const [projectID, setProjectID] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("PLANNED");
  const [deadline, setDeadline] = useState("");
  const [prevAssignees, setPrevAssignees] = useState([]); // for assignment comparison
  const [assignees, setAssignees] = useState([]); // for assignment

  const clearInput = () => {
    setTitle("");
    setProjectID("");
    setDescription("");
    setStatus("");
    setDeadline("");
    setPrevAssignees([]);
    setAssignees([]);
  };

  const diffAssignments = (oldAssignments, newAssignments) => {
    console.log("OLD", oldAssignments);
    console.log("New", newAssignments);
    const toAdd = newAssignments.filter((x) => !oldAssignments.includes(x));
    const toDelete = oldAssignments.filter((x) => !newAssignments.includes(x));
    return { toAdd, toDelete };
  };

  const getProjectAssignees = async (pid) => {
    try {
      const response = await fetchAssignees(pid);

      if (response.data.assignees) {
        setPrevAssignees(
          response.data.assignees.map(
            (item) => `${response.data.type}-${item.item_id}`
          )
        );
        setAssignees(
          response.data.assignees.map(
            (item) => `${response.data.type}-${item.item_id}`
          )
        );
      }
    } catch (e) {
      messageApi.error(e.message);
    }
  };

  useEffect(() => {
    if (initialProjectData && mode == "update") {
      console.log("Inital Data found", initialProjectData);
      setProjectID(initialProjectData.id);
      setTitle(initialProjectData.title);
      setDescription(initialProjectData.description);
      setStatus(initialProjectData.status);
      setDeadline(initialProjectData.deadline);

      getProjectAssignees(initialProjectData.id);
    }
  }, [mode]);

  const assignProject = async (payload) => {
    try {
      await assignEntity(payload, "project");
    } catch (e) {
      messageApi.error(e.message);
    }
  };

  const deAssignProject = async (payload) => {
    try {
      await deAssignEntity(payload, "project");
    } catch (e) {
      messageApi.error(e.message);
    }
  };

  const performAssignmentOperations = (projectIDParam) => {
    // first we want to compare, if a user has added new or deleted an existing one.
    const { toAdd, toDelete } = diffAssignments(prevAssignees, assignees);

    // we will make this to add any new assignee into the project...
    if (toAdd)
      assignProject({
        entity_id: projectIDParam,
        assigned_by: userID,
        assigneesToAdd: toAdd,
      });

    // then we will make this call to delete any person from the project...
    if (toDelete)
      deAssignProject({
        entity_id: projectIDParam,
        assigneesToRemove: toDelete,
      });
  };

  const createNewProject = async (payload) => {
    try {
      const response = await createProject(payload);

      if (response.data.project_id) {
        const newProjectID = response.data.project_id;
        performAssignmentOperations(newProjectID);
      }
    } catch (e) {
      messageApi.error(e.message);
    }
  };

  const updateExistingProject = (payload) => {
    try {
      updateProject(projectID, payload);
      performAssignmentOperations(projectID);
    } catch (e) {
      messageApi.error(e.message);
    }
  };

  const handleSubmit = () => {
    const payload = {
      project_name: title,
      description: description,
      org_id: selectedOrganization,
      created_by: userID,
      status: status,
      deadline: deadline,
    };
    mode == "create"
      ? createNewProject(payload)
      : updateExistingProject(payload);

    mode == "create"
      ? messageApi.success("Project Created successfully...")
      : messageApi.success("Project Updated successfully...");

    clearInput();
    onProjectCreatedOrUpdated();
    setInitialProjectData(null);
    setMode("create");
  };

  return (
    <Flex>
      <Modal
        title="Add New Project To Your Planner"
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
          setInitialProjectData(null);
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
          <Assignment
            organizationID={selectedOrganization}
            selectedOptions={assignees}
            setSelectedOptions={setAssignees}
          />
          <Form.Group className="mt-3 mb-3">
            <Form.Label>Project Title</Form.Label>
            <Form.Control
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="AI Agent, Competitive Tracker etc."
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as={"textarea"}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Scope, Agenda or useful text about the project..."
            ></Form.Control>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Status</Form.Label>
            <Form.Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="PLANNED">PLANNED</option>
              <option value="IN_PROGRESS">INPROGRESS</option>
              <option value="IN_REVIEW">IN-REVIEW</option>
              <option value="COMPLETED">COMPLETED</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Deadline</Form.Label>
            <Form.Control
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              type="datetime-local"
              placeholder="Deadline of the project..."
            ></Form.Control>
          </Form.Group>
        </Form>
      </Modal>
    </Flex>
  );
}

export default ProjectForm;
