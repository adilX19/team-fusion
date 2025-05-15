import api from "./api";
import Cookies from "js-cookie";

export const organizationsFetchService = async () => {
  const token = Cookies.get("token");
  return await api.get("/user/me/organizations", {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const fetchUsersList = (orgID) => {
  const token = Cookies.get("token");
  return api.get(`/user/list/${orgID}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const fetchTeams = (orgID) => {
  const token = Cookies.get("token");
  return api.get(`/teams/organization/${orgID}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const fetchOrganizationMembers = (orgID) => {
  return api.get(`/organizations/${orgID}/users`);
};

export const createNewOrganization = (data) => {
  return api.post("/organizations/new", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const updateOrganization = (orgID, data) => {
  return api.put(`/organizations/update/${orgID}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const deleteOrganization = (orgID) => {
  return api.delete(`/organizations/delete/${orgID}`);
};
