// src/components/OrgSelector.jsx
import React from "react";
import { Select } from "antd";

const OrgSelector = ({ orgs, selectedOrg, onSelect }) => {
  return (
    <Select
      style={{ width: "100%" }}
      placeholder="Select Organization"
      value={selectedOrg}
      onChange={onSelect}
    >
      {orgs.map((org) => (
        <Select.Option key={org.org_id} value={org.org_id}>
          {org.org_name}
        </Select.Option>
      ))}
    </Select>
  );
};

export default OrgSelector;
