import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login, googleLogin, resendVerification, warmServer } from '../utils/api';
import { useGoogleLogin } from '@react-oauth/google';
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

  // Pre-warm the Railway server as soon as the login page loads
  useEffect(() => { warmServer(); }, []);

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
      const { accessToken, token, refreshToken, user } = response.data;
      const authToken = accessToken || token;

      loginUser(user || { email: payload.email }, authToken, refreshToken);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error', err);

      let message = err.response?.data?.message;
      if (!message) {
        if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
          message = 'The server is waking up from sleep — please try again in a moment.';
        } else if (err.message === 'Network Error') {
          message = 'Network error: Please check your connection and try again.';
        } else {
          message = err.message || 'Login failed. Please try again.';
        }
      }

      setServerError(message);

      if (message.toLowerCase().includes('verify your email')) {
        setShowResendVerification(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = useGoogleLogin({
    flow: 'implicit',           // returns access_token directly
    ux_mode: 'popup',           // keep popup UX
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setServerError('');
      try {
        // useGoogleLogin returns access_token (not credential)
        const response = await googleLogin(tokenResponse.access_token);
        const { accessToken, token, refreshToken, user } = response.data;
        const authToken = accessToken || token;
        loginUser(user, authToken, refreshToken);
        navigate('/dashboard');
      } catch (err) {
        console.error('Google login error', err);
        setServerError(err.response?.data?.message || 'Google login failed. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    onError: (err) => {
      console.error('Google OAuth error', err);
      setServerError('Google Login Failed. Please try again.');
    },
  });

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
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <img src="/favicon.png" alt="AdaptDoc Logo" style={{ width: '48px', height: '48px' }} />
        </div>
        <h2>Welcome Back</h2>
        <p>Log in to your AdoptDoc account</p>

        {serverError && <div className="error-message">{serverError}</div>}
        {resendMessage && <div className="success-message">{resendMessage}</div>}

        {/* Google Sign-in first — preferred flow */}
        <button
          type="button"
          className="auth-button google-auth-button"
          onClick={() => loginWithGoogle()}
          disabled={loading}
          style={{
            backgroundColor: '#fff',
            color: '#333',
            border: '1px solid #ddd',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            marginBottom: '4px',
          }}
        >
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div className="auth-separator">
          <span>or sign in with email</span>
        </div>

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