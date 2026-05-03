import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../../utils/api";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await forgotPassword(email);

      setMessage(res.data.message || "Password reset link sent to your email.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Forgot Password</h2>
      <p style={styles.subtitle}>Enter your email address to receive a password reset link.</p>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Your email address"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />

        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      {message && <p style={{ marginTop: 15, color: "green", fontSize: 14 }}>{message}</p>}
      {error && <p style={{ marginTop: 15, color: "red", fontSize: 14 }}>{error}</p>}
      
      <div style={{ marginTop: 20 }}>
        <button onClick={() => navigate("/login")} style={styles.linkButton}>
          Back to Login
        </button>
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
    background: "#0d9488",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 600,
  },
  linkButton: {
    background: "none",
    border: "none",
    color: "#0d9488",
    cursor: "pointer",
    textDecoration: "underline",
    fontSize: 14,
  }
};

export default ForgotPassword;