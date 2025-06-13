import React, { useEffect, useState } from "react";
import { Row, Col, Card, Statistic, List, Typography, Spin } from "antd";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import api from "../services/api";
import Calendar from "../components/Calendar";
import MyTasks from "../components/MyWork.jsx";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend, ArcElement
);

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const cardBorder = {
    boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
  }

  const buildChartData = (summary, labelKey = "status", valueKey = "count") => {
    return {
      labels: summary.map(item => item[labelKey]),
      datasets: [
        {
          label: "Count",
          data: summary.map(item => item[valueKey]),
          backgroundColor: [
            "#36A2EB", "#FF6384", "#FFCE56", "#8BC34A", "#FF9800", "#E91E63",
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const fetchDashboardInsights = async () => {
    try {
      const response = await api.get("/insights/dashboard");
      await setDashboardData(response.data);
      setLoading(false);
    } catch (e) {
      console.error(e.message);
    }
  };

  useEffect(() => {
    fetchDashboardInsights();
  }, []);

  if (loading) return <Spin size="large" />;


  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card style={cardBorder}>
            <Statistic
              title="Total Projects"
              value={dashboardData?.totalStats.totalProjects || 0}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={cardBorder}>
            <Statistic
              title="Total Tasks"
              value={dashboardData?.totalStats.totalTasks || 0}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={cardBorder}>
            <Statistic
              title="Total Members"
              value={dashboardData?.totalStats.totalUsers || 0}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={cardBorder}>
            <Statistic
              title="Active Sprints"
              value={dashboardData?.totalStats.totalSprints || 0}
            />
          </Card>
        </Col>
      </Row>

      <Row style={{ marginTop: 32, }}>
        <Col span={16}>
          <Card title={"Tasking Insights"} style={cardBorder}>
            <Bar data={buildChartData(dashboardData.taskStatusSummary)}></Bar>
          </Card>
        </Col>
        <Col span={7} style={{ marginLeft: 20 }}>
          <Card title={"Projects Insights"} style={cardBorder}>
            <Pie data={buildChartData(dashboardData.projectStatusSummary)} />
          </Card>
        </Col>
      </Row>

      <Row style={{ marginTop: 32 }}>
        <Col span={12}>
          <Card title={"Recent Work Items"} style={cardBorder}>
            <MyTasks no_of_tasks={3} />
            <a href="/my-work">View Board</a>
          </Card>
        </Col>

        <Col span={11} style={{ marginLeft: 20 }}>
          <Card title="Recent Activities" style={cardBorder}>
            <List
                itemLayout="horizontal"
                dataSource={dashboardData?.enrichedActivities || []}
                renderItem={(activity) => (
                    <List.Item>
                      <List.Item.Meta
                          title={"🔔" + activity.message + " " + activity.task_text}
                          description={new Date(activity.created_at).toLocaleString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                      />
                    </List.Item>
                )}
            />
          </Card>
        </Col>
      </Row>

      <Row style={{ marginTop: 32 }}>
        <Col span={24}>
          <Card title={"Scheduled Events"} style={cardBorder}>
            <Calendar />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
