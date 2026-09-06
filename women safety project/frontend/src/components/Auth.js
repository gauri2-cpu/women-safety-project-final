import React, { useState } from 'react';
import { guestLogin, signup, login } from '../services/api';
import { saveUser } from '../services/storage';
import '../styles/Auth.css';

function Auth({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await guestLogin();
      if (response.success) {
        saveUser(response.user);
        onLogin(response.user);
      } else {
        setError(response.message || 'Guest login failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login as guest');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let response;
      if (mode === 'signup') {
        response = await signup(formData);
      } else {
        response = await login({
          email: formData.email,
          password: formData.password
        });
      }

      if (response.success) {
        saveUser(response.user);
        onLogin(response.user);
      } else {
        setError(response.message || 'Authentication failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${mode}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Women Safety App</h1>
        <p className="auth-subtitle">Your safety is our priority</p>

        {error && <div className="error-message">{error}</div>}

        <div className="auth-tabs">
          <button
            className={mode === 'login' ? 'active' : ''}
            onClick={() => setMode('login')}
          >
            Login
          </button>
          <button
            className={mode === 'signup' ? 'active' : ''}
            onClick={() => setMode('signup')}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'signup' && (
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          {mode === 'signup' && (
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number (e.g., +91 9876543210)"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          )}

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength="6"
          />

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <button
          onClick={handleGuestLogin}
          className="btn-guest"
          disabled={loading}
        >
          Continue as Guest
        </button>

        <p className="auth-note">
          Guest mode allows quick access without signup
        </p>
      </div>
    </div>
  );
}

export default Auth;
