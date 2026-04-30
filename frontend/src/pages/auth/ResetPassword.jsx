import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { resetPassword } from "../../utils/api";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await resetPassword(token, password);

      setMessage(res.data.message || "Password reset successfully!");

      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Reset Password</h2>
      <p style={styles.subtitle}>Enter your new password below.</p>

      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="New password"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />
        
        <input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          required
          onChange={(e) => setConfirmPassword(e.target.value)}
          style={styles.input}
        />

        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>

      {message && <p style={{ marginTop: 15, color: "green", fontSize: 14 }}>{message}</p>}
      {error && <p style={{ marginTop: 15, color: "red", fontSize: 14 }}>{error}</p>}
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
  subtitle: {
    color: "#64748b",
    fontSize: 14,
    marginBottom: 20,
  },
  input: {
    width: "100%",
    padding: 10,
    marginBottom: 10,
    borderRadius: 6,
    border: "1px solid #ccc",
    boxSizing: "border-box",
  },
  button: {
    padding: 10,
    width: "100%",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 600,
  },
};

export default ResetPassword;