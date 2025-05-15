import React, { useState, useContext, useEffect } from "react";
import OrganizationCard from "./OrganizationCard";
import { Row, Col, Button } from "react-bootstrap";
import OrganizationForm from "./OrganizationForm";
import { AuthContext } from "../context/AuthContext";

export default function OrganizationsGrid({
  organizations,
  rerenderOrganizations,
}) {
  const { messageApi, user } = useContext(AuthContext);
  const [openFormModal, setOpenFormModal] = useState(false);
  const [mode, setMode] = useState("create");
  const [initialFormData, setInitialFormData] = useState(null);

  useEffect(() => {
    rerenderOrganizations();
  }, [mode]);

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
          <h4 className="">Organizations</h4>
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
            Add New Organization
          </Button>
        </Col>
      </Row>
      <OrganizationForm
        openFormModal={openFormModal}
        setOpenFormModal={setOpenFormModal}
        setInitialOrganizationData={setInitialFormData}
        initialOrganizationData={initialFormData}
        rerenderOrganizations={rerenderOrganizations}
        mode={mode}
        setMode={setMode}
        messageApi={messageApi}
      />
      <Row>
        {organizations.map((organization) => {
          return (
            <Col xs={6} md={5} key={organization.org_id}>
              <OrganizationCard
                organization={organization}
                setOpenFormModal={setOpenFormModal}
                rerenderOnDeleted={rerenderOrganizations}
                setMode={setMode}
                setInitialOrganizationData={setInitialFormData}
                messageApi={messageApi}
              />
            </Col>
          );
        })}
      </Row>
    </>
  );
}
