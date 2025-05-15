import React from "react";
import { Card } from "react-bootstrap";

export default function TaskCompletionRate({ cardStyle }) {
  return (
    <>
      <b>Task Completion Graph</b>
      <Card style={cardStyle}>
        <Card.Body></Card.Body>
      </Card>
    </>
  );
}
