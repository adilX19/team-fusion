import React from "react";
import { Card } from "react-bootstrap";

export default function ScheduleCard({ cardStyle }) {
  return (
    <>
      <b>Meetings Scheduled this Week</b>
      <Card style={cardStyle}>
        <Card.Body></Card.Body>
      </Card>
    </>
  );
}
