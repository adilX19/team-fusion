import { Row, Col } from "react-bootstrap";
import { Card } from "react-bootstrap";
import ProjectCard from "./ProjectCard";

const ProjectBoardView = ({
  projects,
  messageApi,
  onProjectDeleted,
  onProjectUpdated,
  setOpenFormModal,
  setMode,
  setFormInitialData,
}) => {
  const statuses = ["PLANNED", "IN_PROGRESS", "COMPLETED"];
  const grouped = statuses.map((status) => ({
    status,
    projects: projects ? projects.filter((p) => p.status === status) : [],
  }));

  return (
    <Row>
      {grouped.map(({ status, projects }) => (
        <Col key={status}>
          <Card>
            <Card.Body>
              <h5 className="font-bold text-center">
                {status.replace("_", " ")}
              </h5>
              <hr
                style={{
                  width: "35%",
                  border: "1px solid rgb(122, 121, 121)",
                  margin: "10px auto",
                }}
              />
              <br />
              {projects.map((project) => (
                <ProjectCard
                  key={project.project_id}
                  project={project}
                  messageApi={messageApi}
                  onProjectDeleted={onProjectDeleted}
                  onProjectUpdated={onProjectUpdated}
                  setOpenFormModal={setOpenFormModal}
                  setMode={setMode}
                  setFormInitialData={setFormInitialData}
                />
              ))}
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};
export default ProjectBoardView;
