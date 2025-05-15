import React, { useEffect, useState, useContext } from "react";
import {
  Form,
  Input,
  Button,
  Upload,
  Avatar,
  Row,
  Col,
  Typography,
  Space,
} from "antd";
import { UploadOutlined, SaveOutlined } from "@ant-design/icons";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

const { Title } = Typography;

const ProfileSettings = () => {
  const { user, messageApi } = useContext(AuthContext);
  const [form] = Form.useForm();
  const [userData, setUserData] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token"); // Adjust if stored differently

  useEffect(() => {
    api
      .get("/user/me")
      .then((res) => {
        const data = res.data;
        setUserData(data);
        setProfileImage(data.profile_image);
        if (userData) {
          form.setFieldsValue({
            username: userData.username,
            firstname: userData.firstname,
            lastname: userData.lastname,
            email: userData.email,
          });
        }
      })
      .catch(() => {
        messageApi.error("Failed to load user data");
      });
  }, [form]);

  const handleProfileUpdate = (values) => {
    setLoading(true);
    api
      .put("/user/me/edit-profile", values)
      .then(() => {
        messageApi.success("Profile updated successfully");
      })
      .catch(() => {
        messageApi.error("Failed to update profile");
      })
      .finally(() => setLoading(false));
  };

  const handleImageUpload = (info) => {
    const formData = new FormData();
    formData.append("file", info.file);

    api
      .put("/user/me/profile-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        messageApi.success("Profile image updated");
        setProfileImage(res.data.profileImage);
      })
      .catch(() => {
        messageApi.error("Image upload failed");
      });
  };

  return (
    <div style={{ maxWidth: 700, margin: "auto", padding: 32 }}>
      <Title level={3}>Edit Profile</Title>

      {userData && (
        <>
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col>
              <Avatar size={100} src={profileImage} />
            </Col>
            <Col>
              <Upload
                name="profileImage"
                showUploadList={false}
                customRequest={({ file }) => handleImageUpload({ file })}
              >
                <Button icon={<UploadOutlined />}>Change Profile Image</Button>
              </Upload>
            </Col>
          </Row>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleProfileUpdate}
            initialValues={userData}
          >
            <Form.Item
              name="username"
              label="Username"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item name="firstname" label="First Name">
              <Input />
            </Form.Item>
            <Form.Item name="lastname" label="Last Name">
              <Input />
            </Form.Item>
            <Form.Item
              name="email"
              label="Email"
              rules={[{ type: "email", required: true }]}
            >
              <Input />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<SaveOutlined />}
                >
                  Save Changes
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </>
      )}
    </div>
  );
};

export default ProfileSettings;
