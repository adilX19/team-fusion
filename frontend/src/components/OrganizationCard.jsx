import React, { useState } from "react";
import Card from "react-bootstrap/Card";
import { Row, Col, Button } from "react-bootstrap";
import Image from "react-bootstrap/Image";
import { trimContent } from "../utils/helperfunctions";

import { BsPencilSquare, BsFillTrashFill } from "react-icons/bs";
import UserAvatar from "./UserAvatar";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Popover from "react-bootstrap/Popover";
import Form from "react-bootstrap/Form";

import { deleteOrganization } from "../services/organizationServices";

export default function OrganizationCard({
  organization,
  rerenderOnDeleted,
  setMode,
  setInitialOrganizationData,
  messageApi,
  setOpenFormModal,
}) {
  const { logo, org_name, description, created } = organization;
  const [show, setShow] = useState(false);

  const popoverButtonStyle = {
    width: "65px",
    height: "27px",
    fontSize: "9px",
    marginRight: "5px",
    marginTop: "10px",
  };

  const cardStyle = {
    boxShadow:
      "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px",
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    try {
      const response = deleteOrganization(organization.org_id);
      rerenderOnDeleted();
      messageApi.info("Team deleted successfully...");
    } catch (e) {
      messageApi.error(e.message);
    }
  };

  const delete_confirmation_popover = (
    <Popover id="popover-basic">
      <Popover.Header as="h6" style={{ fontSize: "12px" }}>
        Delete this Organization
      </Popover.Header>
      <Popover.Body style={{ fontSize: "12px" }}>
        <Form onSubmit={handleSubmit}>
          <p>Are you sure, you want to delete this Organization?</p>

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
    <Card className="100vh mb-4" style={cardStyle}>
      <Card.Body>
        <Row>
          <Col md={4} className="text-center">
            {logo && (
              <div style={{ marginBottom: "10px" }}>
                <img
                  src={logo.replace(/\\/g, "/")}
                  alt="Current Logo"
                  style={{
                    height: "40px",
                    objectFit: "contain",
                    borderRadius: "8px",
                    marginTop: "30px",
                  }}
                />
              </div>
            )}
          </Col>
          <Col>
            <p
              className="mt-1 text-left"
              style={{ fontSize: "15px", fontWeight: "bold" }}
            >
              {org_name}
            </p>
            <p>{trimContent(description, 60)}</p>

            <div className="text-end">
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
                  setInitialOrganizationData({
                    orgID: organization.org_id,
                    orgName: organization.org_name,
                    logo: organization.logo,
                    description: organization.description,
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
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}
