// src/components/CreateTaskModal.jsx
import React, { useEffect, useState, useContext } from "react";
import { Modal, Form, Input, Select, Button, message } from "antd";
import { createNewTaskInSprint } from "../services/taskService";

import { AuthContext } from "../context/AuthContext";
import {
  fetchTaskAssignees,
  assignEntity,
  deAssignEntity,
} from "../services/assigneesService";
import Assignment from "./Assignment";

const CreateTaskModal = ({
  orgID,
  sprintId,
  visible,
  onCancel,
  onCreated,
  formInitialData = null,
  update = false,
}) => {
  const { user } = useContext(AuthContext);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [selectedAssignees, setSelectedAssignees] = useState([]);
  const [prevAssignees, setPrevAssignees] = useState([]); // for assignment comparison

  useEffect(() => {
    if (formInitialData && update) {
      getTaskAssignees(formInitialData.taskID);
    }
  }, [update]);

  const diffAssignments = (oldAssignments, newAssignments) => {
    console.log("OLD", oldAssignments);
    console.log("New", newAssignments);
    const toAdd = newAssignments.filter((x) => !oldAssignments.includes(x));
    const toDelete = oldAssignments.filter((x) => !newAssignments.includes(x));
    return { toAdd, toDelete };
  };

  const assignProject = async (payload) => {
    try {
      await assignEntity(payload, "task");
    } catch (e) {
      message.error(e.message);
    }
  };

  const deAssignProject = async (payload) => {
    try {
      await deAssignEntity(payload, "task");
    } catch (e) {
      message.error(e.message);
    }
  };

  const performAssignmentOperations = (taskIDParam) => {
    // first we want to compare, if a user has added new or deleted an existing one.
    const { toAdd, toDelete } = diffAssignments(
      prevAssignees,
      selectedAssignees
    );

    // we will make this to add any new assignee into the project...
    if (toAdd)
      assignProject({
        entity_id: taskIDParam,
        assigned_by: user.user_id,
        assigneesToAdd: toAdd,
      });

    // then we will make this call to delete any person from the project...
    if (toDelete)
      deAssignProject({
        entity_id: taskIDParam,
        assigneesToRemove: toDelete,
      });
  };

  const getTaskAssignees = async (taskID) => {
    try {
      const response = await fetchTaskAssignees(taskID);

      if (response.data.assignees) {
        setPrevAssignees(
          response.data.assignees.map(
            (item) => `${response.data.type}-${item.item_id}`
          )
        );
        setSelectedAssignees(
          response.data.assignees.map(
            (item) => `${response.data.type}-${item.item_id}`
          )
        );
      }
    } catch (e) {
      message.error(e.message);
    }
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const res = await createNewTaskInSprint(sprintId, {
        ...values,
        sprint_id: sprintId,
      });

      if (res.data.task_id) {
        const taskIDNew = res.data.task_id;
        performAssignmentOperations(taskIDNew);
      }

      message.success("Task created!");
      form.resetFields();
      onCreated();
    } catch (err) {
      console.error(err);
      message.error("Failed to create task.");
    }
    setSubmitting(false);
  };

  return (
    <Modal
      width={600}
      title="Create New Task"
      visible={visible}
      onCancel={onCancel}
      footer={null}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <br />
        <Assignment
          organizationID={orgID}
          selectedOptions={selectedAssignees}
          setSelectedOptions={setSelectedAssignees}
        />
        <Form.Item
          name="task_name"
          label="Task Name"
          className="mt-4"
          rules={[{ required: true, message: "Enter task name" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="status" label="Status" initialValue="TODO">
          <Select>
            <Select.Option value="TODO">TODO</Select.Option>
            <Select.Option value="IN_PROGRESS">In Progress</Select.Option>
            <Select.Option value="IN_REVIEW">In Review</Select.Option>
            <Select.Option value="COMPLETED">Completed</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Button htmlType="submit" type="primary" loading={submitting} block>
            Create Task
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateTaskModal;
