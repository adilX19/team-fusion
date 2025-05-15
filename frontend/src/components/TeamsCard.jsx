import React, { useEffect, useState, useContext } from "react";
import { Row, Col, Button } from "react-bootstrap";
import Card from "react-bootstrap/Card";
import Image from "react-bootstrap/Image";
import api from "../services/api";
import Cookies from "js-cookie";

import UserAvatar from "./UserAvatar";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Popover from "react-bootstrap/Popover";
import Form from "react-bootstrap/Form";

import { BsPencilSquare, BsFillTrashFill } from "react-icons/bs";
import { Avatar, Tooltip } from "antd";
import { renderDatetimeToString } from "../utils/helperfunctions";
import { AuthContext } from "../context/AuthContext";

import { deleteTeam } from "../services/teamsService";

export default function TeamsCard({
  team,
  setInitialTeamData,
  setMode,
  setOpenFormModal,
  rerenderOnDeleted,
}) {
  const { messageApi } = useContext(AuthContext);
  const [teamLead, setTeamLead] = useState(null);
  const [show, setShow] = useState(false);
  const token = Cookies.get("token");

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
      const response = deleteTeam(team.team_id);
      rerenderOnDeleted();
      messageApi.info("Team deleted successfully...");
    } catch (e) {
      messageApi.error(e.message);
    }
  };

  const delete_confirmation_popover = (
    <Popover id="popover-basic">
      <Popover.Header as="h6" style={{ fontSize: "12px" }}>
        Delete this Team
      </Popover.Header>
      <Popover.Body style={{ fontSize: "12px" }}>
        <Form onSubmit={handleSubmit}>
          <p>Are you sure, you want to delete this Team?</p>

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
  const fetchTeamLead = async (user_id) => {
    try {
      const response = await api.get(`/admin/users/${user_id}`);
      setTeamLead(response.data);
    } catch (e) {
      messageApi.error(e.message);
    }
  };

  useEffect(() => {
    if (team.team_lead) {
      fetchTeamLead(team.team_lead);
    }
  }, [team]);

  const cardStyle = {
    boxShadow:
      "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px",
  };
  return (
    <>
      <Card className="100vh mb-4" style={cardStyle}>
        <Card.Body>
          <Row>
            <Col>
              <b style={{ fontSize: "17px" }}>{team.team_name}</b>
              <p className="text-muted" style={{ fontSize: "12px" }}>
                {team.team_description}
              </p>
            </Col>
            <Col md={4} className="text-end">
              <Image
                src={team.logo}
                style={{
                  width: "90px",
                  height: "90px",
                  objectFit: "contain",
                  opacity: "0.6",
                }}
                rounded
              />
            </Col>
          </Row>

          <Row>
            <Col className="col-md-9">
              <Avatar.Group
                size="medium"
                max={{
                  count: 3,
                  style: {
                    color: "#f56a00",
                    backgroundColor: "#fde3cf",
                    cursor: "pointer",
                  },
                  popover: { trigger: "click" },
                }}
              >
                {team.members.map((member_data) => {
                  if (member_data.user_id == team.team_lead) {
                    return;
                  }
                  return (
                    <UserAvatar key={member_data.user_id} user={member_data} />
                  );
                })}
              </Avatar.Group>
            </Col>
            <Col className="col-md-3 text-center">
              <Button
                className="no-focus"
                style={{
                  border: "none",
                  width: "15px",
                  background: "none",
                  color: "blue",
                  marginTop: "10px",
                  fontSize: "20px",
                }}
                onClick={() => {
                  setOpenFormModal(true);
                  setMode("update");
                  setInitialTeamData({
                    teamID: team.team_id,
                    teamName: team.team_name,
                    description: team.team_description,
                    teamLeadID: team.team_lead,
                    selectedMembers: team.members,
                  });
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
                    marginTop: "10px",
                    marginLeft: "0.2rem",
                    fontSize: "20px",
                  }}
                  onClick={() => setShow(true)}
                >
                  <BsFillTrashFill />
                </Button>
              </OverlayTrigger>
            </Col>
          </Row>
        </Card.Body>
        <Card.Footer>
          <Row>
            <Col className="col-md-6">
              Created: {renderDatetimeToString(team.created_at)}
            </Col>
            <Col className="col-md-6 text-end">
              {teamLead ? (
                <UserAvatar
                  key={teamLead.user_id}
                  user={teamLead}
                  title={"Team Lead: "}
                />
              ) : (
                ""
              )}
            </Col>
          </Row>
        </Card.Footer>
      </Card>
    </>
  );
}
