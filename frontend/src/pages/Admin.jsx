import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import AdminDashboard from './AdminDashboard.jsx';

export default function Admin() {
  const [token, setToken] = useState(localStorage.getItem('adminToken') || null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);

    fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          toast.success('Logged in successfully!');
          localStorage.setItem('adminToken', data.token);
          setToken(data.token);
        } else {
          toast.error(data.message || 'Login failed');
        }
      })
      .catch(err => {
        console.error('Login error:', err);
        toast.error('Server connection failed');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setToken(null);
    toast.success('Logged out successfully');
  };

  // If we have a token, show dashboard
  if (token) {
    return <AdminDashboard token={token} onLogout={handleLogout} />;
  }

  // Otherwise, show login screen
  return (
    <div style={styles.container}>
      <div style={styles.loginBox}>
        <h2 style={styles.title}>Admin Access</h2>
        <p style={styles.subtitle}>Enter credentials to access the dashboard</p>
        
        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
              required
            />
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>
          
          <button type="submit" disabled={isLoading} style={styles.button}>
            {isLoading ? 'Authenticating...' : 'Secure Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

// Simple inline styles to avoid polluting global css
const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0f172a',
    fontFamily: 'Inter, system-ui, sans-serif'
  },
  loginBox: {
    background: '#1e293b',
    padding: '2.5rem',
    borderRadius: '12px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
    width: '100%',
    maxWidth: '400px',
    border: '1px solid #334155'
  },
  title: {
    color: '#f8fafc',
    fontSize: '1.5rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
    textAlign: 'center'
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: '0.875rem',
    marginBottom: '2rem',
    textAlign: 'center'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  label: {
    color: '#cbd5e1',
    fontSize: '0.875rem',
    fontWeight: '500'
  },
  input: {
    background: '#0f172a',
    border: '1px solid #334155',
    padding: '0.75rem',
    borderRadius: '8px',
    color: '#f8fafc',
    outline: 'none',
    fontSize: '1rem'
  },
  button: {
    background: '#3b82f6',
    color: 'white',
    padding: '0.75rem',
    borderRadius: '8px',
    border: 'none',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '0.5rem',
    transition: 'background 0.2s'
  }
};
