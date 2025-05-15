import { Card, Collapse, List, Button, Tag, Input, message } from "antd";
import { useState, useEffect } from "react";
import {
  createNewSubTaskInTask,
  fetchSubTasksByTasks,
} from "../services/taskService";

const { Panel } = Collapse;

export default function TaskCard({ task, refreshTasks }) {
  const [subtasks, setSubtasks] = useState(task.subtasks || []);
  const [newSubtask, setNewSubtask] = useState("");

  useEffect(() => {
    getSubTasks();
  }, []);

  const getSubTasks = async () => {
    try {
      const res = await fetchSubTasksByTasks(task.task_id);
      setSubtasks(res.data);
    } catch (e) {
      message.error("Error adding subtask");
    }
  };

  const addSubtask = async () => {
    try {
      const res = await createNewSubTaskInTask(task.task_id, {
        subtask_name: newSubtask,
      });
      setNewSubtask("");

      await getSubTasks();
      message.success("Subtask added!");
    } catch (err) {
      message.error("Error adding subtask");
    }
  };

  return (
    <Collapse style={{ width: "110%", marginLeft: "-5%", marginBottom: "15px" }}>
      <Panel header={task.task_name} style={{ fontSize: "12px" }} key="6">
        <List
          dataSource={subtasks}
          renderItem={(sub) => (
            <List.Item>
              <span style={{ fontSize: "13px" }}>
                {" --> "}
                {sub.subtask_name}
              </span>
            </List.Item>
          )}
        />
        <Input.Search
          placeholder="New subtask"
          size="small"
          value={newSubtask}
          onChange={(e) => setNewSubtask(e.target.value)}
          enterButton="Add"
          onSearch={addSubtask}
          style={{ marginTop: 0 }}
        />
      </Panel>
    </Collapse>
  );
}
