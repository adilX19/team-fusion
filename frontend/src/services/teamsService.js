import api from "./api";
import Cookies from "js-cookie";

const token = Cookies.get("token");

export const fetchAllTeamsByOrganization = (userRole) => {
  if (userRole == "OWNER" || userRole == "ADMIN") {
    return api.get("/teams/all");
  }
  // otherwise we will only show him/her the teams he is part of.
  return api.get("/teams/by/membership");
};

export const createNewTeam = (data) => {
  return api.post("/teams/add-new", data);
};

export const updateTeam = (teamID, data) => {
  return api.put(`/teams/${teamID}/update`, data);
};

export const deleteTeam = (teamID) => {
  return api.delete(`/teams/${teamID}/delete`);
};

export const addMember = (teamID, data) => {
  return api.post(`/teams/${teamID}/add-members`, data);
};

export const deleteMember = (teamID, data) => {
  return api.post(`/teams/${teamID}/remove-members`, data);
};
