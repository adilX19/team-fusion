import React, { useState, useEffect, useContext } from "react";
import { fetchAllProjects } from "../../services/projectsService";
import ProjectBoardView from "./ProjectBoardView";
import ProjectListView from "./ProjectListView";
import ProjectForm from "./projectForm";
import { AuthContext } from "../../context/AuthContext";

import { organizationsFetchService } from "../../services/organizationServices";

import { Tabs } from "antd";
import { Row, Col } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Image from "react-bootstrap/Image";

import { UnorderedListOutlined } from "@ant-design/icons";
import { BsClipboard2Data, BsFileEarmarkPlus } from "react-icons/bs";

const ProjectsPage = () => {
  const [organizations, setOrganizations] = useState([]);
  const [activeView, setActiveView] = useState("board");
  const [selectedOrganization, setSelectedOrganization] = useState();
  const { user, messageApi } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [viewMode, setViewMode] = useState("board"); // 'board' or 'list'
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("create");
  const [formInitialData, setFormInitialData] = useState(null);

  const [openFormModal, setOpenFormModal] = useState(false);

  useEffect(() => {
    fetchOrganizations();
    handleProjectsRerender();
  }, []);

  const handleProjectsRerender = () => {
    fetchAllProjects()
      .then((res) => setProjects(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const fetchOrganizations = async () => {
    try {
      const response = await organizationsFetchService();
      setOrganizations(response.data);
      setSelectedOrganization(response.data[0].org_id);
    } catch (e) {
      messageApi.error(e.message);
    }
  };

  return (
    <div className="p-4">
      <div>
        <Row>
          <Col className="col-md-8">
            <h1 className="text-2xl font-bold mb-5">Projects</h1>
          </Col>
          <Col className="col-md-4 text-end">
            <ButtonGroup aria-label="Basic example">
              <Button
                onClick={() => {
                  setViewMode("list");
                  setActiveView("list");
                }}
                className={
                  activeView == "list" ? "active no-focus" : "no-focus"
                }
                variant="secondary"
              >
                <UnorderedListOutlined /> List
              </Button>
              <Button
                onClick={() => {
                  setViewMode("board");
                  setActiveView("board");
                }}
                className={
                  activeView == "board" ? "active no-focus" : "no-focus"
                }
                variant="secondary"
              >
                <BsClipboard2Data /> Board
              </Button>
            </ButtonGroup>
          </Col>
        </Row>
      </div>

      <Row
        className="w-50 ms-auto"
        style={{ position: "relative", top: "65px", zIndex: "1" }}
      >
        <Button
          className="btn-sm ms-auto"
          type="button"
          style={{ width: "200px" }}
          onClick={() => setOpenFormModal(true)}
        >
          <BsFileEarmarkPlus /> Add New Project
        </Button>
      </Row>

      {/* MODAL FOR CREATING NEW PROJECT */}
      <ProjectForm
        openFormModal={openFormModal}
        setOpenFormModal={setOpenFormModal}
        selectedOrganization={selectedOrganization}
        setInitialProjectData={setFormInitialData}
        setMode={setMode}
        userID={user.user_id}
        messageApi={messageApi}
        onProjectCreatedOrUpdated={handleProjectsRerender}
        initialProjectData={formInitialData}
        mode={mode}
      />

      <Tabs
        onTabClick={(e) => setSelectedOrganization(e)}
        items={organizations.map((organization) => {
          return {
            key: organization.org_id,
            children: (
              <>
                {loading ? (
                  <p>Loading...</p>
                ) : viewMode === "list" ? (
                  <ProjectListView projects={projects[selectedOrganization]} />
                ) : (
                  <ProjectBoardView
                    projects={projects[selectedOrganization]}
                    setProjects={setProjects}
                    messageApi={messageApi}
                    onProjectDeleted={handleProjectsRerender}
                    onProjectUpdated={handleProjectsRerender}
                    setOpenFormModal={setOpenFormModal}
                    setMode={setMode}
                    setFormInitialData={setFormInitialData}
                  />
                )}
              </>
            ),
            icon: (
              <Image
                src={organization.logo}
                style={{
                  width: "60px",
                  height: "60px",
                  objectFit: "contain",
                }}
                rounded
              />
            ),
          };
        })}
      />
    </div>
  );
};

export default ProjectsPage;
