import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Tabs, Table, Avatar } from "antd";
import { Row, Col, Button } from "react-bootstrap";
import Image from "react-bootstrap/Image";
import api from "../services/api";
import Cookies from "js-cookie";

import UsersForm from "./UsersForm";

import { organizationsFetchService } from "../services/organizationServices";

export default function AccountTabs() {
  const { user, messageApi } = useContext(AuthContext);
  const [organizations, setOrganizations] = useState([]);
  const [organizationUsers, setOrganizationUsers] = useState({});
  const [openFormModal, setOpenFormModal] = useState(false);
  const [mode, setMode] = useState("create");
  const [formInitialData, setFormInitialData] = useState(null);

  const [selectedOrganization, setSelectedOrganization] = useState("");
  const token = Cookies.get("token");

  const onChange = (pagination, filters, sorter, extra) => {
    console.log("params", pagination, filters, sorter, extra);
  };

  const columns = [
    {
      title: "",
      dataIndex: "profile_image",
      render: (text) => {
        return <Avatar src={text} />;
      },
    },
    {
      title: "Username",
      dataIndex: "fullname",
      render: (text) => <>{text}</>,
      sorter: {
        compare: (a, b) => a.username - b.username,
      },
    },
    {
      title: "Email",
      dataIndex: "email",
      sorter: {
        compare: (a, b) => a.email - b.email,
      },
    },
    {
      title: "Job Title",
      dataIndex: "org_title",
    },
    {
      title: "Created At",
      dataIndex: "created_at",
    },
  ];

  const fetchOrganizations = async () => {
    try {
      const response = await organizationsFetchService();
      setOrganizations(response.data);
      setSelectedOrganization(response.data[0].org_id);
    } catch (e) {
      messageApi.error(e.message);
    }
  };

  const fetchOrganizationAccounts = async () => {
    try {
      const response = await api.get("/user/me/organization-users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrganizationUsers(response.data.organizations);
    } catch (e) {
      messageApi.error(e.message);
    }
  };

  useEffect(() => {
    fetchOrganizations();
    fetchOrganizationAccounts();
  }, [mode]);

  return (
    <>
      <UsersForm
        selectedOrganization={selectedOrganization}
        userID={user.user_id}
        openFormModal={openFormModal}
        setOpenFormModal={setOpenFormModal}
        setInitialUserData={setFormInitialData}
        setMode={setMode}
        messageApi={messageApi}
        reRenderUsers={fetchOrganizationAccounts}
      />
      <Row className="mt-5 mb-5">
        <Col
          style={{
            justifyContent: "center",
            alignItems: "center",
            alignContent: "center",
          }}
        >
          <h4 className="">Users</h4>
        </Col>
        <Col
          className="text-center"
          style={{
            justifyContent: "center",
            alignItems: "center",
            alignContent: "center",
          }}
        >
          <Button className="btn-sm" onClick={() => setOpenFormModal(true)}>
            Add New User
          </Button>
        </Col>
      </Row>
      <Tabs
        onTabClick={(e) => setSelectedOrganization(e)}
        items={organizations.map((organization) => {
          return {
            key: organization.org_id,
            children: (
              <>
                <Table
                  bordered={true}
                  columns={columns}
                  sortDirections={["ascend", "descend"]}
                  dataSource={organizationUsers[organization.org_id]}
                  onChange={onChange}
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
    </>
  );
}
