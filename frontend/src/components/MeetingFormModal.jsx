// MeetingFormModal.js
import React, { useState } from "react";
import { Modal, Input, TimePicker, Form, Button, Select } from "antd";
import dayjs from "dayjs";

export default function MeetingFormModal({ date, visible, onClose, onSave }) {
    const [form] = Form.useForm();

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                title: values.title,
                agenda: values.agenda,
                date: date,
                duration: parseInt(values.duration),
                location: values.location,
                time: values.time.format("HH:mm"), // Convert to string for backend
            };

            await fetch("http://localhost:5000/calendar/meetings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            form.resetFields();
            onSave();   // Refresh calendar events
            onClose();  // Close modal
        } catch (err) {
            // Form validation failed
        }
    };

    return (
        <Modal
            title={`Add Meeting on ${date}`}
            open={visible}
            onOk={handleOk}
            onCancel={() => {
                form.resetFields();
                onClose();
            }}
            okText="Save"
            cancelText="Cancel"
        >
            <hr/><br/>
            <Form
                form={form}
                layout="vertical"
                style={{ display: "flex", flexDirection: "column" }}
            >
                <Form.Item
                    label="Meeting Title"
                    name="title"
                    rules={[{ required: true, message: "Please enter a title" }]}
                >
                    <Input placeholder="e.g. Project Sync" />
                </Form.Item>

                <Form.Item
                    label="Agenda"
                    name="agenda"
                    rules={[{ required: true, message: "Explain Agenda of Meeting" }]}
                >
                    <Input placeholder="e.g. What this meeting is about?" />
                </Form.Item>

                <Form.Item
                    label="Meeting Time"
                    name="time"
                    rules={[{ required: true, message: "Please select a time" }]}
                >
                    <TimePicker format="HH:mm" />
                </Form.Item>

                <Form.Item
                    label="Meeting Duration"
                    name="duration"
                    rules={[{ required: true, message: "Please select a duration" }]}
                >
                    <Select placeholder="Select duration">
                        <Select.Option value="15">15 minutes</Select.Option>
                        <Select.Option value="30">30 minutes</Select.Option>
                        <Select.Option value="45">45 minutes</Select.Option>
                        <Select.Option value="60">1 hour</Select.Option>
                        <Select.Option value="90">1.5 hours</Select.Option>
                        <Select.Option value="120">2 hours</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    label="Meeting Location"
                    name="location"
                    rules={[{ required: true, message: "Please select a location" }]}
                >
                    <Input placeholder="e.g. Link to Zoom/GoogleMeet/Teams or physical locations?" />
                </Form.Item>
            </Form>
        </Modal>
    );
}