// SprintDetailPage.jsx

import React, { useEffect, useState } from 'react';
import { Card, Form, Input, Button, List, Typography, message, Select, Divider } from 'antd';
import api from '../services/api'; // Your Axios wrapper

import {useParams} from "react-router-dom";
import CreateTaskModal from "../components/CreateTaskModal.jsx";
const { Title, Text } = Typography;
const { Option } = Select;

const SprintDetailPage = () => {
    const { sprintId } = useParams();
    const [sprint, setSprint] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [form] = Form.useForm();



    const fetchTasks = async () => {
        try {
            const res = await api.get(`/tasks/list/sprints/${sprintId}`);
            setTasks(res.data);
        } catch (err) {
            message.error('Failed to load task details');
        }
    };

    // Fetch sprint + tasks
    const fetchSprint = async () => {
        try {
            const res = await api.get(`/sprints/${sprintId}`);
            setSprint(res.data);
        } catch (err) {
            message.error('Failed to fetch sprint');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSprint();
        fetchTasks();
    }, [sprintId]);

    const handleAddTask = async (values) => {
        try {
            await api.post(`/tasks/sprint/${sprintId}/create`, values);
            form.resetFields();
            fetchSprint();
            message.success('Task added');
        } catch (err) {
            message.error('Failed to add task');
        }
    };

    return loading ? (
        'Loading...'
    ) : (
        <div style={{ padding: '24px' }}>
            {/* 🧾 Sprint Details */}
            <Card bordered style={{ marginBottom: 24 }}>
                <Title level={3}>{sprint.sprint_name}</Title>
                <Text strong>Start:</Text> {new Date(sprint.start_date).toDateString()} <br />
                <Text strong>End:</Text> {new Date(sprint.end_date).toDateString()} <br />
                <Text strong>Status:</Text> {sprint.status}
            </Card>

            {/*/!* ➕ Add Task *!/*/}
            {/*<Card title="Add Task to Sprint" style={{ marginBottom: 24 }}>*/}
            {/*    <Form form={form} layout="vertical" onFinish={handleAddTask}>*/}
            {/*        <Form.Item name="task_name" label="Task Name" rules={[{ required: true }]}>*/}
            {/*            <Input />*/}
            {/*        </Form.Item>*/}
            {/*        <Form.Item name="status" label="Status" initialValue="TODO">*/}
            {/*            <Select>*/}
            {/*                <Option value="TODO">📝 TODO</Option>*/}
            {/*                <Option value="IN_PROGRESS">🔧 In Progress</Option>*/}
            {/*                <Option value="IN_REVIEW">🔍 In Review</Option>*/}
            {/*                <Option value="COMPLETED">✅ Completed</Option>*/}
            {/*            </Select>*/}
            {/*        </Form.Item>*/}
            {/*        <Button type="primary" htmlType="submit">Add Task</Button>*/}
            {/*    </Form>*/}
            {/*</Card>*/}

            <Button type="primary" size={'small'} style={{ float: "right"}} onClick={() => setOpenModal(true)}>
                Add New Task
            </Button>

            <CreateTaskModal
                orgID={1}
                sprintId={sprintId}
                visible={openModal}
                onCancel={() => setOpenModal(false)}
                onCreated={() => {
                    setOpenModal(false);
                    fetchTasks();
                }}
            />
            <br/><br/>

            {/* 📋 Task List */}
            <Card title="Tasks in this Sprint">
                <List
                    dataSource={tasks}
                    renderItem={task => (
                        <List.Item>
                            <Card title={task.task_name} style={{ width: '100%' }}>
                                <Text>Status: </Text><b>{task.status}</b><br />
                                <Text>Created at: {new Date(task.created_at).toLocaleString()}</Text>
                            </Card>
                        </List.Item>
                    )}
                />
            </Card>
        </div>
    );
};

export default SprintDetailPage;
