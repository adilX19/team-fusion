import React, { useEffect, useState } from "react";
import { List, Typography, Tag, Button, message, Spin } from "antd";
import { CheckOutlined, DeleteOutlined } from "@ant-design/icons";

import api from "../services/api";
const { Title, Text } = Typography;

const notificationTypeColors = {
  TASK_ASSIGNED: "blue",
  SPRINT_STARTED: "green",
  SPRINT_ASSIGNED: "orange",
  COMMENT_ADDED: "purple",
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get("/notifications/all");
      setNotifications(res.data);
    } catch (err) {
      message.error("Failed to fetch notifications");
    }
    setLoading(false);
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`, {});
      fetchNotifications();
    } catch {
      message.error("Could not mark as read.");
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}/delete`);
      fetchNotifications();
    } catch {
      message.error("Failed to delete notification.");
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch(`/notifications/user/1/read-all`, {});
      fetchNotifications();
    } catch {
      message.error("Failed to mark all as read.");
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div style={{ padding: "30px" }}>
      <Title level={2}>Notifications</Title>

      <Button
        type="primary"
        icon={<CheckOutlined />}
        style={{ marginBottom: 20 }}
        onClick={markAllAsRead}
      >
        Mark All as Read
      </Button>

      <Spin spinning={loading}>
        <List
          itemLayout="vertical"
          dataSource={notifications}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button
                  size="small"
                  type="link"
                  onClick={() => markAsRead(item.notification_id)}
                  disabled={item.is_read}
                >
                  Mark as Read
                </Button>,
                <Button
                  danger
                  size="small"
                  type="text"
                  icon={<DeleteOutlined />}
                  onClick={() => deleteNotification(item.notification_id)}
                >
                  Delete
                </Button>,
              ]}
              style={{
                backgroundColor: item.is_read ? "#f9f9f9" : "#e6f7ff",
                borderRadius: "8px",
                marginBottom: "10px",
                padding: "15px",
              }}
            >
              <List.Item.Meta
                title={
                  <span>
                    <Tag color={notificationTypeColors[item.notification_type]}>
                      {item.notification_type}
                    </Tag>{" "}
                    <Text>{item.message}</Text>
                  </span>
                }
                description={
                  <Text type="secondary">
                    {new Date(item.created_at).toLocaleString()}
                  </Text>
                }
              />
            </List.Item>
          )}
        />
      </Spin>
    </div>
  );
};

export default NotificationsPage;
