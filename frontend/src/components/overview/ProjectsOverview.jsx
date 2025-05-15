import React from "react";
import { Card } from "react-bootstrap";

export default function ProjectsOverview({ cardStyle }) {
  return (
    <>
      <b>Projects Overview</b>
      <Card style={cardStyle}>
        <Card.Body></Card.Body>
      </Card>
    </>
  );
}
