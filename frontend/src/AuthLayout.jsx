import React from "react";

const AuthLayout = ({ children }) => {

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#4158D0",
        backgroundImage: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      }}
    >
      {children}
    </div>
  );
};

export default AuthLayout;