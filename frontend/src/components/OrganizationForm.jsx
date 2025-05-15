import React, { useState, useEffect } from "react";
import { Row, Col, Form } from "react-bootstrap";
import { Flex, Modal } from "antd";
import {
  createNewOrganization,
  updateOrganization,
} from "../services/organizationServices";

export default function OrganizationForm({
  openFormModal,
  setOpenFormModal,
  setInitialOrganizationData,
  initialOrganizationData = null,
  rerenderOrganizations,
  setMode,
  messageApi,
  mode = "create",
}) {
  const [orgID, setOrgID] = useState(null);
  const [orgName, setOrgName] = useState("");
  const [logo, setLogo] = useState(null);
  const [description, setDescription] = useState("");
  const [existingLogoUrl, setExistingLogoUrl] = useState("");

  useEffect(() => {
    if (initialOrganizationData && mode == "update") {
      console.log("Inital Data found", initialOrganizationData);
      setOrgID(initialOrganizationData.orgID);
      setOrgName(initialOrganizationData.orgName);
      setExistingLogoUrl(initialOrganizationData.logo || "");
      setDescription(initialOrganizationData.description);
    }
  }, [mode]);

  const createOrganization = async (payload) => {
    try {
      const response = await createNewOrganization(payload);
      rerenderOrganizations();
    } catch (e) {
      messageApi.error(e.message);
    }
  };

  const updateExistingOrganization = async (payload) => {
    try {
      const response = await updateOrganization(orgID, payload);
      rerenderOrganizations();
    } catch (e) {
      messageApi.error(e.message);
    }
  };

  const handleSubmit = () => {
    const payload = {
      org_name: orgName,
      description: description,
      logo: logo,
      existingLogoUrl: logo ? null : existingLogoUrl,
    };

    mode == "create"
      ? createOrganization(payload)
      : updateExistingOrganization(payload);

    mode == "create"
      ? messageApi.success("Organization Created successfully...")
      : messageApi.info("Organization Updated successfully...");

    clearInput();
    setInitialOrganizationData(null);
    setMode("create");
  };

  const clearInput = () => {
    setOrgID(null);
    setOrgName("");
    setExistingLogoUrl("");
    setDescription("");
  };

  return (
    <Flex>
      <Modal
        title="Register New Organization"
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
          setInitialOrganizationData(null);
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
          <Form.Group className="mt-3 mb-3">
            <Form.Label>Organization Name</Form.Label>
            <Form.Control
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="IBM, Netflix, Facebook..."
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as={"textarea"}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Agenda of the team..."
            ></Form.Control>
          </Form.Group>

          <Form.Group controlId="formFile" className="mb-3">
            <Form.Label>Upload Organization Logo</Form.Label>
            {existingLogoUrl && !logo && (
              <div style={{ marginBottom: "10px" }}>
                <img
                  src={existingLogoUrl}
                  alt="Current Logo"
                  style={{
                    height: "80px",
                    objectFit: "contain",
                    borderRadius: "8px",
                  }}
                />
              </div>
            )}
            <Form.Control
              type="file"
              accept="image/*"
              onChange={(e) => setLogo(e.target.files[0])}
            />
          </Form.Group>
        </Form>
      </Modal>
    </Flex>
  );
}
