import React from "react";
import { Row, Col, Button } from "react-bootstrap";
import TeamsCard from "./TeamsCard";
import TeamsForm from "../pages/teams/TeamsForm";

export default function TeamsGrid({
  teams,
  title = "Teams",
  openFormModal,
  setOpenFormModal,
  selectedOrganization,
  userID,
  mode,
  setMode,
  formInitialData,
  setFormInitialData,
  messageApi,
  rerenderOnAddedORUpdated,
}) {
  return (
    <>
      <Row className="mt-5 mb-5">
        <Col
          style={{
            justifyContent: "center",
            alignItems: "center",
            alignContent: "center",
          }}
        >
          <h4>{title}</h4>
        </Col>
        <Col
          className="text-center"
          style={{
            justifyContent: "center",
            alignItems: "center",
            alignContent: "center",
          }}
        >
          <Button onClick={() => setOpenFormModal(true)} className="btn-sm">
            Add New Team
          </Button>
        </Col>
      </Row>
      <TeamsForm
        selectedOrganization={selectedOrganization}
        userID={userID}
        openFormModal={openFormModal}
        setOpenFormModal={setOpenFormModal}
        setInitialTeamData={setFormInitialData}
        initialTeamData={formInitialData}
        messageApi={messageApi}
        mode={mode}
        setMode={setMode}
        rerenderOnAddedORUpdated={rerenderOnAddedORUpdated}
      />
      <Row>
        {teams.map((team) => {
          return (
            <Col xs={6} md={5} key={team.team_id}>
              <TeamsCard
                team={team}
                setInitialTeamData={setFormInitialData}
                setMode={setMode}
                setOpenFormModal={setOpenFormModal}
                rerenderOnDeleted={rerenderOnAddedORUpdated}
              />
            </Col>
          );
        })}
      </Row>
    </>
  );
}
