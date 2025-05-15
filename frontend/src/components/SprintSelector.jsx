// src/components/SprintSelector.jsx
import React from "react";
import { Select } from "antd";

const SprintSelector = ({ sprints, selectedSprint, onSelect, disabled }) => {
  return (
    <Select
      style={{ width: "100%" }}
      placeholder="Select Sprint"
      value={selectedSprint}
      onChange={onSelect}
      disabled={disabled}
    >
      {sprints.map((sprint) => (
        <Select.Option key={sprint.sprint_id} value={sprint.sprint_id}>
          {sprint.sprint_name}
        </Select.Option>
      ))}
    </Select>
  );
};

export default SprintSelector;
