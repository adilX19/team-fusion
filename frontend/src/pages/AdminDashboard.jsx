import React, { useEffect, useState } from "react";
import { Row, Col, Card, Statistic, List, Typography, Spin } from "antd";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import api from "../services/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardInsights = async () => {
    try {
      const response = await api.get("/insights/dashboard");
      setDashboardData(response.data);
      setLoading(false);
    } catch (e) {
      console.error(e.message);
    }
  };

  useEffect(() => {
    fetchDashboardInsights();
  }, []);

  if (loading) return <Spin size="large" />;

  const safeChartData = dashboardData?.taskStatusSummary || [];

  const barChartData = {
    labels: safeChartData.map((item) => item.status),
    datasets: [
      {
        label: "Task Count",
        data: safeChartData.map((item) => item.count),
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Tasks by Status",
      },
    },
  };

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Projects"
              value={dashboardData?.totalStats.totalProjects || 0}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Tasks"
              value={dashboardData?.totalStats.totalTasks || 0}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Members"
              value={dashboardData?.totalStats.totalUsers || 0}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Sprints"
              value={dashboardData?.totalStats.totalSprints || 0}
            />
          </Card>
        </Col>
      </Row>

      <Row style={{ marginTop: 32 }}>
        <Col span={24}>
          <Card>
            <Bar data={barChartData} options={barChartOptions} />
          </Card>
        </Col>
      </Row>

      <Row style={{ marginTop: 32 }}>
        <Col span={24}>
          <Card title="Recent Activities">
            <List
              itemLayout="horizontal"
              dataSource={dashboardData?.recentActivities || []}
              renderItem={(activity) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <Typography.Text>{activity.message}</Typography.Text>
                    }
                    description={new Date(activity.timestamp).toLocaleString()}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
