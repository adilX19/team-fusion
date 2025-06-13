import React, { useEffect, useState, useContext } from "react";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

import UserDashboard from "./UserDashboard";
import AdminDashboard from "./AdminDashboard";

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  return (
    <>
      <h4>
          👋 Welcome,  {user?.firstname} {user?.lastname}
      </h4>
        <p className="lead" style={{fontSize: "17px"}}>Here's a quick look at your progress</p>

        <br/><br/>
      {user?.is_superuser ? <AdminDashboard /> : <UserDashboard />}
    </>
  );
}
