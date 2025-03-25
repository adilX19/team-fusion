import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Logout from './components/Logout';
import Layout from './Layout';
import { AuthProvider } from './context/AuthContext';
import Dashboard from './components/Dashboard';

import ProtectedRoute from './routes/ProtectedRoute';

function App() {
  return (
    <>
      <AuthProvider>
        <Router>
          <Routes>

            <Route path="/" element={<Layout><Login /></Layout>} />
            <Route path="/signup" element={<Layout><SignUp /></Layout>} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/home" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>} />

          </Routes>
        </Router>
      </AuthProvider>
    </>
  )
}

export default App
