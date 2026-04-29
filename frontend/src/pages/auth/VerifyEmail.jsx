import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await axios.get(`/api/auth/verify-email/${token}`);
        setStatus("success");
        setMessage(res.data.message || "Email verified successfully");

        setTimeout(() => navigate("/login"), 3000);
      } catch (err) {
        setStatus("error");
        setMessage(
          err.response?.data?.message || "Verification failed or expired"
        );
      }
    };

    verify();
  }, [token, navigate]);

  return (
    <div style={styles.container}>
      <h2>Email Verification</h2>
      <p style={{ color: status === "error" ? "red" : "green" }}>{message}</p>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: 400,
    margin: "100px auto",
    textAlign: "center",
  },
};

export default VerifyEmail;