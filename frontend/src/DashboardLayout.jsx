// Layout.jsx
import React, { useState, useContext, useEffect } from "react";
import MainLogo from "../src/assets/team-fusion-logo.png";
import { useLocation } from "react-router-dom";
import { Layout as AntLayout, Menu, Breadcrumb, theme, Button } from "antd";
import {
  Typography,
  Avatar,
  Badge,
  Dropdown,
  Space,
  Popover,
  Divider,
} from "antd";
import {
  DashboardOutlined,
  ProjectOutlined,
  SplitCellsOutlined,
  TeamOutlined,
  FileDoneOutlined,
  BarChartOutlined,
  CloudUploadOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  DownOutlined,
  SettingOutlined,
  ClusterOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";

import { AuthContext } from "./context/AuthContext";
import { io } from "socket.io-client";

import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";

const Layout = ({ children }) => {
  const [selectOption, setSelectedOption] = useState("dashboard");
  const [isAdmin, setIsAdmin] = useState(false);

  const { Header, Sider, Content } = AntLayout;

  const { user, messageApi, createNotification } = useContext(AuthContext);

  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const items1 = ["1", "2", "3"].map((key) => ({
    key,
    label: `nav ${key}`,
  }));

  const content = (
    <ul>
      <li>My Notification 1</li>
      <li>My Notification 2</li>
      <li>My Notification 3</li>
      <li>My Notification 4</li>
    </ul>
  );

  const items = [
    {
      key: "2",
      label: "Profile",
      icon: <UserOutlined />,
    },
    {
      key: "3",
      label: "My Tasks",
      icon: <ClusterOutlined />,
    },
    {
      key: "4",
      label: <a href="/profile-settings">Settings</a>,
      icon: <SettingOutlined />,
    },
    {
      type: "divider",
    },
    {
      key: "5",
      label: <a href="/logout">Signout</a>,
      icon: <LogoutOutlined />,
    },
  ];

  const location = useLocation();

  useEffect(() => {
    const path = location.pathname.split("/")[1]; // take first part after "/"
    setSelectedOption(path || "dashboard");
    console.log("User", user);
  }, [location.pathname]);

  useEffect(() => {
    if (!user) return;

    const socket = io("http://localhost:5000", {
      withCredentials: true,
    });

    socket.emit("REGISTER", user.user_id);

    socket.on("NOTIFICATION", (data) => {
      createNotification("info", data.message);
    });

    return () => {
      console.log("Turning oFff socket.");
      socket.off("NOTIFICATION");
    };
  }, []);

  const handleClick = (e) => {
    setSelectedOption(e.key);
  };

  return (
    <AntLayout style={{ minHeight: "100vh" }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          position: "fixed", // 👈 fixed position
          left: 0,
          top: 0,
          bottom: 0,
          height: "100vh",
          borderRight: "1px solid #eee", // optional border
          zIndex: 100, // stay above content
        }}
      >
        <div
          className="logo"
          style={{ textAlign: "center", marginBottom: "30px", color: "white" }}
        >
          Team{" "}
          <img
            src={MainLogo}
            alt=""
            style={{
              width: 60,
              margin: "auto",
            }}
          />{" "}
          Fusion
          <br />
        </div>
        <div className="demo-logo-vertical" />
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectOption]}
          onClick={handleClick}
        >
          <Menu.Item key="home" icon={<DashboardOutlined />}>
            <a href="/home">Dashboard</a>
          </Menu.Item>
          <Menu.Item key="projects" icon={<ProjectOutlined />}>
            <a href="/projects">Projects</a>
          </Menu.Item>
          <Menu.Item key="tasks" icon={<FileDoneOutlined />}>
            <a href="/tasks">Tasks</a>
          </Menu.Item>
          <Menu.Item key="teams" icon={<TeamOutlined />}>
            <a href="/teams">Teams</a>
          </Menu.Item>
          <Menu.Item key="reports" icon={<BarChartOutlined />}>
            Reports
          </Menu.Item>
          <Menu.Item key="files" icon={<CloudUploadOutlined />}>
            Files
          </Menu.Item>
          <Menu.Item key="notifications" icon={<BellOutlined />}>
            <a href="/notifications">Notifications</a>
          </Menu.Item>
          {user?.is_superuser ? (
            <Menu.Item key="admin-panel" icon={<UserOutlined />}>
              <a href="/admin-panel">Admin Panel</a>
            </Menu.Item>
          ) : (
            ""
          )}
        </Menu>
      </Sider>
      <AntLayout style={{ marginLeft: 200 }}>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <Row>
            <Col>
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{
                  fontSize: "16px",
                  width: 64,
                  height: 64,
                }}
              />
            </Col>

            <Col>
              <Navbar className="bg-body-tertiary">
                <Container>
                  <Navbar.Collapse className="justify-content-end">
                    <Form className="d-flex">
                      <Form.Control
                        type="search"
                        placeholder="Search"
                        className="me-2"
                        aria-label="Search"
                      />
                    </Form>
                    <Popover content={content} title="Title" trigger="click">
                      <Badge dot>
                        <Button
                          style={{
                            backgroundColor: "#fa541c",
                            color: "white",
                            marginRight: "5px",
                          }}
                          shape="circle"
                          icon={<BellOutlined />}
                        />
                      </Badge>
                    </Popover>

                    <Dropdown menu={{ items }}>
                      <a onClick={(e) => e.preventDefault()}>
                        <Space>
                          <Avatar
                            style={{
                              backgroundColor: "#186FCF",
                              verticalAlign: "middle",
                              cursor: "pointer",
                            }}
                            size="medium"
                            gap={2}
                          >
                            A
                          </Avatar>
                          <DownOutlined />
                        </Space>
                      </a>
                    </Dropdown>
                  </Navbar.Collapse>
                </Container>
              </Navbar>
            </Col>
          </Row>
        </Header>
        <Content
          style={{
            padding: 29,
            margin: 20,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <main>{children}</main>
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;
