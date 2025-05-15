import api from "./api";
import Cookies from "js-cookie";

const token = Cookies.get("token");

export const fetchAllProjects = () =>
  api.get(`/projects/all`, {
    headers: { Authorization: `Bearer ${token}` },
  });
export const fetchProjectsByOrg = (orgId) =>
  api.get(`/projects/organization/${orgId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
export const fetchProjectDetails = (projectId) =>
  api.get(`/projects/${projectId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
export const createProject = (data) =>
  api.post(`/projects/add-new`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
export const updateProject = (projectId, data) =>
  api.put(`/projects/${projectId}/update`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
export const deleteProject = (projectId) =>
  api.delete(`/projects/${projectId}/delete`, {
    headers: { Authorization: `Bearer ${token}` },
  });
