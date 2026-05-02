import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { verifyEmail } from "../../utils/api";

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await verifyEmail(token);
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
      <h2 style={{ color: "#0f172a" }}>Email Verification</h2>
      <div style={styles.card}>
        <p style={{ 
          color: status === "error" ? "#ef4444" : status === "success" ? "#10b981" : "#0d9488", 
          fontSize: 16, 
          fontWeight: 600,
          margin: 0
        }}>
          {status === "loading" ? "⏳ " : status === "success" ? "✅ " : "❌ "}
          {message}
        </p>
        {status === "loading" && <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 8 }}>Please wait a moment...</p>}
        {status === "success" && <p style={{ fontSize: 13, color: "#64748b", marginTop: 8 }}>Redirecting you to login...</p>}
        
        {status === "error" && (
          <button onClick={() => navigate("/login")} style={styles.button}>
            Back to Login
          </button>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: 400,
    margin: "100px auto",
    textAlign: "center",
    fontFamily: "'Inter', sans-serif",
  },
  card: {
    padding: "30px 20px",
    background: "#fff",
    borderRadius: 8,
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    border: "1px solid #e2e8f0",
    marginTop: 20
  },
  button: {
    marginTop: 20,
    padding: "10px 20px",
    width: "100%",
    background: "#0d9488",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 600,
  },
};

export default VerifyEmail;