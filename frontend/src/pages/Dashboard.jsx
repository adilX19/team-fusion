import React, { useEffect, useState, useContext } from "react";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

import UserDashboard from "./UserDashboard";
import AdminDashboard from "./AdminDashboard";

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  return (
    <>
      <h4 className="mb-5">
        Hello, {user?.firstname} {user?.lastname}
      </h4>

      {user?.is_superuser ? <AdminDashboard /> : <UserDashboard />}
    </>
  );
}
