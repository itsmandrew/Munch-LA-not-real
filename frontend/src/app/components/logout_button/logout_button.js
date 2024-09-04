"use client";
import { signOut } from "next-auth/react";
import Button from "@mui/material/Button"; // Adjust this import based on your button library or style

const LogoutButton = () => {
  const handleLogout = () => {
    signOut({
      redirect: true,
      callbackUrl: "https://accounts.google.com/signin", // Redirect to Google login page
    });
  };

  return (
    <Button variant="contained" color="primary" onClick={handleLogout}>
      Logout
    </Button>
  );
};

export default LogoutButton;
