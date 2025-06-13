import React, { useEffect, useState } from 'react';
import { Card, Spin, Typography, message, Select } from 'antd';
import moment from 'moment';
import api from '../services/api.js';
import { Link } from "react-router-dom";

const { Title } = Typography;
const { Option } = Select;

const emos = {
    TODO: '📝',
    IN_PROGRESS: '🔧',
    IN_REVIEW: '🔍',
    COMPLETED: '✅',
};

const statuses = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED'];

const MyTasksPage = () => {
    const [tasks, setTasks] = useState({
        TODO: [],
        IN_PROGRESS: [],
        IN_REVIEW: [],
        COMPLETED: [],
    });
    const [loading, setLoading] = useState(true);

    const fetchTasks = async () => {
        try {
            const res = await api.get('/user/me/assigned-tasks');
            const grouped = {
                TODO: [],
                IN_PROGRESS: [],
                IN_REVIEW: [],
                COMPLETED: [],
            };
            res.data.tasks.forEach((task) => {
                grouped[task.status] = grouped[task.status] || [];
                grouped[task.status].push(task);
            });
            setTasks(grouped);
        } catch (err) {
            console.error(err);
            message.error('Failed to load tasks');
        } finally {
            setLoading(false);
        }
    };

    const updateTaskStatus = async (taskId, oldStatus, newStatus) => {
        if (oldStatus === newStatus) return;

        try {
            await api.patch(`/tasks/${taskId}/status`, { status: newStatus });

            const taskToMove = tasks[oldStatus].find((task) => task.task_id === taskId);
            const updatedOldList = tasks[oldStatus].filter((task) => task.task_id !== taskId);
            const updatedNewList = [...tasks[newStatus], { ...taskToMove, status: newStatus }];

            setTasks({
                ...tasks,
                [oldStatus]: updatedOldList,
                [newStatus]: updatedNewList,
            });

            message.success('Task status updated');
        } catch (err) {
            console.error(err);
            message.error('Failed to update task status');
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    return loading ? (
        <Spin fullscreen />
    ) : (
        <div style={{ display: 'flex', gap: '20px', padding: '20px', overflowX: 'auto', height: '100vh' }}>
            {statuses.map((status) => (
                <div
                    key={status}
                    style={{
                        minWidth: '300px',
                        flexShrink: 0,
                        backgroundColor: '#fafafa',
                        borderRadius: '8px',
                        padding: '10px',
                    }}
                >
                    <Title level={4}>{emos[status]} {status.replace('_', ' ')}</Title>
                    <br/>
                    {tasks[status]?.map((task) => (
                        <Card
                            key={task.task_id}
                            size="small"
                            style={{ marginBottom: '10px', fontSize: '12px' }}
                        >
                            <Link to={`/tasks/${task.task_id}`}>
                                <b>📋 {task.task_name}</b>
                            </Link>
                            <div style={{ fontSize: '11px', color: '#888', marginBottom: '8px' }}>
                                Created: {moment(task.created_at).fromNow()}
                            </div>
                            <Select
                                value={task.status}
                                onChange={(value) => updateTaskStatus(task.task_id, status, value)}
                                style={{ width: '100%' }}
                                size="small"
                            >
                                {statuses.map((s) => (
                                    <Option key={s} value={s}>
                                        {s.replace('_', ' ')}
                                    </Option>
                                ))}
                            </Select>
                        </Card>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default MyTasksPage;
