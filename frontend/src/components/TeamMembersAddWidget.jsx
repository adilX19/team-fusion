import React, { useState, useEffect } from "react";
import { Select, Divider } from "antd";

export default function TeamMembersAddWidget({
  selectedOptions,
  setSelectedOptions,
  availableOptions,
  teamLead
}) {
  return (
    <>
      Team Members:{" "}
      <Select
        mode="multiple"
        style={{ width: "100%" }}
        placeholder="Add Team Members..."
        onChange={(newSelection) => setSelectedOptions(newSelection)}
        value={selectedOptions}
        optionLabelProp="label"
      >
        {availableOptions
          .filter(
            (user) => user?.user_id !== null && user?.user_id !== undefined
          ).filter((user) => user.user_id != teamLead)
          .map((user) => (
            <Option
              key={user.user_id}
              value={user.user_id}
              label={user.firstname + " " + user.lastname}
            >
              👤 {user.firstname + " " + user.lastname}
            </Option>
          ))}
      </Select>
      <Divider />
    </>
  );
}
