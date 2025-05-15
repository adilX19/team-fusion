import React from "react";
import { Card } from "react-bootstrap";

export default function OrganizationsOverview({ cardStyle }) {
  return (
    <>
      <b>Registered Organizations</b>
      <Card style={cardStyle}>
        <Card.Body></Card.Body>
      </Card>
    </>
  );
}
