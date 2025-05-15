import React from "react";
import { Card } from "react-bootstrap";

export default function NotificationsOverview({ cardStyle }) {
  return (
    <>
      <b>Latest Notifications</b>
      <Card style={cardStyle}>
        <Card.Body></Card.Body>
      </Card>
    </>
  );
}
