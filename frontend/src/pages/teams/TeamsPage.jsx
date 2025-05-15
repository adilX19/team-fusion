import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Row, Col } from "react-bootstrap";
import { Tabs } from "antd";
import Image from "react-bootstrap/Image";
import TeamsGrid from "../../components/TeamsGrid";

import { organizationsFetchService } from "../../services/organizationServices";
import { fetchAllTeamsByOrganization } from "../../services/teamsService";

export default function TeamsPage() {
  const { messageApi, user } = useContext(AuthContext);

  const [organizations, setOrganizations] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedOrganization, setSelectedOrganization] = useState();
  const [openFormModal, setOpenFormModal] = useState(false);
  const [mode, setMode] = useState("create");
  const [formInitialData, setFormInitialData] = useState(null);

  useEffect(() => {
    fetchOrganizations();
    fetchUserTeams();
  }, []);

  const fetchUserTeams = async () => {
    try {
      const response = await fetchAllTeamsByOrganization(user.role);
      setTeams(response.data);
    } catch (e) {
      messageApi.error(e.message);
    }
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
            <h1 className="text-2xl font-bold mb-5">Teams</h1>
          </Col>
          <Col className="col-md-4 text-end"></Col>
        </Row>

        <Tabs
          onTabClick={(e) => setSelectedOrganization(e)}
          items={organizations.map((organization) => {
            return {
              key: organization.org_id,
              children: (
                <>
                  <TeamsGrid
                    teams={teams.filter(
                      (team) => team.org_id == selectedOrganization
                    )}
                    title={"Teams by Organization"}
                    openFormModal={openFormModal}
                    setOpenFormModal={setOpenFormModal}
                    selectedOrganization={selectedOrganization}
                    userID={user.user_id}
                    mode={mode}
                    setMode={setMode}
                    formInitialData={formInitialData}
                    setFormInitialData={setFormInitialData}
                    messageApi={messageApi}
                    rerenderOnAddedORUpdated={fetchUserTeams}
                  />
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
    </div>
  );
}
