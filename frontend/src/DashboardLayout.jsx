// Layout.jsx
import React, { useState } from "react";
import MainLogo from "../src/assets/team-fusion-logo.png";
import { useLocation } from "react-router-dom";
import { Layout as AntLayout, Menu, Breadcrumb, theme, Button } from "antd";
import { Typography, Avatar, Badge, Dropdown, Space, Popover } from "antd";
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

import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";

const Layout = ({ children }) => {
  const { Title } = Typography;
  const { Header, Sider, Content } = AntLayout;

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
      label: "Settings",
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
  const hideHeaderOnPaths = ["/", "/signup"];

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
          style={{ textAlign: "center", marginBottom: "30px", color: 'white' }}
        >
          Team <img
            src={MainLogo}
            alt=""
            style={{
              width: 60,
              margin: "auto",
            }}
          /> Fusion
          <br />
        </div>
        <div className="demo-logo-vertical" />
        <Menu theme="dark" mode="inline" defaultSelectedKeys={["1"]}>
          <Menu.Item key="1" icon={<DashboardOutlined />}>
            Dashboard
          </Menu.Item>
          <Menu.Item key="2" icon={<ProjectOutlined />}>
            Projects
          </Menu.Item>
          <Menu.Item key="3" icon={<SplitCellsOutlined />}>
            Sprints
          </Menu.Item>
          <Menu.Item key="4" icon={<TeamOutlined />}>
            Teams
          </Menu.Item>
          <Menu.Item key="5" icon={<FileDoneOutlined />}>
            Tasks
          </Menu.Item>
          <Menu.Item key="6" icon={<BarChartOutlined />}>
            Reports
          </Menu.Item>
          <Menu.Item key="7" icon={<CloudUploadOutlined />}>
            Files
          </Menu.Item>
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
