import React, { useEffect, useState, useContext } from 'react';
import {useParams} from "react-router-dom";
import {AuthContext} from "../context/AuthContext.jsx";
import { Card, Descriptions, Upload, Button, Input, List, message, Typography, Divider } from 'antd';
import { UploadOutlined, FileOutlined, ClockCircleOutlined } from '@ant-design/icons';
import moment from 'moment';
import api from '../services/api.js'; // <-- your custom API wrapper
const { Title, Text } = Typography;
const { TextArea } = Input;

const TaskDetailPage = () => {
    const { taskId } = useParams();
    const [task, setTask] = useState(null);
    const [notes, setNotes] = useState([]);
    const [files, setFiles] = useState([]);
    const [newNote, setNewNote] = useState('');

    const {user} = useContext(AuthContext)

    console.log("Task ID In Details", taskId)

    useEffect(() => {
        fetchTaskDetails();
        fetchTaskNotes();
        fetchTaskFiles();
    }, [taskId]);

    const fetchTaskDetails = async () => {
        try {
            const res = await api.get(`/tasks/${taskId}`);
            setTask(res.data);
        } catch (err) {
            message.error('Failed to load task details');
        }
    };

    const fetchTaskFiles = async () => {
        try {
            const res = await api.get(`/tasks/${taskId}/files`);
            setFiles(res.data.files);
        } catch (err) {
            message.error('Failed to load files');
        }
    };

    const fetchTaskNotes = async () => {
        try {
            const res = await api.get(`/tasks/${taskId}/notes`);
            setNotes(res.data.notes);
        } catch (err) {
            message.error('Failed to load notes');
        }
    };

    const handleNoteSubmit = async () => {
        if (!newNote.trim()) return;
        try {
            await api.post(`/tasks/${taskId}/notes`, { note: newNote });
            setNewNote('');
            fetchTaskNotes();
        } catch (err) {
            message.error('Failed to post note');
        }
    };

    const uploadProps = {
        name: 'file',
        action: `http://localhost:5000/tasks/${taskId}/upload`, // backend API to handle upload
        headers: {
            authorization: `Bearer ${localStorage.getItem('token')}`,
            contentType: 'multipart/form-data',
        },
        onChange(info) {
            if (info.file.status === 'done') {
                message.success(`${info.file.name} uploaded`);
                fetchTaskFiles();
            } else if (info.file.status === 'error') {
                message.error(`${info.file.name} upload failed`);
            }
        },
    };

    if (!task) return <div>Loading...</div>;

    return (
        <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
            <Title level={3}>📋 Task Details</Title>

            <Card bordered>
                <Descriptions column={1} bordered>
                    <Descriptions.Item label="Task Name">{task.task_name}</Descriptions.Item>
                    <Descriptions.Item label="Status">{task.status}</Descriptions.Item>
                    <Descriptions.Item label="Created">
                        <ClockCircleOutlined /> {moment(task.created_at).fromNow()}
                    </Descriptions.Item>
                    <Descriptions.Item label="Description">{task.description || 'No description'}</Descriptions.Item>
                </Descriptions>
            </Card>

            <Divider />

            <Title level={4}>📎 Attachments</Title>
            <Upload {...uploadProps}>
                <Button icon={<UploadOutlined />}>Upload File</Button>
            </Upload>

            <List
                dataSource={files}
                renderItem={(file) => (
                    <List.Item>

                        <a href={file.file_path} target="_blank" rel="noopener noreferrer">
                            <FileOutlined style={{ marginRight: 8 }} /> {file.file_name}
                        </a>
                        <span><ClockCircleOutlined /> {moment(file.uploaded_at).fromNow()}</span>
                    </List.Item>
                )}
                locale={{ emptyText: 'No files attached yet.' }}
            />

            <Divider />

            <Title level={4}>📝 Notes</Title>
            <TextArea
                rows={3}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note..."
            />
            <Button type="primary" onClick={handleNoteSubmit} style={{ marginTop: 8 }}>
                Add Note
            </Button>

            <List
                style={{ marginTop: 16 }}
                bordered
                dataSource={notes}
                renderItem={(item) => (
                    <List.Item>
                        <Text strong>{user.username}</Text> - {item.comment_text}
                        <div style={{ marginLeft: 'auto', fontSize: '11px', color: '#888' }}>
                            {moment(item.created_at).fromNow()}
                        </div>
                    </List.Item>
                )}
                locale={{ emptyText: 'No notes yet.' }}
            />
        </div>
    );
};

export default TaskDetailPage;
