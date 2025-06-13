import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import Logout from "./components/Logout";
import Layout from "./DashboardLayout";
import AuthLayout from "./AuthLayout";
import { AuthProvider } from "./context/AuthContext";

// pages imports
import Dashboard from "./pages/Dashboard";
import AdminPanel from "./pages/AdminPanel";
import ProjectsPage from "./pages/projects/ProjectsPage";
import ProjectDetailPage from "./pages/projects/ProjectDetailPage";
import TeamsPage from "./pages/teams/TeamsPage";
import TaskPage from "./pages/TaskPage";
import MyTaskPage from "./pages/MyTasksPage";
import ProfileSettings from "./components/ProfileSettings";
import NotificationsPage from "./pages/NotificationsPage";
import Calendar from "./components/Calendar";

import "rsuite/dist/rsuite.min.css";

import ProtectedRoute from "./routes/ProtectedRoute";
import TaskDetailPage from "./pages/TaskDetailPage.jsx";
import SprintDetailPage from "./pages/SprintDetailPage.jsx";

function App() {
  return (
    <>
      <AuthProvider>
        <Router>
          <Routes>
            <Route
              path="/"
              element={
                <AuthLayout>
                  <Login />
                </AuthLayout>
              }
            />
            <Route
              path="/signup"
              element={
                <AuthLayout>
                  <SignUp />
                </AuthLayout>
              }
            />
            <Route path="/logout" element={<Logout />} />
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile-settings"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ProfileSettings />
                  </Layout>
                </ProtectedRoute>
              }
            />
              <Route
                  path="/my-work"
                  element={
                      <ProtectedRoute>
                          <Layout>
                              <MyTaskPage />
                          </Layout>
                      </ProtectedRoute>
                  }
              />
            <Route
              path="/projects"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ProjectsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/projects/:projectId"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ProjectDetailPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

              <Route
                  path="/tasks/:taskId"
                  element={
                      <ProtectedRoute>
                          <Layout>
                              <TaskDetailPage />
                          </Layout>
                      </ProtectedRoute>
                  }
              />


              <Route
                  path="/sprints/:sprintId"
                  element={
                      <ProtectedRoute>
                          <Layout>
                              <SprintDetailPage />
                          </Layout>
                      </ProtectedRoute>
                  }
              />




            <Route
              path="/teams"
              element={
                <ProtectedRoute>
                  <Layout>
                    <TeamsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/tasks"
              element={
                <ProtectedRoute>
                  <Layout>
                    <TaskPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Layout>
                    <NotificationsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

              <Route
                  path="/calendar"
                  element={
                      <ProtectedRoute>
                          <Layout>
                              <Calendar />
                          </Layout>
                      </ProtectedRoute>
                  }
              />

            <Route
              path="/admin-panel"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AdminPanel />
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </>
  );
}

export default App;
