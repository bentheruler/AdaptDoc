import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login, resendVerification } from '../utils/api';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [showResendVerification, setShowResendVerification] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resendingVerification, setResendingVerification] = useState(false);

  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const validateEmail = (email) => {
    const trimmed = email.trim();
    if (!trimmed) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) return 'Please enter a valid email address';
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    return '';
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'email':
        return validateEmail(value);
      case 'password':
        return validatePassword(value);
      default:
        return '';
    }
  };

  const validateForm = () => {
    const newErrors = {
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setServerError('');
    setResendMessage('');
    setShowResendVerification(false);

    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;

    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setServerError('');
    setResendMessage('');
    setShowResendVerification(false);

    try {
      const payload = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      };

      const response = await login(payload);
      const { accessToken, token, user } = response.data;
      const authToken = accessToken || token;

      loginUser(user || { email: payload.email }, authToken);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error', err);

      const message =
        err.response?.data?.message ||
        err.message ||
        'Login failed. Please try again.';

      setServerError(message);

      if (message.toLowerCase().includes('verify your email')) {
        setShowResendVerification(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setResendingVerification(true);
      setResendMessage('');

      const email = formData.email.trim().toLowerCase();

      if (!email) {
        setResendMessage('Enter your email first.');
        return;
      }

      const res = await resendVerification(email);
      setResendMessage(res.data.message || 'Verification email sent.');
    } catch (err) {
      setResendMessage(
        err.response?.data?.message || 'Could not resend verification email.'
      );
    } finally {
      setResendingVerification(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome Back</h2>
        <p>Log in to your AdoptDoc account</p>

        {serverError && <div className="error-message">{serverError}</div>}
        {resendMessage && <div className="success-message">{resendMessage}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your email"
              disabled={loading}
            />
            {errors.email && <small className="error-text">{errors.email}</small>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>

            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter your password"
                disabled={loading}
              />

              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={loading}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            {errors.password && <small className="error-text">{errors.password}</small>}
          </div>

          <div className="auth-links-row">
            <Link to="/forgot-password" className="auth-inline-link">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        {showResendVerification && (
          <div className="verification-box">
            <p className="verification-text">
              Your email is not verified yet.
            </p>
            <button
              type="button"
              className="secondary-auth-button"
              onClick={handleResendVerification}
              disabled={resendingVerification}
            >
              {resendingVerification ? 'Sending...' : 'Resend Verification Email'}
            </button>
          </div>
        )}

        <p className="auth-footer">
          Don&apos;t have an account? <Link to="/register">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;