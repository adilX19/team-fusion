import api from "./api";

export const fetchTasksBySprints = (sprintID) => {
  return api.get(`/tasks/list/sprints/${sprintID}`);
};

export const fetchSubTasksByTasks = (taskID) => {
  return api.get(`/tasks/${taskID}/subtasks`);
};

export const createNewTaskInSprint = (sprintID, data) => {
  return api.post(`/tasks/sprints/${sprintID}/create`, data);
};

export const createNewSubTaskInTask = (taskID, data) => {
  return api.post(`/tasks/${taskID}/subtasks/create`, data);
};
