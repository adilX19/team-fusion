// src/components/ProjectSelector.jsx
import React from "react";
import { Select } from "antd";

const ProjectSelector = ({ projects, selectedProject, onSelect, disabled }) => {
  return (
    <Select
      style={{ width: "100%" }}
      placeholder="Select Project"
      value={selectedProject}
      onChange={onSelect}
      disabled={disabled}
    >
      {projects.map((project) => (
        <Select.Option key={project.project_id} value={project.project_id}>
          {project.project_name}
        </Select.Option>
      ))}
    </Select>
  );
};

export default ProjectSelector;
