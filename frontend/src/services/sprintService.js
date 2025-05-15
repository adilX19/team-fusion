import api from "./api";

export const fetchSprintByProject = (projectID) => {
  return api.get(`/sprints/projects/${projectID}/`);
};

export const createNewSprintInProject = (projectID, data) => {
  return api.post(`/sprints/projects/${projectID}/create`, data);
};
