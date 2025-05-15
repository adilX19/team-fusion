import api from "./api";
import Cookies from "js-cookie";

const token = Cookies.get("token");

export const fetchAssignees = (projectId, response_type = "just-ids") => {
  return api.get(
    `/assignments/projects/${projectId}?response_type=${response_type}`
  );
};

export const fetchTaskAssignees = (taskID, response_type = "just-ids") => {
  return api.get(`/assignments/tasks/${taskID}?response_type=${response_type}`);
};

export const assignEntity = (data, entityType) => {
  return api.post(`/assignments/assign-entity/${entityType}`, data);
};

export const deAssignEntity = (data, entityType) => {
  return api.post(`/assignments/de-assign-entity/${entityType}`, data);
};

export const fetchOwnedUsers = () => {
  return api.get("/admin/users/owned");
};

export const createNewUserAccount = (data) => {
  return api.post("/admin/create-user", data);
};

export const addUserToOrganization = (data) => {
  return api.post("/organizations/add-user", data);
};
