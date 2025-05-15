import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  renderDatetimeToString,
  trimContent,
} from "../../utils/helperfunctions";
import { Card } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import { Row, Col, Button } from "react-bootstrap";
import {
  BsPencilSquare,
  BsFillTrashFill,
  BsCheckCircle,
  BsFillLightbulbFill,
  BsFillHddStackFill,
} from "react-icons/bs";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Popover from "react-bootstrap/Popover";
import { deleteProject } from "../../services/projectsService";

export default function ProjectCard({
  project,
  messageApi,
  onProjectDeleted,
  onProjectUpdated,
  setOpenFormModal,
  setMode,
  setFormInitialData,
}) {
  const [show, setShow] = useState(false);

  const statusIcons = {
    PLANNED: <BsFillLightbulbFill style={{ color: "blue" }} />,
    IN_PROGRESS: <BsFillHddStackFill style={{ color: "red" }} />,
    COMPLETED: <BsCheckCircle style={{ color: "green" }} />,
  };

  const popoverButtonStyle = {
    width: "65px",
    height: "27px",
    fontSize: "9px",
    marginRight: "5px",
    marginTop: "10px",
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    try {
      const response = deleteProject(project.project_id);
      onProjectDeleted();
      messageApi.info("Project deleted successfully...");
    } catch (e) {
      messageApi.error(e.message);
    }
  };

  const delete_confirmation_popover = (
    <Popover id="popover-basic">
      <Popover.Header as="h6" style={{ fontSize: "12px" }}>
        Delete the Project
      </Popover.Header>
      <Popover.Body style={{ fontSize: "12px" }}>
        <Form onSubmit={handleSubmit}>
          <p>Are you sure, you want to delete this project?</p>

          <Button
            onClick={() => setShow(false)}
            type="button"
            style={popoverButtonStyle}
            variant="secondary"
          >
            Cancel
          </Button>
          <Button type="submit" style={popoverButtonStyle} variant="danger">
            Confirm
          </Button>
        </Form>
      </Popover.Body>
    </Popover>
  );

  return (
    <Card
      key={project.project_id}
      className="bg-white p-2 mb-2 rounded shadow"
      style={{ cursor: "pointer" }}
    >
      <Card.Header>
        <Row>
          <Col className="col-md-8">
            <p className="text-primary" style={{ fontSize: "12px" }}>
              <Link to={`/projects/${project.project_id}`}>
                <b>{project.project_name}</b>
              </Link>
            </p>
          </Col>
          <Col className="col-md-4 text-end">
            <Button
              className="no-focus"
              onClick={() => {
                setOpenFormModal(true);
                setMode("update");
                setFormInitialData({
                  id: project.project_id,
                  title: project.project_name,
                  description: project.description,
                  status: project.status,
                  deadline: project.deadline,
                });
              }}
              style={{
                border: "none",
                width: "15px",
                background: "none",
                color: "blue",
                fontSize: "15px",
              }}
            >
              <BsPencilSquare />
            </Button>
            <OverlayTrigger
              trigger="click"
              placement="top"
              show={show}
              overlay={delete_confirmation_popover}
            >
              <Button
                className="no-focus"
                style={{
                  border: "none",
                  width: "15px",
                  background: "none",
                  color: "red",
                  fontSize: "15px",
                }}
                onClick={() => setShow(true)}
              >
                <BsFillTrashFill />
              </Button>
            </OverlayTrigger>
          </Col>
        </Row>
      </Card.Header>
      <Card.Body style={{ fontSize: "11px" }}>
        <p>{trimContent(project.description, 150)}</p>
      </Card.Body>
      <Card.Footer className="text-muted">
        <Row>
          <Col className="col-md-8">
            <small>
              Created at {renderDatetimeToString(project.created_at)}
            </small>
          </Col>
          <Col className="col-md-4 text-end">{statusIcons[project.status]}</Col>
        </Row>
      </Card.Footer>
    </Card>
  );
}
