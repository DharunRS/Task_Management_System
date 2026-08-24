import React, { useState } from 'react';
import API from './api';

export default function Auth({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (isRegister) {
      try {
        await API.post('/auth/register', { username, email, password });
        setMessage('Registration successful! You can now log in.');
        setIsRegister(false);
      } catch (err) {
        setError(err.response?.data?.detail || 'Registration failed');
      }
    } else {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      try {
        const res = await API.post('/auth/login', formData);
        localStorage.setItem('token', res.data.access_token);
        onLoginSuccess();
      } catch (err) {
        setError(err.response?.data?.detail || 'Invalid username or password');
      }
    }
  };

  return (
    <div style={{ maxWidth: '380px', margin: '60px auto', padding: '24px', border: '1px solid #333', borderRadius: '8px', background: '#1e1e1e', color: '#fff', fontFamily: 'sans-serif' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>{isRegister ? 'Register Account' : 'Task Manager Login'}</h2>
      
      {error && <p style={{ color: '#ff6b6b', fontSize: '14px', textAlign: 'center' }}>{error}</p>}
      {message && <p style={{ color: '#51cf66', fontSize: '14px', textAlign: 'center' }}>{message}</p>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input 
          placeholder="Username" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          required 
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #444', background: '#2a2a2a', color: '#fff' }}
        />
        {isRegister && (
          <input 
            type="email"
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #444', background: '#2a2a2a', color: '#fff' }}
          />
        )}
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #444', background: '#2a2a2a', color: '#fff' }}
        />
        <button type="submit" style={{ padding: '10px', borderRadius: '4px', border: 'none', background: '#646cff', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
          {isRegister ? 'Sign Up' : 'Sign In'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px', color: '#aaa' }}>
        {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
        <span 
          onClick={() => { setIsRegister(!isRegister); setError(''); setMessage(''); }} 
          style={{ color: '#646cff', cursor: 'pointer', textDecoration: 'underline' }}
        >
          {isRegister ? 'Login here' : 'Register here'}
        </span>
      </p>
    </div>
  );
}