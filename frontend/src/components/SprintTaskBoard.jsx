// src/components/SprintTaskBoard.jsx
import React, { useEffect, useState } from "react";
import { Row, Col, Card, Button, Typography, Spin } from "antd";
import TaskCard from "./TaskCard";
import CreateTaskModal from "./CreateTaskModal";
import { fetchTasksBySprints } from "../services/taskService";

const { Title } = Typography;

const STATUS_COLUMNS = ["TODO", "IN_PROGRESS", "IN_REVIEW", "COMPLETED"];

const SprintTaskBoard = ({ orgID, sprintId }) => {
  const [tasks, setTasks] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetchTasksBySprints(sprintId);
      setTasks(res.data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, [sprintId]);

  const tasksByStatus = STATUS_COLUMNS.reduce((acc, status) => {
    acc[status] = tasks.filter((task) => task.status === status);
    return acc;
  }, {});

  return (
    <>
      <Row justify="space-between" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={4}>Sprint Task Board</Title>
        </Col>
        <Col>
          <Button type="primary" onClick={() => setOpenModal(true)}>
            + New Task
          </Button>
        </Col>
      </Row>

      {loading ? (
        <Spin size="large" />
      ) : (
        <Row gutter={16}>
          {STATUS_COLUMNS.map((status) => (
            <Col key={status} span={6}>
              <Card
                title={status.replace("_", " ")}
                bordered={false}
                style={{ minHeight: "400px" }}
              >
                {tasksByStatus[status].map((task) => (
                  <TaskCard key={task.task_id} task={task} />
                ))}
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <CreateTaskModal
        orgID={orgID}
        sprintId={sprintId}
        visible={openModal}
        onCancel={() => setOpenModal(false)}
        onCreated={() => {
          setOpenModal(false);
          fetchTasks();
        }}
      />
    </>
  );
};

export default SprintTaskBoard;
