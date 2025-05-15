import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  Descriptions,
  Tag,
  Button,
  List,
  Select,
  Modal,
  Form,
  Input,
  DatePicker,
  Avatar,
  message,
} from "antd";
import api from "../../services/api";
import moment from "moment";
import UserAvatar from "../../components/UserAvatar";

import { fetchProjectDetails } from "../../services/projectsService";
import {
  fetchSprintByProject,
  createNewSprintInProject,
} from "../../services/sprintService";
import { fetchAssignees } from "../../services/assigneesService";

const { RangePicker } = DatePicker;

const statusColors = {
  PLANNED: "blue",
  IN_PROGRESS: "gold",
  IN_REVIEW: "purple",
  COMPLETED: "green",
};

const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [projectAssignees, setProjectAssignees] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form] = Form.useForm();

  useEffect(() => {
    fetchProject();
    fetchSprints();
    fetchProjectAssignees();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const res = await fetchProjectDetails(projectId);
      setProject(res.data);
    } catch (err) {
      message.error("Failed to load project details.");
    }
  };

  const fetchProjectAssignees = async () => {
    try {
      const res = await fetchAssignees(projectId, "full-data");
      setProjectAssignees(res.data);
    } catch (err) {
      message.error(err.message);
    }
  };

  const fetchSprints = async () => {
    try {
      const res = await fetchSprintByProject(projectId);
      setSprints(res.data);
    } catch (err) {
      message.error("Failed to load sprints.");
    }
  };

  const handleCreateSprint = async (values) => {
    try {
      setLoading(true);
      const [startDate, endDate] = values.dateRange;
      const res = await createNewSprintInProject(projectId, {
        sprint_name: values.sprint_name,
        start_date: startDate.format("YYYY-MM-DD"),
        end_date: endDate.format("YYYY-MM-DD"),
        status: values.status || "PLANNED", // explicitly set or fallback
      });
      message.success("Sprint created successfully.");
      setShowModal(false);
      form.resetFields();
      fetchSprints();
    } catch (err) {
      message.error("Failed to create sprint.");
    } finally {
      setLoading(false);
    }
  };

  if (!project) return <p>Loading project...</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <Card
        title="Project Details"
        bordered={false}
        style={{ marginBottom: 20 }}
      >
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Name">
            {project.project_name}
          </Descriptions.Item>
          <Descriptions.Item label="Description">
            {project.description}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={statusColors[project.status] || "default"}>
              {project.status}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Deadline">
            {project.deadline
              ? moment(project.deadline).format("YYYY-MM-DD")
              : "Not set"}
          </Descriptions.Item>
          <Descriptions.Item label="Assignees">
            <Avatar.Group
              size="medium"
              max={{
                count: 3,
                style: {
                  color: "#f56a00",
                  backgroundColor: "#fde3cf",
                  cursor: "pointer",
                },
                popover: { trigger: "click" },
              }}
            >
              {projectAssignees.map((assignee) => {
                return <UserAvatar key={assignee.user_id} user={assignee} />;
              })}
            </Avatar.Group>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card
        title="Sprints"
        extra={
          <Button type="primary" onClick={() => setShowModal(true)}>
            Create Sprint
          </Button>
        }
      >
        <List
          itemLayout="horizontal"
          dataSource={sprints}
          locale={{ emptyText: "No sprints created yet." }}
          renderItem={(sprint) => (
            <List.Item>
              <List.Item.Meta
                title={sprint.sprint_name}
                description={`From ${moment(sprint.start_date).format(
                  "YYYY-MM-DD"
                )} to ${moment(sprint.end_date).format("YYYY-MM-DD")}`}
              />
              <Tag color={statusColors[sprint.status] || "default"}>
                {sprint.status}
              </Tag>
            </List.Item>
          )}
        />
      </Card>

      <Modal
        title="Create New Sprint"
        visible={showModal}
        onCancel={() => setShowModal(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleCreateSprint}>
          <Form.Item
            label="Sprint Name"
            name="sprint_name"
            rules={[{ required: true, message: "Please enter a sprint name" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="status" label="Status" initialValue="PLANNED">
            <Select>
              <Select.Option value="PLANNED">Planned</Select.Option>
              <Select.Option value="IN_PROGRESS">In Progress</Select.Option>
              <Select.Option value="IN_REVIEW">In Review</Select.Option>
              <Select.Option value="COMPLETED">Completed</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Date Range"
            name="dateRange"
            rules={[{ required: true, message: "Please select a date range" }]}
          >
            <RangePicker />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Create Sprint
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProjectDetailPage;
