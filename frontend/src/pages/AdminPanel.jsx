import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import Cookies from "js-cookie";

import { organizationsFetchService } from "../services/organizationServices";

import { Container, Row, Col } from "react-bootstrap";

// Components import
import OrganizationsGrid from "../components/OrganizationsGrid";
import TeamsGrid from "../components/TeamsGrid";
import AccountTabs from "../components/AccountTabs";

export default function AdminPanel() {
  const { user, messageApi } = useContext(AuthContext);
  const token = Cookies.get("token");

  const [organizations, setOrganizations] = useState([]);
  const [teams, setTeams] = useState([]);

  if (!user?.is_superuser) {
    return <h5>FORBIDDEN ACCESS...</h5>;
  }

  useEffect(() => {
    fetchOrganizations();
    fetchTeams();
    fetchAccounts();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const response = await organizationsFetchService();
      setOrganizations(response.data);
      console.log("Organizations Re-rendered");
    } catch (e) {
      messageApi.error(e.message);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await api.get("/teams/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(response.data);
      setTeams(response.data);
    } catch (e) {
      messageApi.error(e.message);
    }
  };

  const fetchAccounts = async () => {};

  return (
    <Container>
      <h1>Welcome to Admin Panel</h1>

      <OrganizationsGrid
        organizations={organizations}
        rerenderOrganizations={fetchOrganizations}
      />

      <hr
        style={{
          width: "70%",
          border: "1px solid rgb(119, 116, 116)",
          margin: "50px 0 0 5%",
        }}
      />

      <TeamsGrid teams={teams} />

      <hr
        style={{
          width: "70%",
          border: "1px solid rgb(119, 116, 116)",
          margin: "50px 0 0 5%",
        }}
      />

      <AccountTabs />
    </Container>
  );
}
