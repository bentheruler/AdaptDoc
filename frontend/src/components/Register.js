import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register, resendVerification, googleLogin, warmServer } from '../utils/api';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const navigate = useNavigate();
  const { loginUser } = useAuth();

  // Pre-warm the Railway server as soon as the register page loads
  useEffect(() => { warmServer(); }, []);

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setServerError('');
      try {
        const response = await googleLogin(tokenResponse.credential || tokenResponse.access_token);
        const { accessToken, token, refreshToken, user } = response.data;
        const authToken = accessToken || token;
        loginUser(user, authToken, refreshToken);
        navigate('/dashboard');
      } catch (err) {
        console.error('Google login error', err);
        setServerError(err.response?.data?.message || 'Google signup failed. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setServerError('Google Signup Failed');
    }
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [canResendVerification, setCanResendVerification] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resendingVerification, setResendingVerification] = useState(false);

  const validateName = (name) => {
    const trimmed = name.trim();
    if (!trimmed) return 'Full name is required';
    if (trimmed.length < 3) return 'Full name must be at least 3 characters';
    if (trimmed.length > 50) return 'Full name must not exceed 50 characters';
    if (!/^[a-zA-Z\s'.-]+$/.test(trimmed)) {
      return 'Full name can only contain letters, spaces, apostrophes, dots, and hyphens';
    }
    return '';
  };

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
    if (password.length > 64) return 'Password must not exceed 64 characters';
    if (!/[A-Z]/.test(password)) return 'Password must include at least one uppercase letter';
    if (!/[a-z]/.test(password)) return 'Password must include at least one lowercase letter';
    if (!/[0-9]/.test(password)) return 'Password must include at least one number';
    if (!/[!@#$%^&*(),.?":{}|<>_\-\\[\]/+=~`;]/.test(password)) {
      return 'Password must include at least one special character';
    }
    return '';
  };

  const validateConfirmPassword = (password, confirmPassword) => {
    if (!confirmPassword) return 'Please confirm your password';
    if (password !== confirmPassword) return 'Passwords do not match';
    return '';
  };

  const validateField = (name, value, currentFormData = formData) => {
    switch (name) {
      case 'name':
        return validateName(value);
      case 'email':
        return validateEmail(value);
      case 'password':
        return validatePassword(value);
      case 'confirmPassword':
        return validateConfirmPassword(currentFormData.password, value);
      default:
        return '';
    }
  };

  const validateForm = () => {
    const newErrors = {
      name: validateName(formData.name),
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
      confirmPassword: validateConfirmPassword(formData.password, formData.confirmPassword),
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    const updatedFormData = {
      ...formData,
      [name]: value,
    };

    setFormData(updatedFormData);
    setServerError('');
    setSuccessMessage('');
    setResendMessage('');
    setCanResendVerification(false);

    const newErrors = {
      ...errors,
      [name]: validateField(name, value, updatedFormData),
    };

    if (name === 'password' && updatedFormData.confirmPassword) {
      newErrors.confirmPassword = validateConfirmPassword(
        updatedFormData.password,
        updatedFormData.confirmPassword
      );
    }

    setErrors(newErrors);
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
    setSuccessMessage('');
    setResendMessage('');
    setCanResendVerification(false);

    try {
      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      };

      const response = await register(userData);

      setSuccessMessage(
        response?.data?.message ||
          'Registration successful. Please check your email and verify your account before logging in.'
      );

      setCanResendVerification(true);

      setFormData((prev) => ({
        ...prev,
        password: '',
        confirmPassword: '',
      }));
    } catch (err) {
      console.error('Registration error', err);

      let message = err.response?.data?.message;
      if (!message) {
        if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
          message = 'The server is waking up from sleep — please wait a moment and try again.';
        } else if (err.message === 'Network Error') {
          message = 'Network error: Please check your connection and try again.';
        } else {
          message = err.message || 'Registration failed. Please try again.';
        }
      }

      setServerError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setResendingVerification(true);
      setResendMessage('');
      setServerError('');

      const email = formData.email.trim().toLowerCase();

      if (!email) {
        setResendMessage('Enter your email first.');
        return;
      }

      const res = await resendVerification(email);

      setResendMessage(
        res.data.message || 'Verification email has been sent again.'
      );
    } catch (err) {
      setResendMessage(
        err.response?.data?.message ||
          'Could not resend verification email.'
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
        <h2>Create Account</h2>
        <p>Sign up to start using AdoptDoc</p>

        {serverError && <div className="error-message">{serverError}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}
        {resendMessage && <div className="success-message">{resendMessage}</div>}

        {/* Google Sign-up first — fastest path to getting started */}
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
          <span>or sign up with email</span>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your full name"
              disabled={loading}
            />
            {errors.name && <small className="error-text">{errors.name}</small>}
          </div>

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

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="password-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Confirm your password"
                disabled={loading}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                disabled={loading}
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.confirmPassword && (
              <small className="error-text">{errors.confirmPassword}</small>
            )}
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        {canResendVerification && (
          <div className="verification-box">
            <p className="verification-text">
              Didn&apos;t get the verification email?
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
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;