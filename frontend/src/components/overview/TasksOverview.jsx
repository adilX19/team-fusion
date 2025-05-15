import React from "react";
import { Card } from "react-bootstrap";

export default function TaskOverview({ cardStyle }) {
  return (
    <>
      <b>Task Overview</b>
      <Card style={cardStyle}>
        <Card.Body></Card.Body>
      </Card>
    </>
  );
}
