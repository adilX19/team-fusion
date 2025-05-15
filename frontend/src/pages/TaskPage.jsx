// src/pages/TaskPage.jsx
import React, { useEffect, useState } from "react";
import { Layout, Typography, Divider, Spin, Row, Col } from "antd";
import OrgSelector from "../components/OrgSelector";
import ProjectSelector from "../components/ProjectSelector";
import SprintSelector from "../components/SprintSelector";
import SprintTaskBoard from "../components/SprintTaskBoard";
import { organizationsFetchService } from "../services/organizationServices";
import { fetchProjectsByOrg } from "../services/projectsService";
import { fetchSprintByProject } from "../services/sprintService";

const { Content } = Layout;
const { Title } = Typography;

const TaskPage = () => {
  const [orgs, setOrgs] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(null);

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  const [sprints, setSprints] = useState([]);
  const [selectedSprint, setSelectedSprint] = useState(null);

  const [loading, setLoading] = useState(true);

  // Fetch organizations (user-specific)
  useEffect(() => {
    async function fetchOrgs() {
      setLoading(true);
      try {
        const res = await organizationsFetchService();
        setSelectedProject(null);
        setSelectedSprint(null);
        setOrgs(res.data);
      } catch (err) {
        console.error("Error fetching orgs:", err);
      }
      setLoading(false);
    }
    fetchOrgs();
    console.log("Organizations re-fetched");
  }, [selectedOrg]);

  // Fetch projects for selected org
  useEffect(() => {
    async function fetchProjects() {
      setLoading(true);
      try {
        const res = await fetchProjectsByOrg(selectedOrg);
        setSelectedSprint(null);
        setProjects(res.data);
        console.log("Projects Fetched");
      } catch (err) {
        console.error("Error fetching projects:", err);
      }
      setLoading(false);
    }
    fetchProjects();
  }, [selectedOrg, selectedProject]);

  // Fetch sprints for selected project
  useEffect(() => {
    if (!selectedProject) return;
    async function fetchSprints() {
      setLoading(true);
      try {
        const res = await fetchSprintByProject(selectedProject);
        setSprints(res.data);
      } catch (err) {
        console.error("Error fetching sprints:", err);
      }
      setLoading(false);
    }
    fetchSprints();
  }, [selectedProject]);

  return (
    <Layout style={{ padding: "2rem", background: "white" }}>
      <Content>
        <Title level={1} className="mb-5">
          <b>Tasks & Sprints</b>
        </Title>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <OrgSelector
              orgs={orgs}
              selectedOrg={selectedOrg}
              onSelect={setSelectedOrg}
            />
          </Col>
          <Col xs={24} sm={8}>
            <ProjectSelector
              projects={projects}
              selectedProject={selectedProject}
              onSelect={setSelectedProject}
              disabled={!selectedOrg}
            />
          </Col>
          <Col xs={24} sm={8}>
            <SprintSelector
              sprints={sprints}
              selectedSprint={selectedSprint}
              onSelect={setSelectedSprint}
              disabled={!selectedProject}
            />
          </Col>
        </Row>

        <Divider />

        {loading ? (
          <Spin size="large" />
        ) : selectedSprint ? (
          <SprintTaskBoard orgID={selectedOrg} sprintId={selectedSprint} />
        ) : (
          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <p>Please select a sprint to view tasks.</p>
          </div>
        )}
      </Content>
    </Layout>
  );
};

export default TaskPage;
