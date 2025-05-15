import React from "react";
import { Avatar, Tooltip } from "antd";

export default function UserAvatar({ user, title }) {
  return (
    <Tooltip title={user.firstname + " " + user.lastname} placement="top">
      {title ? title : ""}
      <Avatar
        style={{ cursor: "pointer" }}
        size={"medium"}
        src={user.profile_image}
      />
    </Tooltip>
  );
}
