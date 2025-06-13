// components/MyTasks.jsx
import React, { useEffect, useState } from 'react';
import { Table, Tag, Spin, Alert } from 'antd';
import api from "../services/api.js";

const statusColors = {
    TODO: 'default',
    IN_PROGRESS: 'blue',
    IN_REVIEW: 'orange',
    COMPLETED: 'green',
};

const MyTasks = ({ no_of_tasks = null }) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        api
            .get('/user/me/assigned-tasks') // Adjust the URL if needed
            .then((res) => {
                setTasks(res.data.tasks);
                setLoading(false);
            })
            .catch((err) => {
                setError('Failed to load tasks.');
                setLoading(false);
            });
    }, []);

    const columns = [
        {
            title: 'Task Name',
            dataIndex: 'task_name',
            key: 'task_name',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => <Tag color={statusColors[status]}>{status}</Tag>,
        },
        {
            title: 'Created At',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (created_at) => new Date(created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            }),
        },
    ];

    if (loading) return <Spin />;
    if (error) return <Alert message={error} type="error" />;

    return <Table columns={columns} dataSource={no_of_tasks? tasks.slice(0, no_of_tasks): tasks} rowKey="task_id" />;
};

export default MyTasks;
